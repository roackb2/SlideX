# SlideX MCP Server

SlideX 內建一個 stdio MCP server，可讓 MCP client 讀取、建立、修改、驗證與匯出 MotionDoc MDX。

## 啟動

```bash
npm run mcp
```

stdio client 建議用 `npm --silent run mcp`，避免 npm banner 輸出到 stdout。

MCP client 設定範例：

```json
{
  "mcpServers": {
    "slidex": {
      "command": "npm",
      "args": ["--silent", "run", "mcp"],
      "cwd": "/Users/zz41354899/Desktop/Animark"
    }
  }
}
```

## NPM 安裝模式

如果之後要發布成 npm package，建議讓 package 提供可執行的 bin。本專案已發布為 `@z7589xxz758/slidex-mcp-server`。

發布後的 MCP client 設定可以長這樣：

```json
{
  "mcpServers": {
    "slidex": {
      "command": "npx",
      "args": ["-y", "@z7589xxz758/slidex-mcp-server"]
    }
  }
}
```

`@z7589xxz758/slidex-mcp-server` 發布後可直接用 npx 啟動。若要支援全域安裝，建議先把 `mcp/server.ts` 編譯成 JavaScript，避免使用者環境需要 TypeScript runtime。

## GitHub 安裝模式

如果暫時不發布 npm，可以讓使用者 clone repo 後用 `cwd` 指到專案根目錄：

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
npm install
```

```json
{
  "mcpServers": {
    "slidex": {
      "command": "npm",
      "args": ["--silent", "run", "mcp"],
      "cwd": "/absolute/path/to/<repo>"
    }
  }
}
```

直接使用 `npx github:<owner>/<repo>` 也可以作為未來方向，但 repo 必須先設定好 package `bin`，否則 MCP client 不知道要啟動哪個檔案。

## Tools

- `slidex_parse_motion_doc`: 解析 MotionDoc MDX，回傳 slides、blocks、stats、validation。
- `slidex_validate_motion_doc`: 驗證 MotionDoc MDX。
- `slidex_list_templates`: 列出內建模板。
- `slidex_get_template`: 取得指定模板，可包含完整 MDX。
- `slidex_create_deck`: 用結構化大綱建立可編輯 SlideX MDX。
- `slidex_create_from_template`: 複製模板，並可替換標題與文字。
- `slidex_update_slide_props`: 更新單一 slide props。
- `slidex_replace_slide`: 用完整 `<Slide>...</Slide>` 取代指定 slide。
- `slidex_add_block`: 在指定 slide 新增目前支援的區塊：`Text`、`Image`、`Video`、`ChartBar`、`ChartLine`、`ChartArea`、`ChartPie`、`ChartDonut`、`Icon`。
- `slidex_list_slide_layouts`: 列出內建 layout presets，對應 Studio 的 Select Layout 面板。
- `slidex_get_slide_layout`: 取得指定 layout 的 MDX block source。
- `slidex_create_slide_from_layout`: 用 layout 建立完整 `<Slide>...</Slide>` source。
- `slidex_add_slide_from_layout`: 將 layout 產生的新 slide 加到現有 MotionDoc。
- `slidex_replace_slide_with_layout`: 用 layout 取代現有指定 slide。
- `slidex_delete_slide`: 刪除指定 slide。
- `slidex_reorder_slide`: 調整 slide 順序。
- `slidex_export_html`: 匯出 standalone HTML player。
- `slidex_list_block_types`: 列出可新增的 block types。

> 注意：舊版元件不會透過 MCP 的 `slidex_add_block` 新增，也不會出現在新的文件範例裡。

## Resources

- `slidex://templates`: 內建模板索引。
- `slidex://templates/{templateId}`: 指定模板的 MDX source。
- `slidex://slide-layouts`: 內建 layout preset 索引。
- `slidex://slide-layouts/{layoutId}`: 指定 layout 的 MDX block source。
- `slidex://defaults/blank.mdx`: 預設空白 MotionDoc。

## Built-in Slide Layouts

安裝 `@z7589xxz758/slidex-mcp-server` 後，MCP client 會直接擁有以下 16 個 Studio layout：

- `title`: Title, Body & Author
- `title-photo`: Title & Photo
- `title-alt-photo`: Title & Alternate Photo
- `title-bullets`: Title & Bullets
- `bullets`: Bullets
- `title-bullets-photo`: Title, Bullets & Photo
- `title-bullets-small-video`: Title, Bullets & Small Live Video
- `title-bullets-large-video`: Title, Bullets & Large Live Video
- `chapter`: Chapter
- `only-title`: Only Title
- `agenda`: Agenda
- `statement`: Statement
- `key-fact`: Key Fact
- `quote`: Quote
- `photos-3`: Photos - 3 on a page
- `photo`: Photo

## Prompt

- `slidex_deck_builder`: 引導 assistant 先產生簡報大綱，再呼叫 `slidex_create_deck`。
