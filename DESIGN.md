# SlideX Design System (Curvable Architecture)

This document defines the exact constraints, colors, and layout patterns needed to replicate the Curvable.ai architecture, customized with a Royal Blue brand color.

## 1. Brand Tokens & Colors
- **Brand Primary**: Royal Blue `#3b82f6` (Replaces Curvable's Orange)
- **Background Root**: `#1c1c1c`
- **Background Surface (Cards/Video containers)**: `#0d0d0d`
- **Background Secondary Surface**: `#272725`
- **Text Primary**: `#fcfbf8`
- **Text Secondary**: `#cdcac4`
- **Borders**: `rgba(255,255,255,0.1)` or `#272725`

## 2. Layout & Structure (Curvable Mimic)
- **Navigation**: Floating pill navigation `fixed left-1/2 -translate-x-1/2 top-4`. Blurred background `rgba(15, 15, 18, 0.55)` with `backdrop-filter: blur(20px) saturate(1.4)`.
- **Hero Section**:
  - `min-height: 100vh` equivalent, large `padding-top: clamp(120px, 22vh, 240px)`.
  - Massive centered H1 `font-size: clamp(40px, 6vw, 72px)`, `tracking-[-1.4px]`.
  - Subtitle centered, `color: #cdcac4`.
  - A massive `16:9` video element immediately beneath the text, enclosed in `#0d0d0d` with `border: 1px solid #272725` and `rounded-2xl`.
- **Typography**: 
  - Tight letter-spacing (`tracking-tight` or `-1px`).
  - San-serif, clean UI font (e.g. Inter/Geist).

## 3. UI Elements
- **Buttons**:
  - Primary: Solid Royal Blue `#3b82f6`, white text, `rounded-full`, `px-6 py-3`.
  - Secondary: Transparent with `border-white/10`, white text.
- **Glass Effects**:
  - Used sparingly, primarily on the Nav Pill and floating playback buttons.
- **Grids**:
  - Feature grids use `grid-cols-1 md:grid-cols-3`.
  - Split views use `grid-cols-1 lg:grid-cols-[1.15fr_1fr]`.
  - Card borders are `#272725`, card backgrounds are `#272725` with inner content `#0d0d0d`.
