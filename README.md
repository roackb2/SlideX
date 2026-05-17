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
