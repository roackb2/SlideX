# border-beam v1.2 — 蒸餾規格文件

> **用途**：為日後在 Remotion 中重現 border-beam 的五種動畫效果，
> 提供完整的底層機制拆解與可直接移植的參數規格。

---

## 目錄

1. [架構總覽](#1-架構總覽)
2. [DOM 結構](#2-dom-結構)
3. [共用機制](#3-共用機制)
4. [Type: `md` (Large / Default)](#4-type-md)
5. [Type: `sm` (Small)](#5-type-sm)
6. [Type: `line` (Bottom Traveling)](#6-type-line)
7. [Type: `pulse-inner` (Breathing Contained)](#7-type-pulse-inner)
8. [Type: `pulse-outside` (Breathing Outward)](#8-type-pulse-outside)
9. [色彩系統 (Color Variants)](#9-色彩系統)
10. [Opacity 預設值一覽表](#10-opacity-預設值)
11. [移植到 Remotion 的策略](#11-remotion-策略)

---

## 1. 架構總覽

```
┌──────────────────────────────────────────────────┐
│  <style> (動態生成，per-instance unique ID)        │
│  ├─ @property 宣告 (CSS Houdini)                  │
│  ├─ @keyframes (travel / spin / breathe / spike)  │
│  └─ data-beam 選擇器 (::after, ::before, bloom)   │
├──────────────────────────────────────────────────┤
│  <div data-beam="{id}" data-active>               │
│  │                                                │
│  │  ::after  ← Layer 3: 邊框光束 (stroke)         │
│  │  ::before ← Layer 2: 內部反光 (inner glow)     │
│  │                                                │
│  │  {children}  ← 使用者內容                      │
│  │                                                │
│  │  <div data-beam-bloom>                         │
│  │      ← Layer 4: 外部模糊光暈 (bloom)           │
│  │  </div>                                        │
│  └────────────────────────────────────────────────┘
```

**核心設計原則：**

- 所有光效層使用 `pointer-events: none`，不干擾互動
- 每個實例用唯一 `id` 防止 CSS 衝突
- 使用 CSS `@property` 讓自訂屬性可以被動畫插值（GPU 加速）
- `overflow: hidden` 裁切溢出光效（`pulse-outside` 除外，使用 `overflow: visible`）

---

## 2. DOM 結構

### 包裝器 (Wrapper)

```html
<div data-beam="{id}" data-active style="--beam-strength: 1">
  <!-- children 放這裡 -->
  <div data-beam-bloom></div>
</div>
```

| 屬性 | 用途 |
|------|------|
| `data-beam="{id}"` | CSS 選擇器錨點，保證唯一 |
| `data-active` | 啟動動畫 |
| `data-fading` | 淡出動畫中 |
| `data-paused` | 暫停所有動畫 |
| `--beam-strength` | 0–1，控制整體不透明度 |

### 三層光效

| 層級 | 元素 | z-index | 職責 |
|------|------|---------|------|
| Stroke | `::after` | 2 | 邊框上的高光線條 |
| Inner Glow | `::before` | 1 | 卡片內部的環境反光 |
| Bloom | `[data-beam-bloom]` | 3 | 大範圍模糊外暈 |

---

## 3. 共用機制

### 3.1 @property (CSS Houdini)

```css
@property --beam-angle-{id} {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: true;
}

@property --beam-opacity-{id} {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

@property --beam-x-{id} {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}
```

> **為什麼用 @property？**
> 普通 CSS 自訂屬性 (`--var`) 無法被動畫插值 —— 瀏覽器會直接跳變。
> `@property` 告訴瀏覽器「這個變數是 `<number>` / `<angle>` 型別」，
> 就能啟用硬體加速的平滑過渡，完全在 Compositor Thread 執行。

### 3.2 Fade In / Fade Out

```css
@keyframes beam-fade-in-{id}  { to   { --beam-opacity-{id}: 1; } }
@keyframes beam-fade-out-{id} { from { --beam-opacity-{id}: 1; } to { --beam-opacity-{id}: 0; } }
```

- Fade in: `0.6s ease forwards`
- Fade out: `0.5s ease forwards`

### 3.3 Opacity 計算公式

所有光效層的最終透明度皆為：

```
opacity = var(--beam-opacity-{id}) × [type-specific-multiplier] × var(--beam-strength, 1)
```

`line` 類型額外乘以 `var(--beam-edge-{id})`（邊緣漸隱因子）。

### 3.4 Hue Shift（色相偏移動畫）

非 `mono` 且非 `staticColors` 時啟用：

```css
/* Stroke + Inner Glow */
@keyframes beam-hue-shift-{id} {
  0%   { filter: hue-rotate(-30deg) brightness(1.30) saturate(1.20); }
  50%  { filter: hue-rotate(30deg)  brightness(1.30) saturate(1.20); }
  100% { filter: hue-rotate(-30deg) brightness(1.30) saturate(1.20); }
}
/* 週期: 12s ease-in-out infinite */

/* Bloom 的 hue-shift 額外加 blur */
@keyframes beam-hue-shift-bloom-{id} {
  /* 同上但 hueRange + 10, 週期 8s */
}
```

### 3.5 Border Ring Masking（邊框環形遮罩）

`md` / `sm` / `line` 的 `::after`（stroke）使用「三層 mask-composite」把漸層裁成邊框環形：

```css
mask:
  [旋轉/位移遮罩],        /* 控制光束可見範圍 */
  linear-gradient(#fff 0 0) content-box,  /* 內容區域 */
  linear-gradient(#fff 0 0);              /* 全覆蓋 */
mask-composite: intersect, exclude;
```

**邏輯：** 先用 `intersect` 與位移遮罩取交集，再用 `exclude` 去掉 content-box 內部，只留下 padding 區域（= 邊框寬度）。

---

## 4. Type: `md` (Large / Default) {#4-type-md}

### 動畫原理

**旋轉光束**：使用 `conic-gradient` 繞著中心旋轉。

### 驅動變數

| 變數 | 型別 | 動畫 |
|------|------|------|
| `--beam-angle` | `<angle>` | `0deg → 360deg` linear infinite |
| `--beam-opacity` | `<number>` | fade-in/out |

### Keyframes

```css
@keyframes beam-spin-{id} {
  to { --beam-angle-{id}: 360deg; }
}
/* duration: 1.96s (default) */
```

### Stroke (::after)

**Background：**
```
conic-gradient(from var(--beam-angle), transparent 54%, white 66%, transparent 78%)
+ 9 個 radial-gradient 色點（來自 color variant 定義）
```

**Mask：** conic-gradient 遮罩（30%–95% 可見弧度）+ border-ring exclusion

### Inner Glow (::before)

**Background：** 9 個較柔和的 radial-gradient 色點
**Mask：** 同 stroke 的 conic 遮罩 + 邊緣漸隱（28px 內框淡出）
**box-shadow：** `inset 0 0 5px 1px rgba(255,255,255,0.27)`

### Bloom ([data-beam-bloom])

**Background：** 更窄的 conic-gradient（~70% 峰值，更集中）
**filter：** `blur(8px) brightness(1.3) saturate(1.2)`
**Mask：** border-ring exclusion（padding = borderWidth）

### 預設參數

| 參數 | Dark | Light |
|------|------|-------|
| duration | 1.96s | 1.96s |
| borderRadius | 16px | 16px |
| borderWidth | 1px | 1px |
| strokeOpacity | 0.26 | 0.12 |
| innerOpacity | 0.42 | 0.26 |
| bloomOpacity | 0.24 | 0.34 |

---

## 5. Type: `sm` (Small) {#5-type-sm}

與 `md` **完全相同的架構**，差異僅在：

| 參數 | sm | md |
|------|-----|-----|
| borderRadius | 32px | 16px |
| strokeOpacity (dark) | 0.46 | 0.26 |
| innerOpacity (dark) | 0.24 | 0.42 |
| bloomOpacity (dark) | 0.38 | 0.24 |
| 色點集 | `smBorderPatches` (較小的 radial-gradient) | `mdBorderPatches` |
| 預設尺寸 | 70×36 | 自適應 |

> `sm` 使用更小的 radial-gradient 色點且更高的 strokeOpacity，
> 讓它在小面積按鈕上也能清晰可見。

---

## 6. Type: `line` (Bottom Traveling) {#6-type-line}

### 動畫原理

**底部橫向掃描**：光束從左到右沿著底邊移動，
同時呼吸（高度脈動）和尖刺（垂直光線閃爍）。

### 驅動變數

| 變數 | 型別 | 說明 |
|------|------|------|
| `--beam-x` | `<number>` | 水平位置 0→1 |
| `--beam-w` | `<number>` | 光束寬度倍率 |
| `--beam-h` | `<number>` | 光束高度倍率（呼吸） |
| `--beam-spike` | `<number>` | 尖刺 A 強度 |
| `--beam-spike2` | `<number>` | 尖刺 B 強度 |
| `--beam-edge` | `<number>` | 邊緣漸隱因子 0/1 |
| `--beam-opacity` | `<number>` | 總體可見度 |

### 核心 Keyframes

#### beam-travel（水平掃描 + 動態寬度）

```css
@keyframes beam-travel-{id} {
  0%   { --beam-x: 0.06;  --beam-w: 0.5;  }  /* 左邊緣，窄 */
  10%  { --beam-x: 0.15;  --beam-w: 0.8;  }
  20%  { --beam-x: 0.25;  --beam-w: 1.1;  }
  30%  { --beam-x: 0.35;  --beam-w: 1.3;  }
  40%  { --beam-x: 0.44;  --beam-w: 1.45; }
  50%  { --beam-x: 0.5;   --beam-w: 1.5;  }  /* 中央，最寬 */
  60%  { --beam-x: 0.56;  --beam-w: 1.45; }
  70%  { --beam-x: 0.65;  --beam-w: 1.3;  }
  80%  { --beam-x: 0.75;  --beam-w: 1.1;  }
  90%  { --beam-x: 0.85;  --beam-w: 0.8;  }
  100% { --beam-x: 0.94;  --beam-w: 0.5;  }  /* 右邊緣，窄 */
}
/* duration: 3.1s linear infinite */
```

> **關鍵洞察**：寬度在中央最大、兩側最小，
> 形成一個自然的「光束展開再收束」的彗星效果。

#### beam-edge-fade（邊緣漸隱）

```css
@keyframes beam-edge-fade-{id} {
  0%     { --beam-edge: 0; }
  12.5%  { --beam-edge: 0; }   /* 前 12.5% 完全透明 */
  32.5%  { --beam-edge: 1; }   /* 漸入 */
  67.5%  { --beam-edge: 1; }   /* 中段完全可見 */
  87.5%  { --beam-edge: 0; }   /* 漸出 */
  100%   { --beam-edge: 0; }   /* 尾端完全透明 */
}
/* duration: 與 travel 相同 (3.1s) */
```

> 讓光束在左右兩端不會突然出現/消失。

#### beam-breathe（高度呼吸）

```css
@keyframes beam-breathe-{id} {
  0%, 100% { --beam-h: 0.8;  }
  25%      { --beam-h: 1.25; }
  55%      { --beam-h: 0.85; }
  80%      { --beam-h: 1.3;  }
}
/* duration: 3.1 × 1.3 = 4.03s ease-in-out infinite */
```

#### beam-spike（光刺脈動）

```css
@keyframes beam-spike-{id} {
  0%   { --beam-spike: 0.8; }
  25%  { --beam-spike: 1.3; }
  50%  { --beam-spike: 0.9; }
  75%  { --beam-spike: 1.4; }
  100% { --beam-spike: 0.8; }
}
/* duration: 3.1 × 1.33 = 4.12s */

@keyframes beam-spike2-{id} {
  0%   { --beam-spike2: 1.2; }
  25%  { --beam-spike2: 0.7; }
  50%  { --beam-spike2: 1.4; }
  75%  { --beam-spike2: 0.8; }
  100% { --beam-spike2: 1.2; }
}
/* duration: 3.1 × 1.7 = 5.27s */
```

### 並行動畫清單

```css
[data-beam][data-active] {
  animation:
    beam-travel    3.1s  linear       infinite,
    beam-edge-fade 3.1s  linear       infinite,
    beam-breathe   4.0s  ease-in-out  infinite,
    beam-spike     4.1s  ease-in-out  infinite,
    beam-spike2    5.3s  ease-in-out  infinite,
    beam-fade-in   0.6s  ease         forwards;
}
```

### Stroke (::after)

**Background：**
```
中心白光橢圓 (radial-gradient, 24×28px, 跟隨 --beam-x)
+ 9 顆 line-specific 色點 (radial-gradient, 各 sizeW×sizeH, 跟隨 --beam-x ± offset)
```

每顆色點的位置公式：
```
at calc(var(--beam-x) * 100% + offsetX px) calc(100% + offsetY px)
```

尺寸公式：
```
ellipse calc(sizeW px * var(--beam-w)) calc(sizeH px * var(--beam-h))
```

**Mask：** 跟隨位移的橢圓遮罩（78×60px）+ border-ring exclusion

### Inner Glow (::before) — line 專屬：「光刺 (Spikes)」

在底邊沿固定位置（8%, 22%, 36%, 50%, 64%, 78%, 92%）
放置 7 根垂直的 radial-gradient 光刺，
高度由 `--beam-h`、`--beam-spike`、`--beam-spike2` 控制。

另外在跟隨 `--beam-x` 的位置放一個白色橢圓（21×15px）作為核心亮點，
以及一個更大的漫射光暈（42×40px）。

**Mask：** 跟隨位移的橢圓遮罩 + 四邊 28px 漸隱

### Bloom ([data-beam-bloom])

**Background：** 同樣的光刺圖案但尺寸更大
**Mask：** 更大的橢圓遮罩（84×110px）
**filter：** `blur(8px)`
**Hue shift：** 獨立的 8s 週期

### 預設參數

| 參數 | Dark | Light |
|------|------|-------|
| duration | 3.1s | 3.1s |
| borderRadius | 16px | 16px |
| strokeOpacity | 1.14 | 0.16 |
| innerOpacity | 0.70 | 0.32 |
| bloomOpacity | 0.80 | 0.30 |
| hueRange | capped 13° | capped 13° |

---

## 7. Type: `pulse-inner` (Breathing Contained) {#7-type-inner}

### 動畫原理

**無旋轉**，純呼吸脈動。使用 JavaScript `requestAnimationFrame` 驅動
17 組正弦波振盪器（30fps），直接寫入 CSS 自訂屬性。

### 驅動變數（由 JS rAF 驅動）

| 變數 | 用途 | 振盪參數 |
|------|------|---------|
| `--bw1`, `--bh1` | 區域 1 的寬高倍率 | period: ~2.6s |
| `--bx1`, `--by1` | 區域 1 的位移 (px) | period: ~3.0s |
| `--bw2`, `--bh2` | 區域 2 的寬高倍率 | period: ~2.1s |
| `--bx2`, `--by2` | 區域 2 的位移 (px) | period: ~3.6s |
| `--bw3`, `--bh3` | 區域 3 的寬高倍率 | period: ~2.5s |
| `--bx3`, `--by3` | 區域 3 的位移 (px) | period: ~2.8s |
| `--bgh` | 全局高度呼吸 | period: ~2.4s |
| `--bop-tl/tr/bl/br` | 四角不透明度 | period: ~1.9–3.0s |
| `--beam-hue` | 色相偏移 | period: 16s, 連續 360° |

### 振盪器公式

```javascript
// cosine easing (0→1→0)
function easeWave(t) { return (1 - Math.cos(2π × t)) / 2; }

value = a + (b - a) × easeWave((time - delay) / period)
```

### 色點佈局

9 顆色點沿邊框分散（使用 `border` 定義的 position/size），
每顆綁定其所屬區域（1/2/3）的振盪器變數。

另外有 7 顆獨立的 bloom 色點。

### Mask

Stroke: `content-box + exclude`（標準邊框環）
Inner Glow: 邊緣 28px 漸隱遮罩
Bloom: `content-box + exclude`

### 特殊功能

- `prefers-reduced-motion: reduce` 時停止全部動畫
- `IntersectionObserver` 不可見時暫停 rAF
- 所有 rAF 實例共用同一個 30fps loop

### 預設參數

| 參數 | Dark | Light |
|------|------|-------|
| duration | 2.3s | 2.3s |
| strokeOpacity | 1.54 | 0.32 |
| innerOpacity | 0.44 | 0.40 |
| bloomOpacity | 0.66 | 0.80 |
| brightness | 0.75 | 1.30 |

---

## 8. Type: `pulse-outside` (Breathing Outward) {#8-type-outside}

### 動畫原理

與 `pulse-inner` 共用 rAF 振盪器系統，但：

- **`overflow: visible`**（讓光暈溢出到元素外部）
- `::before` 使用 `inset: -10px`（向外擴展 10px）
- Bloom 使用 `inset: -30px`（向外擴展 30px）
- 兩者都使用 `z-index: -1`（渲染在內容「下方」）
- 額外套用 `transform: scale(0.95, 0.9)` 讓光暈稍微收縮

### Stroke (::after)

8 顆色點沿邊框分佈（不同於 inner 的 9 顆），
使用 `content-box + exclude` 裁成 1px 邊框環。

### Bloom

7 顆色點，尺寸更大（w: 88–120px, h: 20–58px），
blur 更大（dark: 22.5px, light: 15px）。

### 特殊功能

- `ResizeObserver` 監聽子元素尺寸，動態計算 `--pulse-glow-sx/sy`
  比例因子（基準 350×140px），確保大元素上光暈比例正確
- `hairlineOpacity: 0`（不畫額外的細邊線，因為包裹的子元素已有邊框）

### 預設參數

| 參數 | Dark | Light |
|------|------|-------|
| duration | 2.3s | 2.3s |
| strokeOpacity | 0.94 | 1.96 |
| innerOpacity | 0.34 | 1.04 |
| bloomOpacity | 0.30 | 0.42 |
| brightness | 1.90 | 1.70 |

---

## 9. 色彩系統 {#9-色彩系統}

### 四種 Color Variants

| Variant | 主調色 | 說明 |
|---------|--------|------|
| `colorful` | 紅/藍/綠/紫/橙 全彩 | 預設，彩虹光譜 |
| `mono` | 灰階 130–200 | 單色，opacity 自動減半 |
| `ocean` | 藍/紫 60–255 | 冷色調 |
| `sunset` | 橙/紅/黃 50–255 | 暖色調 |

### 色點結構

每個 variant 定義了多組色點陣列：

```javascript
// md/sm 用的大型色點 (9顆)
border: [
  { color: "rgb(R,G,B)", pos: "X% Y%", size: "WxH px" }
]

// line 用的小型色點 (8顆)
lineBorder: [...]

// md 的 bloom (窄 conic gradient 式)
bloom: conic-gradient(...)

// line 的 bloom 用 spike 圖案
spike: { primary, secondary }

// pulse 的色點由相同 border 陣列配合區域振盪器
```

### Mono 特殊處理

`mono` variant 會自動將所有 opacity 乘以 0.5，
防止灰色光在深色背景上顯得太亮。

---

## 10. Opacity 預設值一覽表 {#10-opacity-預設值}

| Type | Theme | Stroke | Inner | Bloom | Duration |
|------|-------|--------|-------|-------|----------|
| `md` | dark | 0.26 | 0.42 | 0.24 | 1.96s |
| `md` | light | 0.12 | 0.26 | 0.34 | 1.96s |
| `sm` | dark | 0.46 | 0.24 | 0.38 | 1.96s |
| `sm` | light | 0.12 | 0.30 | 0.16 | 1.96s |
| `line` | dark | 1.14 | 0.70 | 0.80 | 3.10s |
| `line` | light | 0.16 | 0.32 | 0.30 | 3.10s |
| `pulse-inner` | dark | 1.54 | 0.44 | 0.66 | 2.30s |
| `pulse-inner` | light | 0.32 | 0.40 | 0.80 | 2.30s |
| `pulse-outside` | dark | 0.94 | 0.34 | 0.30 | 2.30s |
| `pulse-outside` | light | 1.96 | 1.04 | 0.42 | 2.30s |

---

## 11. 移植到 Remotion 的策略 {#11-remotion-策略}

### 11.1 取代 @property

Remotion 的 `useCurrentFrame()` + `interpolate()` 可以完全取代 CSS @property：

```tsx
const frame = useCurrentFrame();
const fps = 30;
const durationFrames = 3.1 * fps; // 93 frames for line type

const beamX = interpolate(
  frame % durationFrames,
  [0, durationFrames * 0.1, ..., durationFrames],
  [0.06, 0.15, ..., 0.94]
);
```

### 11.2 取代 rAF 振盪器 (pulse types)

```tsx
const t = frame / fps;
const easeWave = (t: number) => (1 - Math.cos(2 * Math.PI * t)) / 2;

const bw1 = 0.72 + (1.31 - 0.72) * easeWave((t - 0) / 2.34);
// ... 套用 17 組振盪器
```

### 11.3 Gradient 直接移植

所有 `radial-gradient` 和 `conic-gradient` 是純 CSS，
可以直接複製到 Remotion 的 `<div style={...}>` 中，
只需將 `var(--beam-x)` 替換為 JS 計算值。

### 11.4 建議的組件結構

```tsx
// Remotion 版
export const BorderBeamSequence: React.FC<{type: 'md'|'sm'|'line'|...}> = ({type}) => {
  const frame = useCurrentFrame();
  
  // 根據 type 計算所有驅動變數
  const vars = computeBeamVars(type, frame);
  
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
      {/* Stroke layer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: generateStrokeGradient(vars),
        mask: generateStrokeMask(vars),
        opacity: vars.opacity * vars.edge * strokeOpacity,
      }} />
      
      {/* Inner Glow layer */}
      <div style={{...}} />
      
      {/* Content */}
      {children}
      
      {/* Bloom layer */}
      <div style={{
        filter: `blur(8px) hue-rotate(${vars.hue}deg)`,
        ...
      }} />
    </div>
  );
};
```

---

## 附錄：快速對照表

| 我要做什麼 | 用哪個 Type | 看哪一章 |
|-----------|------------|---------|
| 卡片邊框旋轉發光 | `md` | §4 |
| 小按鈕邊框發光 | `sm` | §5 |
| 搜尋欄底部掃描光 | `line` | §6 |
| 卡片靜態呼吸光暈 | `pulse-inner` | §7 |
| 按鈕向外擴散光暈 | `pulse-outside` | §8 |
