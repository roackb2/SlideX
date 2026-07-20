# SlideX Marketing Site Design System

This document defines the design system for the SlideX marketing site (slidexdeck.com): the homepage, Download, Pricing, Docs, Blog, and the 404 page. It applies only to site pages (`features/marketing/`, `common/ui/Site*`) — not to the Pitch workspace/editor.

## 1. Positioning

SlideX is the presentation workspace for people and their AI. The site speaks to two audiences in distinct sections:

- **Presenters**: open the Live Demo, edit in the browser, export to PowerPoint.
- **AI builders**: connect any MCP-compatible client to create, inspect, edit, and export decks through SlideX MCP.

## 2. Brand Tokens

Tailwind tokens (defined in `app/globals.css` `@theme`, additive — workspace variables are untouched):

| Token | Value | Usage |
|---|---|---|
| `--color-canvas` | `#0a0b0d` | Page background (dark-first, entire site) |
| `--color-canvas-deep` | `#07080a` | Inset surfaces: code cards, browser frames |
| `--color-ink` | `#fcfbf8` | Primary text (`text-ink`, `text-ink/58`, `text-ink/38`) |
| `--color-accent` | `#c4ee87` | The single brand accent (lime). No other accent colors |
| `--color-accent-hover` | `#d7f5aa` | Accent hover state |
| `--color-on-accent` | `#0a1a00` | Text/icons placed on accent surfaces |

Surfaces: `white/3`, `white/5`, `white/8` fills. Borders: `white/8` hairline, `white/12` strong.

**Rule**: lime `#c4ee87` is the only accent. Legacy blues (`#79b6ff`, `#9ad7ff`) and royal blue `#3b82f6` are retired.

## 3. Typography

- **Geist Sans** (`font-sans`, already global): all display and body text. Display headings use `font-semibold`, tight tracking `[-0.03em … -0.06em]`, `leading-[0.98–1.05]`, `[text-wrap:balance]`.
- **Geist Mono** (`font-mono-geist`, added for the site): eyebrows, labels, code, terminal content, stats. Always uppercase with wide tracking (`tracking-[0.22em–0.32em]`) at `10–12px` for labels.

Scale (desktop): hero `clamp(42px,6vw,76px)`, section titles `clamp(30px,4.5vw,56px)`, body `15–17px` with `leading-7/8`.

## 4. Primitives

Shared components in `features/marketing/ui/primitives.tsx`:

- `MktgSection` — page section shell (`px-5 sm:px-7 lg:px-10`, `max-w-[1200px]` container)
- `Eyebrow` — mono label with lime tick
- `MktgPrimaryLink` — lime CTA button (`bg-accent`, `text-on-accent`, `rounded-md`, `active:translate-y-px`)
- `MktgGhostLink` — secondary outline button (`border-white/16`, `bg-white/[0.045]`)
- `MktgTextLink` — inline arrow link, lime on hover
- `CodeCard` — terminal-style code panel with copy button
- `BrowserFrame` — browser-chrome frame for real product screenshots
- `StatStrip` — hairline-divided stat row

Easing: `[0.16, 1, 0.3, 1]` (`mktgEase`). All motion must respect `useReducedMotion`.

## 5. Page Patterns

- **Dark-first**: every site page uses `bg-canvas` + `text-ink`. No light sections.
- **Hero**: mono eyebrow → large balanced H1 → supporting paragraph → dual CTA (primary lime + ghost) → product visual (`BrowserFrame` with a real screenshot).
- **Audience split**: paired cards labeled `FOR PRESENTERS` / `FOR AI BUILDERS` with mono eyebrows.
- **MCP sections**: terminal aesthetic — `CodeCard`, mono capability labels, hairline grid.
- **Final CTA**: full-bleed accent (`bg-accent`, `text-on-accent`) section may be used as the closing brand signature.
- **404**: "empty slide" metaphor — 16:9 slide frame containing `404`, bilingual via `useI18n`, primary CTA home + secondary Live Demo (`common/ui/SiteNotFound.tsx`).

## 6. Accessibility

- Every interactive element has a visible focus ring (accent-colored `focus-visible:outline`).
- Motion gated by `useReducedMotion`.
- Decorative visuals are `aria-hidden`; icon buttons have `aria-label`s.
- All copy is bilingual (EN / zh-TW) inline via `useI18n`, matching the existing site pattern.
