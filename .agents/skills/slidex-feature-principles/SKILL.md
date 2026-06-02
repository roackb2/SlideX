---
name: slidex-feature-principles
description: Use when adding, planning, or refining new SlideX features, or when the user asks how to phrase future feature requests. Converts feature requests into a clear goal, scope, ownership, layer placement, TypeScript expectations, implementation checklist, and validation steps while preserving DDD, SOLID, DRY, eslint-plugin-boundaries, and the existing SlideX architecture.
---

# SlideX Feature Principles

## Purpose

When the user asks to add or change a feature, turn the request into a maintainable implementation path. The goal is not only "make it work"; the result must fit SlideX layers, stay easy to extend, and avoid recreating large mixed-responsibility files.

Use this skill together with `slidex-architecture` whenever code changes are required.

## Feature Request Contract

When a request is vague, infer safely from local context and ask only for details that materially change data shape, storage, Tauri behavior, or UX. A good internal brief contains:

- Goal: what user workflow improves.
- Scope: Studio, Inspector, PreviewCanvas, Export, Docs, Marketing, Tauri, or MotionDoc core.
- Data impact: whether MotionDoc MDX, parser, serializer, presets, export, localStorage, or filesystem changes.
- Layer owner: `app`, `common`, `core/motion-doc`, or `features/studio`.
- Validation: `npm run lint`; also `npm run build` for moved files, public APIs, React/Tauri boundaries, or TypeScript-heavy changes.

## User Prompt Pattern

If the user asks how to request future features, suggest this shape:

```md
I want to add a feature: <feature name>

Goal:
<What user workflow should improve?>

Scope:
- Affected area: Studio / Inspector / PreviewCanvas / Export / Docs / Tauri
- Does this need localStorage / file system / Tauri?
- Does this change the MotionDoc MDX format, parser, serializer, or export?

Architecture requirements:
- Follow slidex-feature-principles and slidex-architecture
- Preserve DDD / SOLID / DRY
- Respect eslint-plugin-boundaries
- Split large files; keep each file under 500 lines when practical

Validation:
- npm run lint
- npm run build
```

## Implementation Rules

- Do not put new behavior into `MotionDocApp.tsx` unless it is orchestration. Prefer hooks in `features/studio/ui/hooks`, pure commands in `features/studio/application`, and adapters in `features/studio/infrastructure`.
- Do not put large implementations into `InspectorControls.tsx`. Keep it as a facade. Put generic controls in `features/studio/ui/inspector/controls`, color UI in `features/studio/ui/inspector/color`, storage in `features/studio/infrastructure`, and pure color rules in `features/studio/application`.
- If behavior knows MotionDoc syntax, parsing, serialization, frames, presets, or export, place it under `core/motion-doc` instead of UI.
- If behavior is cross-feature and has no SlideX/MotionDoc knowledge, place it under `common/lib`, `common/ui`, or `common/util`.
- Keep public route files thin. `app/*` should compose features and shared UI, not own business logic.
- Prefer incremental extraction over broad rewrites. Avoid renaming unrelated files.

## TypeScript Rules

- Use named prop types once component props exceed a few fields.
- Preserve literal unions for finite options: `type Scope = "deck" | "slide"` or derive from `as const` arrays.
- For reusable controls, prefer generics such as `Option<T extends string>` and `onChange: (value: T) => void` instead of widening to `string`.
- Use `satisfies` for preset arrays and config objects.
- Keep `Record<string, string | number>` at MotionDoc parser/serializer boundaries. At UI boundaries, prefer narrower prop types, discriminated unions, or typed helpers when practical.
- Validate browser, file, localStorage, and Tauri data through typed adapters before UI consumption.

## Completion Checklist

Before finishing feature work:

1. Confirm files were placed in the right owner/layer.
2. Confirm large files were not made worse; split new mixed-responsibility code.
3. Confirm imports follow `eslint-plugin-boundaries`.
4. Run `npm run lint`.
5. Run `npm run build` when TypeScript, moved files, public APIs, React/Tauri boundaries, or export/parser code changed.
6. Report changed files and any validation that could not be run.
