# SlideX MotionDoc 使用指南

SlideX MotionDoc 是一套以 MDX Slide 為核心的動態簡報格式。你可以用文字描述每一頁的版面、內容、動畫節奏與媒體，再交給 Studio 預覽、調整與匯出。

## 快速開始

```bash
npm install
npm run dev
```

常用路由：

- Website: `http://localhost:3000`
- Resources: `http://localhost:3000/resources`
- Templates: `http://localhost:3000/templates`
- Studio: `http://localhost:3000/studio`

## Studio 工作流

Studio 由幾個核心區域組成：

- **Slide list**：切換、排序與管理每一頁。
- **MDX editor**：直接編輯 MotionDoc source。
- **Preview canvas**：即時預覽目前 Slide 的版面與動畫。
- **Timeline / inspector**：調整時間、位置、尺寸、字體與區塊屬性。
- **Snippets**：插入目前支援的 Slide、Text、Icon、Chart、ImageBlock 與 VideoBlock 範例。

## Slide 概念

每一個 `<Slide>` 代表一個可播放的簡報頁面，`duration` 會對應到播放與匯出時間軸。

```mdx
# Quarterly Review

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Text enter="fadeUp" fontSize={72} fontWeight={800} x={8} y={18} w={72} h={18}>
    Launch Review
  </Text>
  <Text enter="fadeUp" delay={0.2} fontSize={24} x={8} y={42} w={58} h={16}>
    一頁一個 Slide，區塊負責內容與節奏。
  </Text>
</Slide>
```

## 目前支援的 MDX 元件

### `<Slide>`

Timed page container。每個 Slide 應該有 `duration`，也可以設定 `theme`、`background`、`accent` 等外觀屬性。

```mdx
<Slide duration={6} theme="light" background="#f8fafc" accent="#2563eb">
  ...
</Slide>
```

### `<Text>`

主要文字元件，負責標題、段落、註解與文字型數字。新版寫法以 `Text` 搭配 `fontSize`、`fontWeight`、`x/y/w/h` 取代舊的 `Title`、`Metric` 類型。

```mdx
<Text enter="fadeUp" fontSize={64} fontWeight={800} x={8} y={14} w={70} h={16}>
  Growth review
</Text>
```

### `<Icon>`

顯示 Lucide icon，常用於重點、流程、功能卡片或視覺提示。

```mdx
<Icon icon="Sparkles" size={96} strokeWidth={2} x={8} y={32} w={12} h={18} />
```

### `<Chart>`

用 props 描述圖表資料。`labels` 與 `values` 使用逗號分隔字串。

```mdx
<Chart title="Pipeline quality" labels="Q1,Q2,Q3,Q4" values="42,58,73,91" chartType="bar" x={38} y={48} w={50} h={34} />
```

### `<ImageBlock>`

顯示圖片，可搭配 `fit`、`radius` 與 frame props。

```mdx
<ImageBlock src="https://example.com/product.png" alt="Product screenshot" fit="cover" radius={18} x={52} y={16} w={40} h={56} />
```

### `<VideoBlock>`

顯示影片，可設定 `controls`、`loop`、`muted`。

```mdx
<VideoBlock src="https://example.com/demo.mp4" controls="true" muted="true" x={10} y={22} w={80} h={56} />
```

## 動畫與版面 Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `enter` | `string` | 進場動畫，例如 `fadeIn`、`fadeUp`、`zoomIn`、`slideLeft`。 |
| `delay` | `number` | 進場延遲秒數。 |
| `duration` | `number` | Slide 長度或區塊動畫時間。 |
| `x` / `y` | `number` | 百分比座標位置。 |
| `w` / `h` | `number` | 百分比寬高。 |
| `fontSize` | `number` | 文字尺寸。 |
| `fontWeight` | `number` | 文字粗細。 |

## 完整範例

```mdx
# Quarterly Business Review

<Slide duration={6} theme="dark" accent="#8ea5ff" background="#050505">
  <Text enter="fadeUp" fontSize={72} fontWeight={800} x={8} y={12} w={64} h={18}>
    Growth review
  </Text>
  <Text enter="fadeUp" delay={0.2} fontSize={24} x={8} y={34} w={52} h={16}>
    Focus the conversation on momentum, risk, and the next decision.
  </Text>
  <Text enter="fadeUp" delay={0.3} fontSize={56} fontWeight={800} x={8} y={58} w={28} h={12}>
    +42%
  </Text>
  <Text enter="fadeUp" delay={0.34} fontSize={18} x={8} y={72} w={28} h={10}>
    Trailing twelve-month ARR growth.
  </Text>
  <Chart title="Pipeline quality" labels="Q1,Q2,Q3,Q4" values="42,58,73,91" height={144} enter="fadeUp" delay={0.35} x={40} y={52} w={48} h={34} />
</Slide>
```

## MCP Server

SlideX 也提供 MCP server，讓支援 MCP 的 agent 建立、驗證、修改與匯出 MotionDoc。

```bash
npm run mcp
```

stdio client 建議使用 silent 啟動：

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

## 技術架構

- Parser: `core/motion-doc/domain/motionDocParser.ts`
- Serializer: `core/motion-doc/application/motionDocSerialize.ts`
- Automation tools: `core/motion-doc/application/motionDocAutomation.ts`
- Export adapter: `core/motion-doc/infrastructure/export/motionDocExport.ts`
- MCP server: `mcp/server.ts`

## 匯出方向

SlideX 的匯出路徑以同一份 MDX Slide tree 為基礎：

1. `Slide duration` 對應 timeline segment。
2. Preview canvas 可作為 browser capture target。
3. Export adapter 可把 MotionDoc 轉成 standalone HTML player。
4. 後續可延伸 headless render 與 MP4 pipeline。
