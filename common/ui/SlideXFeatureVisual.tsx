"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/common/lib/I18nProvider";

export type SlideXFeatureVisualVariant = "canvas" | "export" | "shader";

export function SlideXFeatureVisual({ variant }: { variant: SlideXFeatureVisualVariant }) {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const transition = { duration: 5.6, ease: "easeInOut" as const, repeat: Infinity, repeatType: "mirror" as const };
  const isZh = locale === "zh-TW";
  const ariaLabel = isZh
    ? variant === "canvas" ? "Pitch 畫布動畫示意" : variant === "export" ? "PowerPoint 匯出預覽" : "Pitch Shader 控制動畫示意"
    : variant === "canvas" ? "Animated Pitch canvas" : variant === "export" ? "PowerPoint export preview" : "Animated Pitch shader controls";

  return (
    <svg aria-label={ariaLabel} className="h-full w-full" role="img" viewBox="0 0 800 500">
      <defs>
        <radialGradient id={`feature-bg-${variant}`} cx="32%" cy="28%" r="90%">
          <stop stopColor={variant === "canvas" ? "#f4f4f1" : variant === "export" ? "#f5f2ec" : "#dff2ff"} />
          <stop offset="0.55" stopColor={variant === "canvas" ? "#d8ff76" : variant === "export" ? "#ef6a43" : "#8176ff"} />
          <stop offset="1" stopColor={variant === "canvas" ? "#9ad7ff" : variant === "export" ? "#c4ee87" : "#111315"} />
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
        <g key={item}>
          <rect fill="#fff" height="72" opacity=".06" rx="6" width="110" x="16" y={88 + item * 86} />
          <rect fill={item === 0 ? `url(#feature-bg-${variant})` : "#2a2d32"} height="48" rx="3" width="86" x="28" y={99 + item * 86} />
          <rect fill="#fff" height="5" opacity=".3" rx="2.5" width="44" x="28" y={155 + item * 86} />
        </g>
      ))}

      <rect fill="#050608" height="326" rx="8" width="458" x="160" y="82" />
      <rect fill={`url(#feature-bg-${variant})`} height="252" rx="4" width="414" x="182" y="113" />
      {variant === "canvas" ? (
        <g>
          <motion.rect
            animate={reduceMotion ? undefined : { width: [142, 166, 142] }}
            fill="#111315"
            height="26"
            rx="3"
            transition={transition}
            width="142"
            x="218"
            y="162"
          />
          <motion.rect
            animate={reduceMotion ? undefined : { width: [206, 178, 206] }}
            fill="#111315"
            height="8"
            opacity=".52"
            rx="4"
            transition={transition}
            width="206"
            x="218"
            y="203"
          />
          <rect fill="#111315" height="8" opacity=".26" rx="4" width="156" x="218" y="221" />
          <motion.rect
            animate={reduceMotion ? undefined : { width: [238, 264, 238] }}
            fill="none"
            height="86"
            rx="3"
            stroke="#8176ff"
            strokeDasharray="6 4"
            strokeWidth="2"
            transition={transition}
            width="238"
            x="205"
            y="149"
          />
          {[[205, 149], [205, 235]].map(([cx, cy]) => <circle cx={cx} cy={cy} fill="#fff" key={`${cx}-${cy}`} r="4" stroke="#8176ff" strokeWidth="2" />)}
          {[149, 235].map((cy) => (
            <motion.circle
              animate={reduceMotion ? undefined : { cx: [443, 469, 443] }}
              cx="443"
              cy={cy}
              fill="#fff"
              key={cy}
              r="4"
              stroke="#8176ff"
              strokeWidth="2"
              transition={transition}
            />
          ))}
        </g>
      ) : variant === "export" ? (
        <>
          <rect fill="#f5f2ec" height="184" rx="8" width="142" x="318" y="145" />
          <rect fill="#d24625" height="184" rx="8" width="44" x="318" y="145" />
          <text fill="#fff" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="700" x="329" y="248">P</text>
          <rect fill="#111315" height="12" rx="4" width="66" x="373" y="181" />
          <rect fill="#111315" height="7" opacity=".38" rx="3.5" width="58" x="373" y="207" />
          <rect fill="#111315" height="7" opacity=".22" rx="3.5" width="70" x="373" y="225" />
          <motion.path animate={reduceMotion ? undefined : { pathLength: [0, 1, 1] }} d="M388 278 l14 14 32 -38" fill="none" stroke="#111315" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" transition={transition} />
        </>
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
      <rect fill={variant === "shader" ? "#9ad7ff" : variant === "export" ? "#ef6a43" : "#f4f4f1"} height="22" rx="4" width="44" x="666" y="108" />
      {[0, 1, 2, 3].map((item) => (
        <g key={item}>
          <rect fill="#fff" height="6" opacity=".28" rx="3" width={52 + item * 5} x="658" y={168 + item * 54} />
          <rect fill="#fff" height="4" opacity=".1" rx="2" width="120" x="658" y={189 + item * 54} />
          <motion.rect
            animate={reduceMotion ? undefined : { width: [36 + item * 8, 88 - item * 4, 36 + item * 8] }}
            fill={item === 1 ? "#c4ee87" : "#9ad7ff"}
            height="4"
            rx="2"
            width={36 + item * 8}
            x="658"
            y={189 + item * 54}
            transition={{ ...transition, delay: item * .2 }}
          />
          <motion.circle
            animate={reduceMotion ? undefined : { cx: [694 + item * 8, 746 - item * 4, 694 + item * 8] }}
            cx={694 + item * 8}
            cy={191 + item * 54}
            fill={item === 1 ? "#c4ee87" : "#9ad7ff"}
            r="5"
            stroke="#15171a"
            strokeWidth="2"
            transition={{ ...transition, delay: item * .2 }}
          />
        </g>
      ))}
    </svg>
  );
}
