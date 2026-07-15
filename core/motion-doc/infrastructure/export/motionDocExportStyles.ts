import { MOTION_DOC_CANVAS_HEIGHT, MOTION_DOC_CANVAS_WIDTH } from "@/core/motion-doc/domain/viewport";

export const motionDocExportStyles = `      :root {
        --motion-doc-canvas-width: ${MOTION_DOC_CANVAS_WIDTH}px;
        --motion-doc-canvas-height: ${MOTION_DOC_CANVAS_HEIGHT}px;
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * {
        box-sizing: border-box;
      }
      html,
      body {
        min-height: 100%;
      }
      body {
        margin: 0;
        background: radial-gradient(circle at center, #18181b 0%, #000 100%);
        color: #ffffff;
        overflow: hidden;
      }
      button {
        font: inherit;
      }
      .player {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
        padding: 0;
      }
      .player:fullscreen {
        background: #000;
      }
      .stage {
        display: flex;
        flex: 1;
        min-height: 0;
        align-items: center;
        justify-content: center;
        padding: 40px;
      }
      .player:fullscreen .stage {
        padding: 0;
      }
      .viewport {
        position: relative;
        width: var(--export-viewport-width, var(--motion-doc-canvas-width));
        height: var(--export-viewport-height, var(--motion-doc-canvas-height));
        aspect-ratio: ${MOTION_DOC_CANVAS_WIDTH} / ${MOTION_DOC_CANVAS_HEIGHT};
        overflow: hidden;
        border-radius: 12px;
        background: #000;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 32px 120px rgba(0, 0, 0, 0.6), 0 0 80px rgba(255, 255, 255, 0.02);
      }
      .player:fullscreen .viewport {
        border-radius: 0;
        box-shadow: none;
      }
      .frame {
        position: absolute;
        left: 0;
        top: 0;
        width: var(--motion-doc-canvas-width);
        height: var(--motion-doc-canvas-height);
        overflow: hidden;
        transform: scale(var(--viewport-scale, 1));
        transform-origin: left top;
      }
      .slide {
        position: absolute;
        left: 0;
        top: 0;
        width: var(--motion-doc-canvas-width);
        height: var(--motion-doc-canvas-height);
        display: none;
        flex-direction: column;
        overflow: hidden;
        padding: var(--slide-padding, clamp(16px, 3%, 32px));
        background: var(--slide-bg);
        color: var(--slide-fg);
        text-align: var(--slide-text-align, left);
      }
      .slide.is-active {
        display: flex;
      }
      .slide-content {
        position: relative;
        z-index: 10;
        display: flex;
        flex: 1;
        min-width: 0;
        min-height: 0;
        width: 100%;
        flex-direction: var(--slide-content-direction, column);
        align-items: var(--slide-align-x, flex-start);
        justify-content: var(--slide-align-y, center);
        gap: var(--slide-content-gap, 20px);
        overflow: visible;
      }
      .slide-content--freeform {
        height: 100%;
      }
      .slide-content--split {
        --slide-content-direction: row;
        --slide-content-gap: 48px;
        align-items: stretch;
      }
      .slide-split-pane {
        display: flex;
        flex: 1 1 0;
        min-width: 0;
        min-height: 0;
      }
      .slide-split-pane--content {
        flex-direction: column;
        justify-content: center;
      }
      .slide-split-pane--media {
        align-items: center;
        justify-content: center;
      }
      .slide-transition-fade.is-active {
        animation: slide-enter-fade var(--slide-transition-duration, 0.72s) cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .slide-transition-rise.is-active {
        animation: slide-enter-rise var(--slide-transition-duration, 0.72s) cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .slide-transition-push-left.is-active {
        animation: slide-enter-push-left var(--slide-transition-duration, 0.72s) cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .slide-transition-scale.is-active {
        animation: slide-enter-scale var(--slide-transition-duration, 0.72s) cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .slide-transition-wipe.is-active {
        animation: slide-enter-wipe var(--slide-transition-duration, 0.72s) cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .slide-transition-curtain.is-active {
        animation: slide-enter-curtain var(--slide-transition-duration, 0.72s) cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .slide::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--slide-accent) 28%, transparent), transparent 28rem),
          radial-gradient(circle at 90% 70%, color-mix(in srgb, var(--slide-accent) 18%, transparent), transparent 24rem);
        opacity: var(--slide-overlay-opacity, 0.72);
        pointer-events: none;
      }
      .shader-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        display: block;
        pointer-events: none;
      }
      .slide-bg-image {
        position: absolute;
        inset: 0;
        z-index: 0;
        background-position: center;
        background-repeat: no-repeat;
        pointer-events: none;
      }
      .motion-block {
        position: relative;
        width: 100%;
        height: auto;
        z-index: 2;
        opacity: 0;
        transform: translate3d(0, calc(28px * var(--frame-scale, 1)), 0);
      }
      .motion-block--positioned {
        position: absolute;
        left: var(--motion-x, 8%);
        top: var(--motion-y, 12%);
        width: var(--motion-w, 42%);
        height: var(--motion-h, auto);
      }
      .motion-block > * {
        width: 100%;
        height: 100%;
        max-width: none;
      }
      .motion-block:not(.motion-block--positioned):not(.motion-block--full) > * {
        height: auto;
      }
      .motion-block .block-title,
      .motion-block .block-text {
        width: 100%;
        max-width: none;
      }
      .slide.is-active .motion-block {
        animation: enter-motion var(--motion-duration, 0.6s) cubic-bezier(0.22, 1, 0.36, 1) var(--motion-delay, 0s) both;
      }
      .slide.is-active .motion-block.enter-reveal {
        animation-name: enter-reveal-motion;
      }
      .slide.is-active .motion-block.enter-none {
        animation: none;
      }
      .enter-none {
        opacity: 1;
        transform: none;
      }
      .enter-blur-in {
        filter: blur(14px);
        transform: scale(1.04);
      }
      .enter-fade-in {
        transform: none;
      }
      .enter-pop {
        transform: scale(0.72);
      }
      .enter-reveal {
        clip-path: inset(0 100% 0 0);
        transform: translate3d(0, calc(10px * var(--frame-scale, 1)), 0) scale(0.98);
      }
      .enter-rise {
        transform: translate3d(0, calc(42px * var(--frame-scale, 1)), 0) rotate(-1.2deg);
      }
      .enter-zoom-in {
        transform: scale(0.88);
      }
      .enter-slide-left {
        transform: translate3d(calc(54px * var(--frame-scale, 1)), 0, 0);
      }
      .enter-fade-up {
        transform: translate3d(0, calc(28px * var(--frame-scale, 1)), 0);
      }
      @keyframes enter-motion {
        to {
          filter: blur(0);
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1) rotate(0);
        }
      }
      @keyframes enter-reveal-motion {
        to {
          clip-path: inset(0 0 0 0);
          filter: blur(0);
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1) rotate(0);
        }
      }
      @keyframes slide-enter-fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes slide-enter-rise {
        from {
          opacity: 0;
          transform: translate3d(0, calc(36px * var(--frame-scale, 1)), 0) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }
      @keyframes slide-enter-push-left {
        from {
          opacity: 0;
          transform: translate3d(calc(96px * var(--frame-scale, 1)), 0, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }
      @keyframes slide-enter-scale {
        from {
          filter: blur(8px);
          opacity: 0;
          transform: scale(1.08);
        }
        to {
          filter: blur(0);
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes slide-enter-wipe {
        from {
          clip-path: inset(0 100% 0 0);
        }
        to {
          clip-path: inset(0 0 0 0);
        }
      }
      @keyframes slide-enter-curtain {
        from {
          clip-path: inset(0 0 100% 0);
          transform: translate3d(0, calc(18px * var(--frame-scale, 1)), 0);
        }
        to {
          clip-path: inset(0 0 0 0);
          transform: translate3d(0, 0, 0);
        }
      }
      .block-title {
        margin: 0;
        max-width: 48rem;
        border-radius: var(--motion-radius, 0);
        font-size: calc(var(--motion-font-size, 72px) * var(--frame-scale, 1));
        font-weight: var(--motion-font-weight, 650);
        letter-spacing: 0;
        line-height: var(--motion-line-height, 1.02);
        padding: var(--motion-text-padding, 0);
        background: var(--motion-bg, transparent);
        color: var(--motion-fg, var(--slide-fg));
        text-align: var(--motion-text-align, inherit);
      }
      .block-text {
        margin: 0;
        max-width: 46rem;
        border-radius: var(--motion-radius, 0);
        font-size: calc(var(--motion-font-size, 24px) * var(--frame-scale, 1));
        font-weight: var(--motion-font-weight, 400);
        line-height: var(--motion-line-height, 1.45);
        padding: var(--motion-text-padding, 0);
        background: var(--motion-bg, transparent);
        color: var(--motion-fg, var(--slide-muted));
        text-align: var(--motion-text-align, inherit);
      }
      .block-line {
        display: block;
        white-space: pre-wrap;
      }
      .block-line--bullet {
        padding-left: 1.2em;
        text-indent: -1.2em;
      }
      .block-card {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin: 0;
        max-width: 42rem;
        overflow: hidden;
        padding: 20px;
        border-radius: var(--motion-radius, 16px);
        border: 1px solid var(--slide-border);
        background: var(--motion-bg, var(--slide-card));
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        backdrop-filter: blur(16px);
      }
      .block-card--sm {
        max-width: 24rem;
      }
      .block-card--lg {
        max-width: 48rem;
      }
      .block-card--full {
        width: 100%;
        max-width: none;
      }
      .block-card--horizontal {
        flex-direction: row;
        align-items: flex-start;
        gap: 18px;
      }
      .block-card__icon {
        display: grid;
        flex: 0 0 auto;
        width: 36px;
        height: 36px;
        place-items: center;
        margin-bottom: 16px;
        border-radius: 8px;
        border: 1px solid var(--slide-border);
        background: rgba(255,255,255,0.06);
        color: var(--motion-fg, var(--slide-fg));
      }
      .block-card--horizontal .block-card__icon {
        margin-bottom: 0;
      }
      .block-card__content {
        min-width: 0;
      }
      .block-card__icon svg {
        width: 24px;
        height: 24px;
      }
      .block-card h3 {
        margin: 0;
        font-size: 20px;
        line-height: 1.4;
        color: var(--motion-fg, var(--slide-fg));
      }
      .block-card p {
        margin: 8px 0 0;
        font-size: 16px;
        line-height: 1.75;
        color: var(--motion-muted, var(--slide-muted));
      }
      .block-metric {
        margin: 0;
        width: 100%;
        max-width: calc(54rem * var(--frame-scale, 1));
        padding: calc(20px * var(--frame-scale, 1));
        border-radius: var(--motion-radius, 16px);
        border: 1px solid var(--slide-border);
        background: var(--motion-bg, rgba(255,255,255,0.06));
        box-shadow: 0 calc(24px * var(--frame-scale, 1)) calc(72px * var(--frame-scale, 1)) rgba(0,0,0,0.24);
      }
      .block-metric {
        max-width: 24rem;
      }
      .block-metric--md {
        max-width: 28rem;
      }
      .block-metric--lg {
        max-width: 42rem;
      }
      .block-metric--full {
        max-width: none;
      }
      .block-metric__label {
        margin: 0;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--motion-muted, var(--slide-muted));
      }
      .block-metric__value {
        margin: 12px 0 0;
        font-size: 48px;
        font-weight: 650;
        line-height: 1;
        color: var(--motion-fg, var(--slide-fg));
      }
      .block-metric__caption {
        margin: 12px 0 0;
        font-size: 14px;
        line-height: 1.5rem;
        color: var(--motion-muted, var(--slide-muted));
      }
      .block-image {
        margin: 0;
        width: 100%;
        max-width: 54rem;
        overflow: hidden;
        position: relative;
        border-radius: var(--motion-radius, 16px);
        border: 1px solid var(--slide-border);
        background: var(--motion-bg, rgba(255,255,255,0.06));
        box-shadow: 0 24px 72px rgba(0,0,0,0.24);
      }
      .motion-block--positioned .block-image {
        max-width: none;
        border: 0;
        background: transparent;
        box-shadow: none;
      }
      .block-image img {
        display: block;
        width: 100%;
        height: 100%;
        aspect-ratio: auto;
        object-fit: cover;
      }
      .block-image__crop-media {
        position: absolute;
        inset: 0;
        transform-origin: center;
      }
      .block-image img.block-image__crop-image,
      .block-image .block-image__crop-filter {
        display: block;
        position: absolute;
        left: 50%;
        top: 50%;
        width: 100%;
        height: 100%;
        max-width: none;
        aspect-ratio: auto;
        object-fit: fill;
        transform: translate(-50%, -50%);
        transform-origin: center;
      }
      .block-video video,
      .block-video iframe {
        display: block;
        width: 100%;
        height: 100%;
        aspect-ratio: auto;
        border: 0;
        object-fit: cover;
      }
      .block-icon {
        display: grid;
        width: 100%;
        height: 100%;
        place-items: center;
        padding: 16px;
        border-radius: var(--motion-radius, 16px);
        border: 1px solid var(--slide-border);
        background: var(--motion-bg, var(--slide-card));
        color: var(--motion-fg, var(--slide-fg));
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        backdrop-filter: blur(16px);
      }
      .block-icon svg {
        width: 100%;
        height: 100%;
      }
      .block-shape,
      .block-shape svg {
        width: 100%;
        height: 100%;
      }
      .block-shape { position: relative; }
      .shape-line-endpoint { pointer-events: none; position: absolute; top: 50%; color: var(--line-endpoint-color); }
      .shape-line-endpoint--start { left: 0; }
      .shape-line-endpoint--end { right: 0; }
      .shape-line-endpoint--circle { width: calc(10px * var(--line-endpoint-scale, 1)); height: calc(10px * var(--line-endpoint-scale, 1)); border-radius: 999px; background: var(--line-endpoint-color); }
      .shape-line-endpoint--start.shape-line-endpoint--circle { transform: translate(-50%, -50%); }
      .shape-line-endpoint--end.shape-line-endpoint--circle { transform: translate(50%, -50%); }
      .shape-line-endpoint--bar { width: calc(2px * var(--line-endpoint-scale, 1)); height: calc(16px * var(--line-endpoint-scale, 1)); background: var(--line-endpoint-color); }
      .shape-line-endpoint--start.shape-line-endpoint--bar { transform: translate(-50%, -50%); }
      .shape-line-endpoint--end.shape-line-endpoint--bar { transform: translate(50%, -50%); }
      .shape-line-endpoint--arrow { width: 0; height: 0; border-top: calc(6px * var(--line-endpoint-scale, 1)) solid transparent; border-bottom: calc(6px * var(--line-endpoint-scale, 1)) solid transparent; transform: translateY(-50%); }
      .shape-line-endpoint--start.shape-line-endpoint--arrow { border-right: calc(10px * var(--line-endpoint-scale, 1)) solid var(--line-endpoint-color); }
      .shape-line-endpoint--end.shape-line-endpoint--arrow { border-left: calc(10px * var(--line-endpoint-scale, 1)) solid var(--line-endpoint-color); }
      .shape-line-vector-endpoint { position:absolute; top:50%; overflow:visible; pointer-events:none; }
      .shape-line-vector-endpoint--start { left:0; transform:translate(-50%,-50%); }
      .shape-line-vector-endpoint--end { right:0; transform:translate(50%,-50%); }
      .block-stack {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: var(--stack-direction, row);
        align-items: var(--stack-align, stretch);
        gap: var(--stack-gap, 16px);
        padding: var(--stack-padding, 20px);
        border: 1px solid var(--stack-stroke, var(--slide-border));
        border-radius: var(--motion-radius, 16px);
        background: var(--motion-bg, var(--slide-card));
        color: var(--motion-fg, var(--slide-fg));
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        backdrop-filter: blur(16px);
      }
      .block-stack__item {
        display: grid;
        min-width: 0;
        min-height: 0;
        flex: 1;
        place-items: center;
        overflow: hidden;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.06);
        padding: 8px 12px;
        color: inherit;
        font-size: 12px;
        font-weight: 650;
        text-align: center;
      }
      .block-table {
        display: grid;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        border: var(--table-border-width, 1px) var(--table-border-style, solid) var(--table-border, var(--slide-border));
        border-radius: var(--motion-radius, 8px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      }
      .block-table__cell {
        display: flex;
        min-width: 0;
        min-height: 0;
        align-items: var(--table-vertical-align, center);
        justify-content: var(--table-cell-justify, center);
        overflow: hidden;
        border-bottom: var(--table-border-width, 1px) var(--table-border-style, solid) var(--table-border, var(--slide-border));
        border-right: var(--table-border-width, 1px) var(--table-border-style, solid) var(--table-border, var(--slide-border));
        padding: calc(var(--table-padding-y, 8px) * var(--frame-scale, 1)) calc(var(--table-padding-x, 10px) * var(--frame-scale, 1));
        color: inherit;
        font-size: calc(var(--table-font-size, 16px) * var(--frame-scale, 1));
        line-height: 1.25;
        text-align: var(--table-text-align, center);
        white-space: pre-wrap;
        word-break: break-word;
      }
      .motion-block--full {
        position: absolute;
        inset: 0;
        z-index: 0;
        margin: 0;
      }
      .motion-block--positioned > * {
        max-width: none;
      }
      .motion-block--full .block-image {
        width: 100%;
        height: 100%;
        max-width: none;
        border: 0;
        border-radius: var(--motion-radius, 0);
      }
      .motion-block--full .block-image img,
      .motion-block--full .block-video video,
      .motion-block--full .block-video iframe {
        height: 100%;
        aspect-ratio: auto;
      }
      .motion-block--positioned > * {
        width: 100%;
        height: 100%;
        max-width: none;
        margin: 0;
      }
      .player:fullscreen .controls {
        opacity: 0;
        transform: translateX(-50%) translateY(10px);
        transition: opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .player:fullscreen .controls:hover,
      .player:fullscreen.controls-visible .controls {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      .controls {
        position: absolute;
        left: 50%;
        bottom: 32px;
        transform: translateX(-50%);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        width: auto;
        min-width: 440px;
        padding: 10px 24px;
        border-radius: 999px;
        background: rgba(15, 15, 15, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 16px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255,255,255,0.06);
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        transition: opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .button-group {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .control-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: 1px solid transparent;
        border-radius: 50%;
        background: transparent;
        color: #a3a3a3;
        cursor: pointer;
        transition: all 150ms ease;
      }
      .control-button:hover {
        background: rgba(255,255,255,0.1);
        color: #ffffff;
        border-color: rgba(255,255,255,0.05);
        transform: scale(1.05);
      }
      .control-button:active {
        transform: scale(0.95);
      }
      .control-button svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .counter {
        color: #a3a3a3;
        font: 14px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
        font-weight: 500;
        white-space: nowrap;
        margin: 0 4px;
      }
      .counter [data-current] {
        color: #ffffff;
      }
      .progress {
        flex: 1;
        height: 5px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
      }
      .progress span {
        display: block;
        width: var(--progress, 0%);
        height: 100%;
        border-radius: inherit;
        background: #0ea5e9;
        transition: width 220ms ease;
      }
      @media (max-width: 760px) {
        body {
          overflow: auto;
        }
        .player {
          min-height: 100vh;
        }
        .viewport {
          width: 100%;
        }
        .controls {
          grid-template-columns: 1fr;
        }
        .counter {
          text-align: center;
        }
        .button-group {
          justify-content: center;
        }
      }
      @media print {
        @page {
          size: 1024px 576px;
          margin: 0;
        }
        html, body {
          width: 1024px;
          height: 576px;
          margin: 0;
          padding: 0;
          background: #000;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          overflow: visible;
        }
        .player {
          display: block;
          height: auto;
          padding: 0;
          background: transparent;
        }
        .controls {
          display: none !important;
        }
        .stage {
          display: block;
          height: auto;
        }
        .viewport {
          width: 100%;
          max-width: none;
          height: auto;
          aspect-ratio: auto;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          overflow: visible;
        }
        .frame {
          position: relative;
          width: 100%;
          height: auto;
          transform: none;
          overflow: visible;
        }
        .slide {
          position: relative;
          display: block !important;
          width: 1024px;
          height: 576px;
          page-break-after: always;
          page-break-inside: avoid;
          overflow: hidden;
          opacity: 1 !important;
          transform: none !important;
          margin-bottom: 0;
        }
        * {
          transition: none !important;
          animation: none !important;
        }
        .motion-block {
          opacity: 1 !important;
          transform: translate3d(0, 0, 0) scale(1) !important;
        }
        .shader-bg {
          display: none !important;
        }
        .slide-bg-image {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .slide::before {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }`;
