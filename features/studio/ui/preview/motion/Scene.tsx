"use client";

import type { CSSProperties, ReactNode } from "react";
import { ShaderCanvas } from "@/features/studio/ui/preview/ShaderCanvas";
import { alignXToFlex, alignYToFlex, cssColor } from "@/features/studio/ui/preview/motion/blockStyles";

type SceneProps = {
  accent?: string;
  alignX?: "left" | "center" | "right" | "stretch";
  alignY?: "top" | "center" | "bottom";
  autoHeight?: boolean;
  background?: string;
  children: ReactNode;
  duration: number;
  freeform?: boolean;
  layout?: "default" | "split-left" | "split-right";
  mutedColor?: string;
  shader?: string;
  shaderColor1?: string;
  shaderColor2?: string;
  shaderColor3?: string;
  shaderDetail?: number;
  shaderIntensity?: number;
  shaderScale?: number;
  shaderSoftness?: number;
  shaderSpeed?: number;
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  theme?: string;
};

export function Scene({
  accent = "#7c3aed",
  alignX = "left",
  alignY = "center",
  autoHeight = false,
  background,
  children,
  duration,
  freeform = false,
  layout = "default",
  mutedColor,
  shader,
  shaderColor1,
  shaderColor2,
  shaderColor3,
  shaderDetail,
  shaderIntensity,
  shaderScale,
  shaderSoftness,
  shaderSpeed,
  textAlign = "left",
  textColor,
  theme = "dark"
}: SceneProps) {
  const isLight = theme === "light" || theme === "paper";
  const slideBackground = background ?? defaultSlideBackground(theme);
  const foreground = isLight ? "#111827" : "#ffffff";
  const muted = cssColor(mutedColor) ?? (isLight ? "#475569" : "#cbd5e1");
  const textForeground = cssColor(textColor) ?? foreground;
  const cardBackground = isLight ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.075)";
  const borderColor = isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.12)";

  return (
    <section
      data-duration={duration}
      data-motion-scene
      style={
        {
          "--slide-accent": accent,
          "--slide-bg": slideBackground,
          "--slide-border": borderColor,
          "--slide-card": cardBackground,
          "--slide-fg": textForeground,
          "--slide-muted": muted,
          "--slide-text-align": textAlign,
          background: slideBackground,
          border: `1px solid ${borderColor}`,
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          height: autoHeight ? "auto" : undefined,
          inset: autoHeight ? undefined : 0,
          minHeight: autoHeight ? "100%" : undefined,
          overflow: "hidden",
          padding: freeform ? 0 : "clamp(16px, 3%, 32px)",
          position: autoHeight ? "relative" : "absolute"
        } as CSSProperties
      }
    >
      {shader ? (
        <ShaderCanvas
          color1={shaderColor1 ?? accent}
          color2={shaderColor2 ?? slideBackground}
          color3={shaderColor3 ?? (isLight ? "#64748b" : "#06b6d4")}
          detail={shaderDetail ?? 0.5}
          intensity={shaderIntensity ?? 0.5}
          presetId={shader}
          scale={shaderScale ?? 0.5}
          softness={shaderSoftness ?? 0.5}
          speed={shaderSpeed ?? 1}
          style={{ borderRadius: 20, inset: 0, position: "absolute", zIndex: 0 }}
        />
      ) : null}
      <div
        style={{
          background: `radial-gradient(circle at 20% 10%, ${accent}38, transparent 28rem), radial-gradient(circle at 90% 70%, ${accent}24, transparent 24rem)`,
          inset: 0,
          opacity: shader ? 0.3 : 0.7,
          pointerEvents: "none",
          position: "absolute"
        }}
      />
      <div
        style={{
          alignItems: layout === "default" ? alignXToFlex(alignX) : "stretch",
          display: "flex",
          flex: autoHeight ? "0 0 auto" : 1,
          flexDirection: layout === "default" ? "column" : "row",
          gap: layout === "default" ? 20 : 48,
          height: freeform ? "100%" : undefined,
          justifyContent: alignYToFlex(alignY),
          minHeight: autoHeight ? "calc(100% - clamp(32px, 6%, 64px))" : 0,
          overflow: "visible",
          position: "relative",
          textAlign,
          width: "100%",
          zIndex: 10
        }}
      >
        {children}
      </div>
    </section>
  );
}

function defaultSlideBackground(theme: string) {
  if (theme === "light") return "#f8fafc";
  if (theme === "paper") return "#f3eadf";
  if (theme === "blue") return "#0b1f3a";

  return "#0f172a";
}
