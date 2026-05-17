# Animark MotionDoc Usage Guide

This guide provides comprehensive instructions on how to set up, operate, and author motion documents using the Animark MotionDoc prototype.

## Introduction

Animark MotionDoc is a **document-to-motion prototype** designed to validate MDX as a format for defining motion graphics. It allows you to write structured content in MDX and see it instantly transformed into a polished, animated presentation.

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### Running the Project

Start the development server:

```bash
npm run dev
```

Once started, the following routes are available:

- **Product Intro**: [http://localhost:3000](http://localhost:3000) - Overview of the Animark concept.
- **Resources**: [http://localhost:3000/resources](http://localhost:3000/resources) - Technical documentation and roadmap.
- **Template Library**: [http://localhost:3000/templates](http://localhost:3000/templates) - Pre-built MDX examples.
- **MotionDoc Studio**: [http://localhost:3000/studio](http://localhost:3000/studio) - The interactive editor and previewer.

---

## The MotionDoc Studio

The Studio is the core of the Animark experience. It features a split-pane interface:

1.  **Top Bar**: Switch between built-in templates (Brand Intro, Product Launch, etc.).
2.  **Left Pane (Editor)**: A code editor for writing your MDX document.
3.  **Right Pane (Preview)**: A live-updating view of your animation scenes powered by Framer Motion.

### Studio Features

-   **Templates**: Quickly load predefined MDX structures to see what's possible.
-   **Snippets**: Click the buttons (e.g., `+ Scene`, `+ Card`) to insert common components at your cursor.
-   **Live Preview**: Changes in the editor are parsed in real-time.
-   **Replay**: Restarts the entry animations for the current document.
-   **Copy MDX**: Copies the current editor content to your clipboard.

---

## Authoring MotionDoc with MDX

MotionDoc uses a simplified MDX syntax to define your animation. Every document should start with a top-level H1 title (e.g., `# My Video`).

### The Scene Concept

The core unit of Animark is the `<Scene>`. Each scene represents a logical block of time or a specific "slide" in your motion sequence.

```mdx
<Scene duration={5}>
  ... components go here ...
</Scene>
```

-   **`duration`**: (Number) Defines the length of the scene in seconds. *Note: Currently used for visual reference and future export calculations.*

---

## Component Reference

All components (except `Scene`) support the [Animation Props](#animation-props).

### `<Title>`
Displays a large, impactful heading. Best used for main messages.
```mdx
<Title enter="fadeUp">The Future of Content</Title>
```

### `<Text>`
Used for body text or descriptions. Supports multi-line content.
```mdx
<Text delay={0.3}>
  Transforming structured documents into motion.
</Text>
```

### `<Card>`
A contained info block with a title and description.
```mdx
<Card
  title="Component Driven"
  text="Reusable blocks for faster production."
  enter="zoomIn"
/>
```

### `<ImageBlock>`
Displays a 16:9 image.
```mdx
<ImageBlock
  src="https://example.com/image.jpg"
  alt="Description of image"
  enter="slideLeft"
/>
```

### `<CTA>`
A stylized "Call to Action" badge, perfect for the end of a sequence.
```mdx
<CTA text="Start Building" />
```

---

## Animation Props

You can control how each component enters the scene using these props:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enter` | `string` | `"fadeUp"` | Entry variant: `"fadeIn"`, `"fadeUp"`, `"zoomIn"`, `"slideLeft"`. |
| `delay` | `number` | `0` | Delay before the animation starts (in seconds). |
| `duration` | `number` | `0.6` | The duration of the entry animation (in seconds). |

### Examples

```mdx
{/* Enters from the right with a 1-second delay */}
<Title enter="slideLeft" delay={1}>Hello World</Title>

{/* Zooms in quickly */}
<Card title="Quick Tip" text="..." enter="zoomIn" duration={0.3} />
```

---

## Technical Architecture

-   **Parser**: A custom regex-based parser (`lib/motionDocParser.ts`) converts MDX into a structured JSON scene tree.
-   **Renderer**: The `PreviewPane` consumes the scene tree and maps it to Framer Motion components.
-   **Styling**: Built with Tailwind CSS for a modern, responsive interface.

---

## Roadmap: Toward MP4 Export

This prototype is built with a clear path toward video generation:

1.  **Timeline Mapping**: The `Scene duration` will be used to sequence scenes on a global timeline.
2.  **Headless Rendering**: The same React components can be rendered in a headless browser (like Puppeteer).
3.  **Frame Capture**: Capturing snapshots of the canvas at fixed intervals (e.g., 60fps).
4.  **FFmpeg Pipeline**: Stitching captured frames and audio into a final MP4 file.

Currently, Animark focuses on the **Authoring Loop**—making the process of creating motion content as fast as writing a markdown file.
