import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#111118",
        panel: "#0c0b10",
        ink: "#f7f8f8",
        accent: {
          DEFAULT: "#5e6ad2",
          light: "#8b95e0",
          glow: "rgba(94, 106, 210, 0.35)"
        },
        surface: {
          DEFAULT: "#0c0b10",
          raised: "#121118",
          sunken: "#050509"
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
        ]
      }
    }
  },
  plugins: []
};

export default config;
