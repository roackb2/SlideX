"use client";

import { motion, useReducedMotion } from "framer-motion";

export type SlideXFeatureVisualVariant = "canvas" | "shader";

export function SlideXFeatureVisual({ variant }: { variant: SlideXFeatureVisualVariant }) {
  const reduceMotion = useReducedMotion();
  const transition = { duration: 5, ease: "easeInOut" as const, repeat: Infinity, repeatType: "mirror" as const };

  return (
    <svg aria-label={variant === "canvas" ? "Animated Pitch canvas" : "Animated Pitch shader controls"} className="h-full w-full" role="img" viewBox="0 0 800 500">
      <defs>
        <radialGradient id={`feature-bg-${variant}`} cx="32%" cy="28%" r="90%">
          <stop stopColor={variant === "canvas" ? "#f4f4f1" : "#dff2ff"} />
          <stop offset="0.55" stopColor={variant === "canvas" ? "#d8ff76" : "#8176ff"} />
          <stop offset="1" stopColor={variant === "canvas" ? "#9ad7ff" : "#111315"} />
        </radialGradient>
        <pattern id={`feature-grid-${variant}`} height="16" patternUnits="userSpaceOnUse" width="16">
          <circle cx="1" cy="1" fill="#fff" opacity=".12" r="1" />
        </pattern>
      </defs>
      <rect fill="#0a0b0d" height="500" width="800" />
      <rect fill={`url(#feature-grid-${variant})`} height="500" width="800" />
      <rect fill="#15171a" height="48" width="800" />
      <circle cx="25" cy="24" fill="#c4ee87" r="5" />
      <rect fill="#fff" height="7" opacity=".75" rx="3.5" width="58" x="42" y="20" />
      <rect fill="#fff" height="22" opacity=".08" rx="6" width="76" x="116" y="13" />
      <rect fill="#fff" height="22" opacity=".86" rx="6" width="66" x="714" y="13" />

      <rect fill="#111315" height="452" width="142" y="48" />
      <rect fill="#15171a" height="452" width="164" x="636" y="48" />
      {[0, 1, 2].map((item) => (
        <motion.g animate={reduceMotion ? undefined : { opacity: [.45, item === 0 ? 1 : .68, .45] }} key={item} transition={{ ...transition, delay: item * .35 }}>
          <rect fill="#fff" height="72" opacity=".06" rx="6" width="110" x="16" y={88 + item * 86} />
          <rect fill={item === 0 ? `url(#feature-bg-${variant})` : "#2a2d32"} height="48" rx="3" width="86" x="28" y={99 + item * 86} />
          <rect fill="#fff" height="5" opacity=".3" rx="2.5" width="44" x="28" y={155 + item * 86} />
        </motion.g>
      ))}

      <rect fill="#050608" height="326" rx="8" width="458" x="160" y="82" />
      <motion.rect animate={reduceMotion ? undefined : { opacity: [.82, 1, .82] }} fill={`url(#feature-bg-${variant})`} height="252" rx="4" transition={transition} width="414" x="182" y="113" />
      {variant === "canvas" ? (
        <motion.g animate={reduceMotion ? undefined : { x: [0, 26, 0], y: [0, 12, 0] }} transition={transition}>
          <rect fill="#111315" height="26" rx="3" width="142" x="218" y="162" />
          <rect fill="#111315" height="8" opacity=".52" rx="4" width="206" x="218" y="203" />
          <rect fill="#111315" height="8" opacity=".26" rx="4" width="156" x="218" y="221" />
          <rect fill="none" height="86" rx="3" stroke="#8176ff" strokeDasharray="6 4" strokeWidth="2" width="238" x="205" y="149" />
          {[[205, 149], [443, 149], [205, 235], [443, 235]].map(([cx, cy]) => <circle cx={cx} cy={cy} fill="#fff" key={`${cx}-${cy}`} r="4" stroke="#8176ff" strokeWidth="2" />)}
        </motion.g>
      ) : (
        <>
          <motion.circle animate={reduceMotion ? undefined : { cx: [330, 450, 330], cy: [220, 260, 220], r: [76, 118, 76] }} cx="330" cy="220" fill="#fff" opacity=".24" r="76" transition={transition} />
          <motion.path animate={reduceMotion ? undefined : { d: ["M190 292 C290 170 410 342 586 174", "M190 232 C306 354 432 142 586 250", "M190 292 C290 170 410 342 586 174"] }} fill="none" stroke="#fff" strokeLinecap="round" strokeOpacity=".7" strokeWidth="4" transition={transition} />
          <rect fill="#fff" height="22" opacity=".9" rx="3" width="164" x="214" y="148" />
          <rect fill="#fff" height="7" opacity=".5" rx="3.5" width="108" x="214" y="181" />
        </>
      )}

      <rect fill="#fff" height="7" opacity=".6" rx="3.5" width="54" x="658" y="76" />
      <rect fill="#050608" height="42" rx="6" width="120" x="658" y="98" />
      <motion.rect animate={reduceMotion ? undefined : { x: variant === "shader" ? [0, 68, 0] : [68, 0, 68] }} fill={variant === "shader" ? "#9ad7ff" : "#f4f4f1"} height="22" rx="4" transition={transition} width="44" x="666" y="108" />
      {[0, 1, 2, 3].map((item) => (
        <g key={item}>
          <rect fill="#fff" height="6" opacity=".28" rx="3" width={52 + item * 5} x="658" y={168 + item * 54} />
          <rect fill="#fff" height="4" opacity=".1" rx="2" width="120" x="658" y={189 + item * 54} />
          <motion.rect animate={reduceMotion ? undefined : { width: [36 + item * 8, 88 - item * 4, 36 + item * 8] }} fill={item === 1 ? "#c4ee87" : "#9ad7ff"} height="4" rx="2" transition={{ ...transition, delay: item * .2 }} width="50" x="658" y={189 + item * 54} />
        </g>
      ))}
    </svg>
  );
}
