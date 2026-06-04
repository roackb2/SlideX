# SlideX

SlideX 是一個以 MDX scene 為核心的動態簡報系統。它把簡報內容、版面、動畫節奏、預覽與桌面專案流程放在同一個可維護的程式碼結構裡。

目前版本包含：

- public website：產品首頁、文件、範本頁、下載頁
- web Studio：MDX 編輯、圖層、Inspector、即時 preview、template/snippet
- Tauri desktop shell：離線 Mac Studio、專案開啟/儲存、最近專案、匯出入口
- MotionDoc core：parser、serializer、freeform frame rules、export runtime、presets
- DDD/SOLID/DRY layer refactor：以 `app/`、`common/`、`core/`、`features/` 分層
- `eslint-plugin-boundaries`：用 lint 固定 import direction

這還不是完整影片剪輯器。現在沒有 auth、database、billing、雲端 rendering、audio editor、完整 MP4 export pipeline；目前重點是「可編輯、可預覽、可維護」的 motion document workflow。

## Quick Start

```bash
npm install
npm run dev
```

開啟：

- Website: `http://localhost:3000`
- Resources: `http://localhost:3000/resources`
- Templates: `http://localhost:3000/templates`
- Studio: `http://localhost:3000/studio`

Production build：

```bash
npm run build
npm run start
```

品質檢查：

```bash
npm run lint
```

## Desktop App

SlideX 內建 Tauri desktop shell。桌面版預設開啟 `/studio/`，使用 Next static output。

### 安裝方式 (macOS)

推薦使用 Homebrew 安裝（自動處理 Gatekeeper 安全性限制，安裝後可直接開啟）：

```bash
brew install --cask zz41354899/slidex/slidex
```

詳細 Homebrew Cask 設定與源碼請參考 [homebrew-slidex 倉庫](https://github.com/zz41354899/homebrew-slidex)。

### 開發與建置

```bash
npm run tauri:dev
npm run tauri:build
```

icon 來源由 SVG 產生：

```bash
npm run icons:tauri
```

`.slidex` 專案格式：

```text
My Deck.slidex/
├── manifest.json
├── document.mdx
├── assets/
└── exports/
```

目前桌面版已支援：

- New Project
- Open Project
- Save Project
- recent project list
- Export HTML
- Export MDX

## Architecture

新版架構採用 domain-driven layering。不要再新增 root `components/` 或 root `lib/`。

```text
app/
  Next route composition only.

common/
  lib/    Cross-feature libraries and providers.
  ui/     Cross-feature reusable UI.
  util/   Framework-light utilities.

core/
  motion-doc/
    domain/          Domain types, parser, frame/value rules.
    application/     Commands, serializers, factories, stats.
    infrastructure/  Export/runtime adapters.
    presets/         Default MDX, templates, shader presets.

features/
  docs/
    domain/
    ui/
    index.ts

  marketing/
    ui/
    index.ts

  studio/
    application/
    infrastructure/
    ui/
    index.ts
```

`app/*` 應優先 import feature public API，例如：

```ts
import { MotionDocApp } from "@/features/studio";
import MdxDocsShell from "@/features/docs";
import { HomePage } from "@/features/marketing";
```

詳細規則見 [docs/ARCHITECTURE.zh-TW.md](docs/ARCHITECTURE.zh-TW.md)。

## Boundaries

`eslint-plugin-boundaries` 在 [eslint.config.mjs](eslint.config.mjs) 中限制 import direction。

核心原則：

- `app/` 只做 route composition。
- `common/` 只能放跨 feature 共用能力。
- `core/motion-doc/domain` 不依賴 React、Tauri、features。
- `features/*/application` 放非 UI 決策與 commands。
- `features/*/infrastructure` 放 localStorage、Tauri、filesystem、browser adapter。
- `features/*/ui` 放 React components、UI hooks、interaction state。
- shared 邏輯先判斷 ownership，不把東西丟進 generic dumping ground。

每次移動檔案、改 public API、或新增 feature 後都應跑：

```bash
npm run lint
npm run build
```

## Studio Structure

Studio 是目前最重要的 feature，拆成：

```text
features/studio/
├── application/
│   ├── motionDocCommands.ts
│   ├── previewCanvas.ts
│   ├── previewProps.ts
│   ├── colorPalettes.ts
│   └── themeColors.ts
├── infrastructure/
│   ├── customSwatches.ts
│   ├── customThemes.ts
│   ├── recentProjects.ts
│   └── tauriProject.ts
└── ui/
    ├── MotionDocApp.tsx
    ├── StudioWorkspace.tsx
    ├── PreviewCanvas.tsx
    ├── inspector/
    ├── preview/
    ├── hooks/
    └── workspace/
```

設計方向：

- `MotionDocApp.tsx`：整體 state orchestration。
- `StudioWorkspace.tsx`：workspace composition。
- `PreviewCanvas.tsx`：canvas interaction orchestration。
- `inspector/InspectorControls.tsx`：小型 facade。
- color/theme storage 放 `infrastructure`。
- frame、selection、palette、preview prop normalization 放 `application`。

## MotionDoc Components

目前 parser 支援的主要 scene/block：

- `Slide` / `Scene`
- `Title`
- `Text`
- `Card`
- `Metric`
- `Chart`
- `ImageBlock`

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
│   ├── premiumBusinessTemplates.ts
│   ├── snippetTemplates.ts
│   ├── templateFactory.ts
│   └── templateTypes.ts
├── shaderPresets.ts
└── shaders/
    ├── shaderPresetFactory.ts
    ├── shaderCollections.ts
    ├── atmosphericShaderBodies.ts
    ├── motionShaderBodies.ts
    └── watercolorShaderBodies.ts
```

`templates.ts` 與 `shaderPresets.ts` 是 public facade；新增 preset 時請放到對應子模組，不要把大型資料重新塞回 facade。

## Development Rules

新增功能時請先描述：

- Goal：功能要解決什麼問題
- Scope：這次做什麼、不做什麼
- Owner：屬於 `core`、`common`、或哪個 `features/*`
- Layer：domain / application / infrastructure / ui
- Types：有限選項用 literal union、preset 用 `satisfies`
- Validation：至少跑 `npm run lint`，移動 API 或觸 React/Tauri 邊界時跑 `npm run build`

檔案原則：

- 儘量讓單一 `.ts/.tsx` 低於 500 行。
- 大 React component 優先拆 section、panel、hook、pure helper。
- browser/Tauri/localStorage 邏輯不要放 UI component 裡。
- UI option value 不要隨便放寬成 `string`。
- parser 邊界可以使用較寬的 record type；UI field 逐步收斂成更明確的型別。

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
npm run icons:tauri  # Generate Tauri icon assets
npm run tauri:dev    # Tauri development app
npm run tauri:build  # Tauri production app bundle
```

## Current Direction

SlideX 的方向是先把 MDX scene deck、Studio editor、desktop local project workflow 穩定下來。未來可延伸：

- local asset library
- richer export outputs
- MP4/render pipeline
- stronger block-specific typing
- more motion presets and shader controls
- project-level versioning and packaging
