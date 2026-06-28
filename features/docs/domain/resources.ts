export type ResourceItem = {
  title: string;
  description: string;
  href: string;
  label: string;
};

export type DocSection = {
  title: string;
  description: string;
  points: string[];
};

export const resourceItems: ResourceItem[] = [
  {
    title: "Slide Components",
    description: "Reference for Slide, Text, Icon, Chart, ImageBlock, VideoBlock, and timing props.",
    href: "/docs/introduction#components",
    label: "Reference"
  },
  {
    title: "MCP Server",
    description: "Connect SlideX to MCP clients so assistants can create, validate, edit, and export MotionDoc decks.",
    href: "/docs/mcp",
    label: "MCP"
  },

  {
    title: "Pitch Workflow",
    description: "Use the slide list, MDX editor, preview, and timeline to design animated presentations.",
    href: "/pitch",
    label: "Pitch"
  }
];

export const docSections: DocSection[] = [
  {
    title: "Slide Model",
    description: "SlideX treats a presentation as an editable MDX slide document.",
    points: [
      "Each Slide defines one timed page.",
      "Text, Icon, Chart, ImageBlock, and VideoBlock layers receive enter, delay, and duration props.",
      "The same MDX deck powers the slide list, preview, timeline, and export."
    ]
  },
  {
    title: "Design Loop",
    description: "The Pitch keeps source, slide navigation, preview, and timeline output in sync.",
    points: [
      "Load a deck preset or insert individual Slide blocks.",
      "Edit the MDX source for advanced composition control.",
      "Replay resets the animation key without changing the composition."
    ]
  },
  {
    title: "Export Direction",
    description: "Video export is the publishing target, while the core product remains a motion design tool.",
    points: [
      "Slide duration maps to timeline segments.",
      "The preview canvas can become a browser capture target.",
      "A renderer can consume the same MDX Slide tree for video output."
    ]
  }
];
