# SlideX

SlideX 是一個以 MDX Slide 為核心的動態簡報系統。它把簡報內容、版面、動畫節奏、預覽與桌面專案流程放在同一個可維護的程式碼結構裡。全新升級的 Pitch 介面採用 Double-Bezel 玻璃擬真（Glassmorphism）與高對比視覺美學，將開發工具的穩健與高階設計的質感完美融合。

目前版本包含：

- **Public Website**：採用高階美學設計的產品首頁、文件、範本頁、下載頁
- **Web Pitch**：包含 MDX 編輯覆蓋層 (`WorkspaceCodeEditorOverlay`)、圖層側邊欄 (`WorkspaceLayerSidebar`)、時間軸與屬性面板 (`WorkspaceInspectorPanel`)、頂部工作列 (`PitchHeader`) 以及即時預覽畫布 (`PreviewCanvas`)。
- **MotionDoc Core**：MDX Parser、serializer、自由版面座標系統、預設範本
- **Architecture**：以 `app/`、`common/`、`core/`、`features/` 為基礎的 Domain-Driven Layering
- **Boundaries**：使用 `eslint-plugin-boundaries` 用 lint 嚴格固定 import 方向

目前的重點是建立一個「可編輯、可預覽、可維護」且視覺頂尖的 MDX 動態簡報流程。

## Quick Start

```bash
npm install
npm run dev
```

開啟：

- Website: `http://localhost:3000`
- Resources: `http://localhost:3000/resources`
- Templates: `http://localhost:3000/templates`
- Pitch: `http://localhost:3000/pitch`

Production build：

```bash
npm run build
npm run start
```

品質檢查：

```bash
npm run lint
```

MCP server：

透過 npx 直接啟動：
```bash
npx -y @z7589xxz758/slidex-mcp-server
```

本地開發啟動：
```bash
npm run mcp
```

使用方式見 [docs/MCP.zh-TW.md](docs/MCP.zh-TW.md)。

## Architecture

新版架構採用 Domain-Driven Layering。請遵守以下規則：

```text
app/
  Next route composition only. (不包含商業邏輯或 UI 實作)

common/
  lib/    跨 feature 的 libraries 和 providers (例如 i18n)。
  ui/     跨 feature 共用的可重用高階 UI。
  util/   輕量級 utility。

core/
  motion-doc/
    domain/          Domain types, parser, frame/value rules。
    application/     Commands, serializers, factories。
    infrastructure/  Export/runtime adapters。
    presets/         Default MDX, templates, shader presets。

features/
  docs/
    domain/
    ui/
    index.ts

  marketing/
    ui/
    index.ts

  pitch/
    application/
    infrastructure/
    ui/
    index.ts
```

`app/*` 應優先 import feature public API，例如：

```ts
import { MotionDocApp } from "@/features/pitch";
import MdxDocsShell from "@/features/docs";
import { HomePage } from "@/features/marketing";
```

詳細規則見 [docs/ARCHITECTURE.zh-TW.md](docs/ARCHITECTURE.zh-TW.md)。

## Boundaries

`eslint-plugin-boundaries` 在 `eslint.config.mjs` 中限制 import direction。

核心原則：

- `app/` 只做 route composition。
- `common/` 只能放跨 feature 共用能力。
- `core/motion-doc/domain` 不依賴 React、Tauri、features。
- `features/*/application` 放非 UI 決策與 commands。
- `features/*/infrastructure` 放 localStorage、Tauri、filesystem、browser adapter。
- `features/*/ui` 放 React components、UI hooks、interaction state。
- Shared 邏輯先判斷 ownership，不把東西丟進 generic dumping ground。

每次移動檔案、改 public API 或新增 feature 後都應跑：

```bash
npm run lint
npm run build
```

## Pitch Structure

Pitch 是目前最重要的 feature，目前採用全新的高階視覺工作區架構：

