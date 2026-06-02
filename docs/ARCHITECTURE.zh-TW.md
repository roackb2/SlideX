# Architecture

這個專案採用 domain-driven 的分層方式，目標是避免 Next/React UI、Tauri API、MDX domain 邏輯混在同一層。

## Layers

- `app/`: Next route composition。只組裝頁面，不放 domain 邏輯。
- `common/lib/`: 跨 feature 的 library/context，例如 i18n。
- `common/ui/`: 跨 feature 共用 UI，例如 site navigation/footer。
- `common/util/`: 無框架依賴的小工具。
- `core/<domain>/domain/`: domain types、parser、value/domain rules。不可依賴 React、Tauri、feature。
- `core/<domain>/application/`: 操作 domain 的 use case / command / serializer。
- `core/<domain>/infrastructure/`: domain 對外輸出或技術細節，例如 HTML export runtime。
- `core/<domain>/presets/`: domain seed data、templates、presets。
- `features/<feature>/domain/`: feature 內專屬 domain data。
- `features/<feature>/application/`: feature 內 use case、interaction command、非 UI 決策。
- `features/<feature>/infrastructure/`: feature 內接外部能力，例如 Tauri、localStorage。
- `features/<feature>/ui/`: React components、hooks、interaction UI。
- `features/<feature>/index.ts`: feature public API。`app/` 優先從這裡 import。

## Dependency Direction

```txt
app
  -> features/*/index
  -> common/*
  -> core/*/presets

features/*/ui
  -> features/*/domain
  -> features/*/application
  -> features/*/infrastructure
  -> core/*
  -> common/*

features/*/infrastructure
  -> features/*/domain
  -> features/*/application
  -> core/domain or core/application
  -> common/util

features/*/application
  -> features/*/domain
  -> core/domain or core/application
  -> common/util

core/*/infrastructure
  -> core/*/application
  -> core/*/domain

core/*/application
  -> core/*/domain

core/*/domain
  -> common/util only when needed
```

`eslint-plugin-boundaries` enforces these rules in `eslint.config.mjs`.
