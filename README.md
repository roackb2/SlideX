# SlideX

MotionDoc is a document-to-motion prototype for validating MDX as a motion document format. It now includes a product intro website, documentation resources, a reusable template library, and a Studio editor with live Framer Motion preview.

This is intentionally not a full video editor. There is no auth, database, billing, asset management, audio editing, timeline editor, cloud rendering, or MP4 export in this MVP.

## Project Structure

```text
.
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── resources/
│   │   └── page.tsx
│   ├── studio/
│   │   └── page.tsx
│   └── templates/
│       └── page.tsx
├── components/
│   ├── MotionDocApp.tsx
│   ├── PreviewPane.tsx
│   ├── SiteNav.tsx
│   └── motion-blocks.tsx
├── docs/
│   └── USAGE.zh-TW.md
├── lib/
│   ├── defaultMdx.ts
│   ├── mdxStats.ts
│   ├── resources.ts
│   └── templates.ts
├── next.config.mjs
├── package.json
├── postcss.config.cjs
├── tailwind.config.ts
└── tsconfig.json
```

## Setup

```bash
npm install
npm run dev
```

Open:

- Intro website: `http://localhost:3000`
- Documentation resources: `http://localhost:3000/resources`
- Template library: `http://localhost:3000/templates`
- MotionDoc Studio editor: `http://localhost:3000/studio`

For detailed instructions, see [docs/USAGE.zh-TW.md](docs/USAGE.zh-TW.md).

## Mac Desktop App

The project includes a Tauri shell for the offline Mac editor build. The desktop
app opens the Studio route by default and uses the static Next.js export from
`out/`.

```bash
npm run tauri:dev
npm run tauri:build
```

Build outputs:

- `.app`: `src-tauri/target/release/bundle/macos/SlideX.app`
- `.dmg`: `src-tauri/target/release/bundle/dmg/SlideX_0.1.0_aarch64.dmg`

Production builds use `next build --webpack` because the current Next/Turbopack
build hits a local process/port limitation in this environment.

The Mac app shows a desktop start screen before entering the editor. Native File
menu actions are wired to the editor:

- New Project
- Open Project
- Save
- Export HTML
- Export MDX

Saved or opened projects are stored in the desktop recent-project list and are
shown on the start screen on the next launch.

App and project icons are generated from source SVGs with:

```bash
npm run icons:tauri
```

The icon set intentionally does not reuse the website logo. It generates the
desktop app icon plus a separate `.slidex` project icon.

Local projects are saved as `.slidex` folders:

```text
My Deck.slidex/
├── manifest.json
├── document.mdx
├── assets/
└── exports/
```

The first desktop implementation stores the editable deck source in
`document.mdx`; `assets/` and `exports/` are reserved for the upcoming local
asset library and export outputs.

## What Is Included

- Next.js, React, TypeScript, and Tailwind CSS
- Public website introduction page
- Documentation resources route
- Template library route and shared template data
- Purpose-built MotionDoc parser for the supported scene and motion blocks
- Framer Motion powered preview blocks
- Studio editor with template loading, snippet insertion, copy, replay, and live preview
- Custom MDX components:
  - `Scene`
  - `Title`
  - `Text`
  - `Card`
  - `ImageBlock`
  - `CTA`
- Enter animations:
  - `fadeIn`
  - `fadeUp`
  - `zoomIn`
  - `slideLeft`

## Motion Component Props

All animated blocks support:

```tsx
enter?: "fadeIn" | "fadeUp" | "zoomIn" | "slideLeft";
delay?: number;
duration?: number;
```

Defaults:

- `enter`: `fadeUp`
- `delay`: `0`
- `duration`: `0.6`

`Scene` accepts:

```tsx
duration: number;
```

## Future MP4 Export Direction

MP4 export is not implemented yet, but the code leaves clear extension points:

- `Scene duration` can map to a future video timeline duration.
- `PreviewPane` can become the browser recording surface.
- A server-side renderer or FFmpeg pipeline can consume the same MDX scene tree.
- A future export panel can calculate total duration, scene count, FPS, and aspect ratio before rendering.

The current MVP keeps the architecture simple: MDX is the source document, React components are motion blocks, and Framer Motion powers the interactive preview.
