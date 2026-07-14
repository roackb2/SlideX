export const enDictionary = {
  metadata: {
    description: "Build clear presentations with a precise canvas, solid fills, and focused motion."
  },
  footer: {
    rights: "© 2026 SlideX. All rights reserved."
  },
  thumbnail: {
    fallbackLabel: "Preset",
    ariaLabel: (title: string) => `${title} style thumbnail`,
    sceneLayers: "Slide layers",
    layers: ["Text", "Icon", "Table"],
    motionReady: "Motion ready"
  }
} as const;
