# 實作計畫：Briefly Review MCP 整合開發 (Slidex Briefly Builder MCP)

本計畫旨在將「Briefly 核心審查功能」整合至現有的 `Slidex Motion Doc MCP Server` 中，打造一個兼具「產出 (Studio/Builder)」與「審查 (Briefly/Review)」雙重能力的終極 AI 工作站。

## User Review Required

> [!IMPORTANT]  
> 請確認以下 Review Profile (審查情境) 的優先級。第一版 MVP 建議先實作「A. 課程企劃審查」與「B. 設計物審查(文字結構版)」，後續再擴充圖片視覺檢查。
> 同時，這些規則庫（Rubrics）將會以 Markdown 格式存放，方便你隨時擴充與修改。

## Open Questions

1. **檔案解析策略**：對於第一版 MVP 的 `briefly_review_asset`，如果是審查網頁 (URL)，你傾向我們先在 MCP 內建簡單的 HTML 轉 Markdown 工具（例如使用 `cheerio` + `turndown` 轉譯），還是讓外部 AI Client (如 Claude Desktop) 自己去抓取網頁內容再傳給我們？
   *💡 建議：前者 (由 MCP 內部抓取並清理 HTML)，能確保防護隱藏 Prompt (Prompt Injection)，並保證輸入給審查引擎的格式是乾淨的。*

2. **審查大腦的運作方式**：MCP 本身是 API 介面。當執行審查時，我們的 MCP Server 應該是負責「**組裝出完美的 Prompt (包含解析後的內容與規則庫) 交還給外部 AI 進行運算**」，還是「**MCP Server 內部自己呼叫 OpenAI/Anthropic API 來生成報告**」？
   *💡 建議：前者。這最符合 MCP 讓大型語言模型自己推理的設計哲學，且無需在專案中管理 API Key，完全借用使用者的 Claude 算力。*

## Proposed Changes

### 1. 核心審查規則庫 (Rubrics)
這些規則庫將作為 MCP Resources 開放給 AI 讀取，確保每次審查都有統一且高標準的指南。

#### [NEW] core/briefly/rubrics/course-planning.md
定義課程目標、受眾痛點、CTA 等企劃標準。

#### [NEW] core/briefly/rubrics/brand-guidelines.md
定義品牌素材專用規則（Logo 安全區、Course Label 等）。

---

### 2. Briefly MCP Tools 實作
實作審查相關的 MCP Tools，並與現有架構對接。

#### [NEW] mcp/brieflyMcp.ts
新增獨立檔案管理 Briefly 的 Tools、Resources 與 Prompts。
- 實作 `registerBrieflyMcp(server)` 函數。
- **Tool**: `briefly_review_asset` (接收 URL 或 Markdown 內容，指定 Review Profile)。
- **Tool**: `briefly_extract_structure` (抽取文件大綱/頁面架構)。
- **Resource**: 提供 `briefly://rubrics/*` 讓 AI 隨時讀取審查標準。

#### [MODIFY] mcp/server.ts
將 Briefly 的功能註冊進主 Server 中，完成合併。將增加以下匯入與執行邏輯：
```typescript
import { registerBrieflyMcp } from "./brieflyMcp";
// ...
registerBrieflyMcp(server);
```

---

### 3. 核心業務邏輯 (Core Logic)
將檔案解析與清理的邏輯抽離，以便未來前端產品頁 (`BrieflyLandingPage`) 若需要直接 call API 也能共用。

#### [NEW] core/briefly/application/brieflyEngine.ts
- 實作防護機制 (移除 scripts, hidden inputs 等風險內容)。
- 負責將不同來源轉換為統一的純文字或 Markdown 結構，供審查使用。

## Verification Plan

### Automated Tests
- 執行 `npm run dev` 或使用 MCP Inspector 啟動 Server。
- 確認 `briefly_review_asset` 與 `briefly_extract_structure` 等新 Tools 成功出現在清單中。
- 確認 `briefly://rubrics/course-planning` 等資源可被正確讀取。

### Manual Verification
- 將更新後的 MCP Server 掛載至 Claude Desktop。
- 輸入測試對話：「請幫我用品牌規範審查這個網站內容 (給予網址)」，觀察 AI 是否能：
  1. 正確呼叫 `briefly_review_asset` 工具。
  2. 讀取到指定的 `brand-guidelines.md` 規則。
  3. 產出固定且專業的 Markdown 分數與修改建議報告。
