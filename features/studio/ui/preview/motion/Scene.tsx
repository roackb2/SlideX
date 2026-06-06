"use client";

import type { CSSProperties, ReactNode } from "react";
import { resolveSlideThemeColors } from "@/core/motion-doc/application/slideTheme";
import { ThreeShaderCanvas } from "@/features/studio/ui/preview/ThreeShaderCanvas";
import { alignXToFlex, alignYToFlex } from "@/features/studio/ui/preview/motion/blockStyles";

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
  shaderEngine?: string;
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
  shaderEngine,
  shaderIntensity,
  shaderScale,
  shaderSoftness,
  shaderSpeed,
  textAlign = "left",
  textColor,
  theme = "dark"
}: SceneProps) {
  const themeColors = resolveSlideThemeColors(
    {
      accent,
      background,
      mutedColor,
      shader,
      shaderColor1,
      shaderColor2,
      shaderColor3,
      shaderEngine,
      shaderIntensity,
      textColor,
      theme
    },
    { accentFallback: accent }
  );

  return (
    <section
      data-duration={duration}
      data-motion-scene
      data-theme-tone={themeColors.tone}
      style={
        {
          "--slide-accent": themeColors.accent,
          "--slide-bg": themeColors.background,
          "--slide-border": themeColors.borderColor,
          "--slide-card": themeColors.cardBackground,
          "--slide-fg": themeColors.foreground,
          "--slide-muted": themeColors.muted,
          "--slide-text-align": textAlign,
          background: themeColors.background,
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
        <ThreeShaderCanvas
          color1={themeColors.shaderColor1}
          color2={themeColors.shaderColor2}
          color3={themeColors.shaderColor3}
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
          background: `radial-gradient(circle at 20% 10%, ${themeColors.accent}38, transparent 28rem), radial-gradient(circle at 90% 70%, ${themeColors.accent}24, transparent 24rem)`,
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
