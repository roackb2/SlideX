# SlideX Supabase 單人 MVP 系統確認報告

日期：2026-07-14  
範圍：Supabase schema、RLS、RPC、Storage、訪客 Demo 匯入、簡報儲存與刪除、Agent session 整合

## 結論

目前資料模型已合併為一個 canonical migration：
`supabase/migrations/20260713000000_initial_slidex_schema.sql`。

就單人 MVP 範圍而言，資料表、程式端型別、Repository 呼叫與安全邊界一致。遠端
Supabase project 已確認四張核心資料表存在，官方 template catalog 也已同步為 13 筆。

正式公開前仍需補使用量限制；這不阻擋封閉 MVP，但不建議在沒有總容量、簡報數量、
每份簡報圖片數量與上傳頻率限制的情況下全面開放註冊。

## 1. 合併結果

- Migration 數量：1。
- 資料表：`official_templates`、`presentations`、`slide_comments`、`agent_sessions`。
- 外部系統資料：Supabase `auth.users` 與 private Storage bucket `presentation-images`。
- 明確不建立：workspace、membership、role、collaboration、AI message mirror、asset metadata。
- 原本的 recents、Agent session 與 CAS incremental migrations 已吸收到 initial schema。

若遠端 project 已經套用過被合併掉的 incremental migrations，不可直接推送這份重寫後的
history。部署前必須先在 Supabase project 中核對 applied migration history。

## 2. `presentations` 欄位確認

| 欄位 | 用途與限制 | 寫入者 |
| --- | --- | --- |
| `id` | UUID primary key | Database default |
| `user_id` | 擁有者，FK 到 `auth.users` | `auth.uid()` default |
| `title` | 1–240 字元 | 建立時 client；之後 CAS RPC |
| `source` | MotionDoc source，最多 2 MiB | 建立時 client；之後 CAS RPC |
| `source_revision` | 從 0 開始，避免 Editor 與 Agent 互相覆蓋 | CAS RPC 原子加 1 |
| `template_id` | 可選 official template FK | Client 可更新 |
| `guest_import_id` | 訪客 Demo 冪等匯入 UUID | 匯入 Route Handler |
| `last_opened_at` | Recents 排序，不影響修改時間 | `touch_presentation_opened()` |
| `created_at` | 建立時間 | Database default |
| `updated_at` | 文件實際修改時間 | Trigger |

目前不需要 `workspace_id`、`status`、`slide_count`、`thumbnail_url` 或任意 `metadata`
欄位；頁數與縮圖可以由 MotionDoc source／template 產生。

## 3. 寫入一致性

- Authenticated role 無法直接更新 `title`、`source`、`source_revision`。
- Editor 與 Agent 共用 `compare_and_swap_presentation_source()`。
- RPC 同時比對 `presentation_id`、`auth.uid()` 與預期 revision。
- 成功時 source 更新與 revision 加 1 發生在同一個 SQL statement。
- Revision 過期時回傳 PostgreSQL `40001`／`source_revision_conflict`，不覆寫較新內容。
- 開啟簡報只呼叫 `touch_presentation_opened()`，不會錯誤刷新 `updated_at`。
- 程式端 `supabasePresentationRepository.ts` 已讀取 revision、呼叫相同 RPC，並將
  `40001` 轉成明確的 conflict error。

## 4. 權限與 RLS

- 四張 public tables 全部啟用 RLS。
- Migration 先對 `anon`／`authenticated` 執行 `REVOKE ALL`，再以欄位級 grant 開放需要的能力。
- `service_role` 有明確 table grants 並可 bypass RLS，但只允許 server／Edge Function 使用。
- `presentations` INSERT 只允許 `title/source/template_id/guest_import_id`。
- Authenticated role 只可直接更新 `template_id`；文件內容必須走 CAS。
- `slide_comments` INSERT 不接受 client 指定 `id/user_id/timestamps`；UPDATE 只開放
  `body/is_resolved`。
- `agent_sessions` INSERT 只開放 `id/presentation_id/title`；UPDATE 只開放
  `title/message_count`。
- Comments 與 Agent sessions 的 RLS 都會再次確認其 presentation 屬於目前 `auth.uid()`。
- Active templates 可匿名讀取，但一般 client 沒有寫入權限。

## 5. Service Role 與刪除流程

Repository 掃描沒有發現 service-role／secret key 放入 `NEXT_PUBLIC_*`。前端環境只接受
Supabase URL 與 publishable key；`common/lib/supabase/env.ts` 也會拒絕 secret 或
`service_role` JWT。

Authenticated client 已撤除 `presentations.DELETE`，不能繞過圖片清理直接刪 row。
標準流程是：

