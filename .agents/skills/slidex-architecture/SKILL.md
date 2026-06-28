---
name: slidex-architecture
description: Enforce SlideX project architecture and refactoring discipline. Use when Codex adds files, moves files, refactors React/Tauri code, changes imports, creates shared logic, updates eslint-plugin-boundaries rules, or decides whether code belongs in common/lib, common/ui, common/util, core/motion-doc, or features/*.
---

# SlideX Architecture

## Purpose

Keep SlideX organized under domain-driven design, SOLID, DRY, and `eslint-plugin-boundaries`. Before adding or moving files, decide ownership first; do not put reusable code into a generic dumping ground.

## Required Workflow

1. Inspect the existing import direction and nearby patterns before editing.
2. Classify the code by ownership:
   - App route composition
   - Global common code
   - MotionDoc core domain
   - Feature-specific domain/application/infrastructure/ui
3. Put new files in the matching layer below.
4. Update imports to point to the new owner.
5. Run `npm run lint` after architecture changes.
6. Run `npm run build` after moving files, changing public APIs, or touching React/Tauri boundaries.

## Folder Ownership

Use these folders exactly:

```txt
app/
  Next route composition only. No domain logic, no Tauri logic.

common/
  lib/   Cross-feature libraries and providers, such as i18n.
  ui/    Cross-feature reusable UI, such as SiteNav or SiteFooter.
  util/  Framework-light utilities with no SlideX domain knowledge.

core/
  motion-doc/
    domain/          Domain types, parser, value rules, frame rules.
    application/     Use cases, commands, serializers, factories.
    infrastructure/  Technical adapters/export/runtime details.
    presets/         Templates, seed data, default MDX, shader presets.

features/
  <feature>/
    domain/          Feature-owned domain data.
    application/     Feature use cases, interaction commands, non-UI decisions.
    infrastructure/  Tauri, localStorage, filesystem, browser/platform adapters.
    ui/              React components and UI hooks.
    index.ts         Public API consumed by app routes.
```

## Placement Rules

- If code does not know SlideX or MotionDoc, use `common/lib`, `common/ui`, or `common/util`.
- If code knows MotionDoc concepts, use `core/motion-doc`.
- If code only serves Pitch, use `features/pitch`.
- If code touches Tauri, localStorage, filesystem, or browser platform APIs, use `infrastructure`.
- If code is React rendering or UI interaction state, use `ui`.
- If code is a pure command, selector, or business decision, prefer `application`.
- If code defines domain types, parsing, frame/value rules, or invariants, use `domain`.
- Do not recreate root `components/` or root `lib/`.

## Import Direction

Preserve this direction:

```txt
app
  -> features/*/index
  -> common/*
  -> core/*/presets only when needed

features/*/ui
  -> features/*/application
  -> features/*/domain
  -> features/*/infrastructure
  -> core/*
  -> common/*

features/*/infrastructure
  -> features/*/application
  -> features/*/domain
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

Never make `core` import from `features` or `app`. Never make feature infrastructure import UI. Avoid cross-feature UI imports; move truly shared UI to `common/ui`.

## Refactoring Expectations

- Split large React files by responsibility before adding more behavior.
- For `features/pitch/ui/MotionDocApp.tsx`, prefer extracting to:
  - `features/pitch/ui/hooks/` for React state/effects.
  - `features/pitch/application/` for pure commands, shortcuts, selectors, flow normalization.
  - `features/pitch/infrastructure/` for Tauri/storage/platform code.
- For `features/pitch/ui/inspector/InspectorControls.tsx`, do not keep generic controls, color picker popovers, palette presets, swatch storage, and prop-field domain typing in one file. Prefer:
  - Keep `features/pitch/ui/inspector/InspectorControls.tsx` as a small facade that re-exports inspector controls and types.
  - `features/pitch/ui/inspector/controls/` for small reusable form controls such as field shells, text inputs, number inputs, selects, and segmented controls.
  - `features/pitch/ui/inspector/color/` for color picker UI, palette UI, color swatch UI, and color-specific React hooks.
  - `features/pitch/infrastructure/` for browser storage adapters such as custom swatch persistence.
  - `features/pitch/application/` for pure color normalization, dedupe, palette application decisions, or type guards that do not render React.
- Keep public route imports clean: `app/*` should usually import from `features/<feature>` or `common/ui`, not from deep feature UI paths.
- Keep changes scoped. Do not rename/move unrelated files just to make the tree look symmetrical.
- When introducing a new layer folder, update `eslint.config.mjs` boundaries rules in the same change.

## TypeScript Expectations

- Prefer named prop types or exported public types for React components once props exceed a few fields. Avoid large anonymous inline prop objects in component signatures.
- Model finite UI values as literal unions derived from `as const` arrays, for example palette scope, layout modes, align modes, and segmented-control values. Do not widen them to plain `string` unless the value truly accepts arbitrary text.
- Use `satisfies` for preset/config arrays so objects keep literal inference while still being checked against the intended shape.
- Avoid broad `Record<string, string | number>` at UI boundaries when a narrower prop type or discriminated union is available. Keep broad records only at the parser/serializer boundary where MotionDoc props are intentionally dynamic.
- Prefer named type guards and parser helpers over inline `filter((x): x is T => ...)` when the same validation concept can be reused.
- Type style helpers as `CSSProperties` or a named style-return type when returning React style objects.
- Keep browser/runtime data validation explicit. Anything loaded from `localStorage`, files, or Tauri should be parsed through a small typed adapter before UI components consume it.
- When extracting reusable generic controls, allow option value generics where useful: `Option<T extends string>` and `onChange: (value: T) => void` preserve narrow unions better than `string`.

## Boundaries Checklist

Before finishing:

```bash
npm run lint
npm run build
```

If `eslint-plugin-boundaries` fails, fix the architecture rather than disabling the rule. Only relax boundaries when the architecture decision is intentional, documented, and still keeps dependency direction clear.
