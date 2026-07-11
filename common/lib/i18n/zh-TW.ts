export const zhTwDictionary = {
  metadata: {
    description: "用精確畫布、單色 Fill 與克制動態製作清楚的簡報。"
  },
  footer: {
    rights: "© 2026 SlideX. All rights reserved."
  },
  thumbnail: {
    fallbackLabel: "範本",
    ariaLabel: (title: string) => `${title} 風格縮圖`,
    sceneLayers: "投影片圖層",
    layers: ["文字", "圖示", "圖表"],
    motionReady: "動態就緒"
  }
} as const;