1. Browser 呼叫 `delete-presentation` Edge Function。
2. Function 以 caller JWT 取得使用者並透過 RLS 驗證 presentation 所有權。
3. Function 只在 server runtime 讀取 `SUPABASE_SERVICE_ROLE_KEY`。
4. 先分頁列出並批次刪除 `<user-id>/<presentation-id>/` 內的圖片。
5. 圖片刪除成功後，以 `presentation_id + user_id` 刪除 presentation。
6. FK cascade 刪除 comments 與 Agent sessions。

若 Storage 刪除中途失敗，presentation row 會保留，使用者可以安全重試；這比先刪 row
更容易修復。仍建議日後加入定期 orphan scan，處理極端中斷或歷史殘留檔案。

## 6. Storage 安全

- Bucket 為 private。
- 單檔最大 10 MiB。
- 允許 AVIF、GIF、JPEG、PNG、WebP；SVG 已移除。
- Path 必須是 `<user-id>/<presentation-id>/<uuid>.<trusted-extension>`。
- RLS 驗證 user folder、presentation ownership、固定層數、UUID filename 與副檔名。
- 程式端用 UUID 產生檔名，`upsert = false`，不使用使用者原始檔名。

目前只有限制單檔大小，沒有 per-user aggregate quota、每份簡報圖片數、簡報總數與短時間
上傳次數限制。這是正式公開前的最高優先剩餘項目。

## 7. 訪客 Demo 與登入後保存

- 訪客草稿保存在 browser localStorage，不允許 anonymous insert。
- 登入成功後 Route Handler 用 server cookie/JWT 再驗證一次使用者。
- Request 只接受 `importId/title/source/templateId`，並限制 source 約 2 MiB。
- `(user_id, guest_import_id)` unique constraint 讓 OAuth callback 或網路重試具備冪等性。
- `id/user_id/revision/timestamps` 不由 client 指定。
- SQL 成功後才清除 local draft；失敗時可重試。

既有登入使用者的舊版 local presentations 會在 Workspace 首次載入時逐筆匯入 SQL。
每筆使用 deterministic import UUID 搭配 `(user_id, guest_import_id)` 去重；全部成功後才
清除舊 local records，因此中斷後可安全重試。

## 8. Agent 整合

- `presentations.source_revision` 已存在並由 CAS 控制。
- 一份 presentation 可有多筆 `agent_sessions`。
- `agent_sessions.id` 直接使用 Heddle conversation ID。
- Session 僅保存 title、message count 與 timestamps，不鏡像 Heddle message content。
- Editor 在 Heddle session 建立、還原、完成與狀態刷新時同步 `agent_sessions` metadata；
  刪除 conversation 時同步刪除 metadata。
- Agent backend 應轉送使用者 JWT 執行 session RLS 與 CAS，不應把 service-role key 交給 browser。

## 9. 驗證狀態

已完成的 repository 與遠端驗證：

- migration 目錄只剩一個 SQL 檔案。
- SQL 結構、FK、check constraints、RLS policies、column grants、RPC signatures 靜態核對。
- `database.types.ts` 與 presentation／Agent session 欄位及兩個 RPC 名稱一致。
- Workspace repository、訪客匯入 API 與刪除 Edge Function 呼叫路徑一致。
- Workspace list/create/duplicate/rename/delete、editor autosave、template ID、slide comments
  與 Agent session metadata 都已接到 Supabase；只保留訪客草稿及純 UI preference 在本機。
- 遠端 Data API 實測 `official_templates` 回傳 HTTP 200，catalog 為 13 筆，與 bundled
  MotionDoc deck IDs 一致。
- `delete-presentation` 遠端 endpoint 已部署；以無效、未登入請求驗證時正確回傳 401，
  未執行任何資料刪除。
- Repository 未發現 `NEXT_PUBLIC_*` service-role／secret key。
- SQL 靜態 assertion 全數通過：單一 migration、4 tables、4 個 RLS-enabled tables、
  CAS／revision／Agent session 存在、Storage 無 SVG、UUID path policy 存在、一般使用者
  無 presentation direct-delete grant、service role grants 存在。
- `npm test`：22/22 tests 通過。
- `npm run lint`：通過，0 errors。
- `npm run build`：Next.js 16.2.10 production build 通過；只有既有的 `metadataBase`
  fallback warning，不影響本次 Supabase 功能。
- `git diff --check`：通過。

## 10. 上線前驗收

遠端 baseline schema、13 筆 template catalog 與 `delete-presentation` Edge Function 已存在。
正式驗收仍應用有效測試帳號確認圖片先刪、資料列後刪的完整流程。

最後以兩個測試帳號確認：跨帳號 presentation／comment／session／image 全部不可讀寫、
CAS conflict 不覆寫、訪客匯入重試不重複、刪除簡報後 Storage folder 為空。
