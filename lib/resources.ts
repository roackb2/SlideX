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
    title: "Quick Start",
    description: "Install, run the local server, and open the Studio.",
    href: "/resources#quick-start",
    label: "Guide"
  },
  {
    title: "Scene Components",
    description: "Reference for Scene, Title, Text, Card, CTA, and timing props.",
    href: "/resources#components",
    label: "Reference"
  },
  {
    title: "Deck Presets",
    description: "Reusable MDX slide decks for product stories, feature tours, lessons, and carousels.",
    href: "/templates",
    label: "Presets"
  },
  {
    title: "Studio Workflow",
    description: "Use the scene list, MDX editor, preview, and timeline to design animated presentations.",
    href: "/studio",
    label: "Studio"
  }
];

export const docSections: DocSection[] = [
  {
    title: "Scene Model",
    description: "SlideX treats a presentation as an MDX scene deck with editable source.",
    points: [
      "Each Scene defines one timed page.",
      "Title, Text, Card, and CTA layers receive enter, delay, duration, and spacing props.",
      "The same MDX deck powers the scene list, preview, timeline, and export."
    ]
  },
  {
    title: "Design Loop",
    description: "The Studio keeps source, scene navigation, preview, and timeline output in sync.",
    points: [
      "Load a deck preset or insert individual scene blocks.",
      "Edit the MDX source for advanced composition control.",
      "Replay resets the animation key without changing the composition."
    ]
  },
  {
    title: "Export Direction",
    description: "Video export is the publishing target, while the core product remains a motion design tool.",
    points: [
      "Scene duration maps to timeline segments.",
      "The preview canvas can become a browser capture target.",
      "A renderer can consume the same MDX scene tree for video output."
    ]
  }
];