```text
features/pitch/
├── application/
│   ├── motionDocCommands.ts
│   ├── previewProps.ts
│   └── colorPalettes.ts
├── infrastructure/
│   ├── customThemes.ts
│   └── recentProjects.ts
└── ui/
    ├── MotionDocApp.tsx
    ├── PitchWorkspace.tsx
    ├── PitchHeader.tsx
    ├── PreviewCanvas.tsx
    └── workspace/
        ├── WorkspaceCodeEditorOverlay.tsx
        ├── WorkspaceLayerSidebar.tsx
        ├── WorkspaceInspectorPanel.tsx
        └── WorkspaceTemplateDialog.tsx
```

設計方向：

- `MotionDocApp.tsx`：整體狀態協調。
- `PitchWorkspace.tsx`：版面組合，整合 Toolbar、Sidebar、Panel 與 Editor Overlay。
- `WorkspaceCodeEditorOverlay.tsx`：取代原本的單一編輯器，成為漂浮式的高階 MDX 編輯視窗。
- Color/Theme storage 放 `infrastructure`。
- Frame、selection、palette、preview prop normalization 放 `application`。

## MotionDoc Components

目前對外文件與 MCP 支援的主要 Slide/block（已與最新版 Pitch 對齊）：

- `Slide`
- `Text`
- `Icon`
- `Chart`
- `ImageBlock`
- `VideoBlock`

常用 motion props：

```tsx
enter?: "fadeIn" | "fadeUp" | "zoomIn" | "slideLeft";
delay?: number;
duration?: number;
x?: number;
y?: number;
w?: number;
h?: number;
```

`x/y/w/h` 使用 percent frame coordinate，供 preview canvas、freeform layout、drag/resize 操作共用。

## Templates And Shaders

MotionDoc presets 位於：

```text
core/motion-doc/presets/
├── defaultMdx.ts
├── templates.ts
├── templates/
│   ├── commercialTemplates.ts
│   └── premiumBusinessTemplates.ts
├── shaderPresets.ts
└── shaders/
    └── shaderPresetFactory.ts
```

`templates.ts` 與 `shaderPresets.ts` 是 public facade；新增 preset 時請放到對應子模組，不要把大型資料重新塞回 facade。

## Development Rules

新增功能時請先描述：

- **Goal**：功能要解決什麼問題
- **Scope**：這次做什麼、不做什麼
- **Owner**：屬於 `core`、`common`、或哪個 `features/*`
- **Layer**：domain / application / infrastructure / ui
- **Types**：有限選項用 literal union、preset 用 `satisfies`
- **Validation**：至少跑 `npm run lint`，移動 API 或觸碰邊界時跑 `npm run build`

檔案與介面設計原則：

- **High-End UI First**：不要妥協於平庸的預設樣式。所有新介面必須嚴守 Double-Bezel（雙層邊框）、Glassmorphism（玻璃擬真）與平滑轉場 (`cubic-bezier(0.32, 0.72, 0, 1)`) 規範。
- 儘量讓單一 `.ts/.tsx` 低於 500 行。
- 大 React component 優先拆 section、panel、hook、pure helper。
- browser/localStorage 邏輯不要放 UI component 裡。
- UI option value 不要隨便放寬成 `string`。

## Useful Docs

- [Architecture](docs/ARCHITECTURE.zh-TW.md)
- [Usage](docs/USAGE.zh-TW.md)
- [Feature request skill](.agents/skills/slidex-feature-principles/SKILL.md)
- [Architecture skill](.agents/skills/slidex-architecture/SKILL.md)

## Scripts

```bash
npm run dev          # Next dev server with Turbopack
npm run dev:no-clean # Dev server without cleaning build cache
npm run build        # Next production build with webpack
npm run build:clean  # Clean then build
npm run start        # Start production Next server
npm run lint         # ESLint + boundaries
```

## Current Direction

SlideX 的方向是先把 MDX slide deck 與全新改版的 Pitch editor 穩定下來。未來可延伸：

- Local asset library
- Richer export outputs
- MP4/render pipeline
- Stronger block-specific typing
- Project-level versioning and packaging
