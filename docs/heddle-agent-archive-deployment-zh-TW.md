# Heddle 對話壓縮封存：Supabase 部署與驗收

這份文件說明 Heddle 5.1 對話壓縮封存功能的合併順序、Supabase migration
部署方式、agent server 設定與驗收範圍。目標是讓長對話壓縮後的原始訊息、rolling
summary 與 manifest 跟既有 Heddle session 一樣，可在 server process／replica
更換後繼續使用。

## 這次變更包含什麼

兩個 repository 各自負責一個明確邊界：

1. **SlideX**：新增 server-only Supabase schema 與 atomic append RPC。
2. **slidex-agent-server**：升級至 `@roackb2/heddle@5.1.0`，並實作
   user-scoped `ChatArchiveRepository` adapter。

新增的 database objects：

- `public.agent_session_archives`：不可變的壓縮訊息與 rolling summary；
- `public.agent_session_archive_heads`：每個 user/session 的目前 manifest；
- `public.append_agent_session_archive(...)`：在同一個 PostgreSQL transaction
  內鎖定 parent/head、寫入 archive，並更新 manifest。

Browser 不會讀寫這些資料。只有 agent server 的 `service_role` 可以讀取，寫入則只能
透過上述 RPC 完成。

## 已完成的驗證

在獨立的 local Supabase stack 上已完成：

- 套用完整 migration chain；
- 正常 append 並回傳更新後的 manifest；
- duplicate archive rejection；
- malformed append transaction rollback；
- cross-user rejection；
- direct table update denial；
- 刪除 parent session 後 archive/head cascade；
- agent server 透過真實 Supabase HTTP/RPC 寫入後，由另一個全新的 Node process
  重新讀取 manifest 與 rolling summary；
- agent server 80 個 tests、typecheck 與 production build。

因此 Noct 不需要重新設計 table 或手動建立 database object；migration 是唯一的
authoritative schema。

## 合併與部署順序

請依照下列順序處理：

1. Review 並 merge **SlideX schema PR**。
2. 檢查 hosted Supabase 的 migration history。
3. 先將 SlideX migration 部署至 hosted Supabase。
4. Review 並 merge **slidex-agent-server PR**。
5. 部署新版 agent server。
6. 確認 schema 已存在後，才啟用 `HEDDLE_SESSION_STORAGE=supabase`。

Git merge 不會自動修改 hosted Supabase；migration 必須由部署者明確執行。

## Supabase 部署步驟

建議先對 staging project 執行。若直接使用既有 project，請先確認備份與 migration
history。從已 merge schema PR 的 SlideX checkout 執行：

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase migration list
npx supabase db push --dry-run
```

`--dry-run` 必須只顯示預期的新 migration：

```text
20260717083000_add_agent_session_archives.sql
```

如果 dry run 顯示舊 migration 需要重跑、遠端 history 不一致，或包含非預期的 destructive
change，請停止，不要直接 push；先修正 migration history。

確認 dry run 正確後再執行：

```bash
npx supabase db push
npx supabase migration list
```

可在 Supabase SQL Editor 進行不讀取使用者內容的結構檢查：

```sql
select
  to_regclass('public.agent_session_archives') is not null as archives_table_ready,
  to_regclass('public.agent_session_archive_heads') is not null as archive_heads_table_ready,
  to_regprocedure(
    'public.append_agent_session_archive(text,uuid,text,jsonb,jsonb,text,timestamptz)'
  ) is not null as append_rpc_ready;

select
  has_table_privilege(
    'authenticated',
    'public.agent_session_archives',
    'SELECT'
  ) as browser_can_read_archives,
  has_function_privilege(
    'service_role',
    'public.append_agent_session_archive(text,uuid,text,jsonb,jsonb,text,timestamptz)',
    'EXECUTE'
  ) as service_role_can_append;
```

預期第一個 query 的三個欄位都是 `true`；第二個 query 應為
`browser_can_read_archives = false`、`service_role_can_append = true`。

## Agent server 設定

新版 server 仍以 file storage 為預設值。Hosted Supabase 模式需要：

```env
AGENT_DRIVER=heddle
SLIDEX_PRODUCT_SESSION_STORAGE=supabase
HEDDLE_SESSION_STORAGE=supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<browser-auth verification key>
SUPABASE_SERVICE_ROLE_KEY=<server-only service role key>
```

Editor 與 agent server 必須使用同一個 Supabase project。不要把
`SUPABASE_SERVICE_ROLE_KEY` 放進 `NEXT_PUBLIC_*`、browser bundle、log、PR、截圖或聊天。

## 部署後 smoke check

1. 使用已登入的測試帳號開啟一份 Presentation。
2. 建立一個新 conversation 並完成一個正常 turn。
3. 再送一個 memory-dependent follow-up，確認既有 conversation context 可繼續使用。
4. 重新啟動 agent server 後再次繼續同一個 conversation。
5. 確認 server log 沒有 table、RPC、permission 或 manifest corruption error。
6. 長對話實際發生 compaction 後，確認 `agent_session_archive_heads` 有一筆對應 head，
   且 `agent_session_archives` 有相同 user/session scope 的 immutable archive。

一般短對話不一定會觸發 compaction；這不代表部署失敗。Archive-specific transaction
與 fresh-process recovery 已在 local Supabase integration acceptance 中驗證。

## Rollback

如果新版 server 在 hosted environment 發生 archive storage 問題：

1. 將 `HEDDLE_SESSION_STORAGE` 改回 `file`；
2. 重新部署 agent server；
3. 保留新增的 additive tables/RPC，不要在有資料時直接 drop；
4. 保存錯誤時間、session ID、PostgreSQL error code 與 server correlation ID，再進行修復。

這個 rollback 不會改動 `presentations.source`、browser-visible transcript 或既有
`agent_session_records`。
