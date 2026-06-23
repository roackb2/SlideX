import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#111118",
        panel: "#0c0b10",
        ink: "#f7f8f8",
        accent: {
          DEFAULT: "#0070f3",
          light: "#3b82f6",
          glow: "rgba(0, 112, 243, 0.35)"
        },
        surface: {
          DEFAULT: "#0c0b10",
          raised: "#121118",
          sunken: "#050509"
        },
        ibm: {
          primary: "#3b82f6",
          canvas: "#ffffff",
          surface1: "#f4f4f4",
          surface2: "#e0e0e0",
          ink: "#161616",
          inkMuted: "#525252",
          hairline: "#e0e0e0",
          inverseCanvas: "#161616",
          inverseInkMuted: "#c6c6c6"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace"
        ],
        ibm: ["var(--font-ibm)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
