export const motionDocExportStyles = `      :root {
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
        background: #050505;
        color: #ffffff;
        overflow: hidden;
      }
      button {
        font: inherit;
      }
      .player {
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        height: 100vh;
        padding: clamp(14px, 2vw, 28px);
        gap: 14px;
      }
      .player:fullscreen {
        background: #050505;
        padding: 0;
      }
      .player:fullscreen .stage {
        padding: min(3vh, 28px);
      }
      .player:fullscreen .viewport {
        width: min(100vw, 177.777vh);
        max-width: none;
        border-radius: 0;
        border-color: transparent;
        box-shadow: none;
      }
      .player:fullscreen .controls {
        position: fixed;
        right: 18px;
        bottom: 18px;
        left: 18px;
        width: auto;
        opacity: 0.18;
        transition: opacity 160ms ease;
      }
      .player:fullscreen .controls:hover {
        opacity: 1;
      }
      .stage {
        display: grid;
        min-height: 0;
        place-items: center;
      }
      .viewport {
        position: relative;
        width: min(100%, calc((100vh - 98px) * 16 / 9));
        max-width: 1440px;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.14);
        background: #0a0a0a;
        box-shadow: 0 28px 90px rgba(0,0,0,0.58);
      }
      .slide {
        position: absolute;
        inset: 0;
        display: none;
        overflow: hidden;
        background: var(--slide-bg);
        color: var(--slide-fg);
      }
      .slide.is-active {
        display: block;
      }
      .slide::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--slide-accent) 28%, transparent), transparent 28rem),
          radial-gradient(circle at 90% 70%, color-mix(in srgb, var(--slide-accent) 18%, transparent), transparent 24rem);
        opacity: 0.72;
        pointer-events: none;
      }
      .slide__content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: var(--slide-direction);
        gap: clamp(20px, 4vw, 52px);
        width: 100%;
        height: 100%;
        padding: clamp(24px, 4vw, 64px);
        justify-content: var(--slide-align-y);
        align-items: var(--slide-align-x);
        text-align: var(--slide-text-align);
      }
      .slide__column,
      .slide__image-column {
        display: flex;
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        min-width: 0;
      }
      .slide__image-column {
        align-items: center;
      }
      .motion-block {
        opacity: 0;
        margin-bottom: var(--motion-mb, 18px);
        transform: translate3d(0, 28px, 0);
      }
      .slide.is-active .motion-block {
        animation: enter-motion var(--motion-duration, 0.6s) cubic-bezier(0.22, 1, 0.36, 1) var(--motion-delay, 0s) both;
      }
      .enter-fade-in {
        transform: none;
      }
      .enter-zoom-in {
        transform: scale(0.88);
      }
      .enter-slide-left {
        transform: translate3d(54px, 0, 0);
      }
      .enter-fade-up {
        transform: translate3d(0, 28px, 0);
      }
      @keyframes enter-motion {
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }
      .block-title {
        margin: 0;
        max-width: 13ch;
        font-size: clamp(42px, 7vw, 96px);
        font-weight: 650;
        letter-spacing: 0;
        line-height: 0.98;
        color: var(--slide-fg);
      }
      .block-text {
        margin: 0;
        max-width: 46rem;
        font-size: clamp(18px, 2.1vw, 32px);
        line-height: 1.55;
        color: var(--slide-muted);
      }
      .block-card {
        display: flex;
        flex-direction: column;
        gap: 0;
        max-width: 48rem;
        overflow: hidden;
        padding: clamp(18px, 2.2vw, 30px);
        border-radius: 14px;
        border: 1px solid var(--slide-border);
        background: var(--slide-card);
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        backdrop-filter: blur(16px);
      }
      .card-group {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: stretch;
        width: 100%;
      }
      .card-group--grid > .card-group__item {
        flex: 1 1 min(240px, 100%);
      }
      .card-group--row > .card-group__item {
        flex: 0 1 auto;
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
        width: 42px;
        height: 42px;
        place-items: center;
        margin-bottom: 18px;
        border-radius: 10px;
        border: 1px solid var(--slide-border);
        background: rgba(255,255,255,0.06);
        color: var(--slide-fg);
      }
      .block-card--horizontal .block-card__icon {
        margin-bottom: 0;
      }
      .block-card__content {
        min-width: 0;
      }
      .block-card__icon svg {
        width: 20px;
        height: 20px;
      }
      .block-card h3 {
        margin: 0;
        font-size: clamp(19px, 2vw, 30px);
        line-height: 1.15;
        color: var(--slide-fg);
      }
      .block-card p {
        margin: 10px 0 0;
        font-size: clamp(15px, 1.25vw, 20px);
        line-height: 1.65;
        color: var(--slide-muted);
      }
      .block-metric,
      .block-chart {
        width: 100%;
        max-width: 54rem;
        padding: clamp(18px, 2.2vw, 30px);
        border-radius: 14px;
        border: 1px solid var(--slide-border);
        background: var(--slide-card);
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        backdrop-filter: blur(16px);
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
        color: var(--slide-muted);
      }
      .block-metric__value {
        margin: 14px 0 0;
        font-size: clamp(42px, 6vw, 72px);
        font-weight: 650;
        line-height: 0.95;
        color: var(--slide-fg);
      }
      .block-metric__caption {
        margin: 14px 0 0;
        font-size: 15px;
        line-height: 1.6;
        color: var(--slide-muted);
      }
      .block-chart h3 {
        margin: 0;
        font-size: clamp(19px, 2vw, 30px);
        color: var(--slide-fg);
      }
      .block-chart--sm {
        max-width: 36rem;
      }
      .block-chart--md {
        max-width: 42rem;
      }
      .block-chart--full {
        max-width: none;
      }
      .block-chart__bars {
        display: flex;
        align-items: end;
        gap: 12px;
        min-height: calc(var(--chart-height, 156px) + 54px);
        margin-top: 24px;
      }
      .block-chart__bar-wrap {
        display: flex;
        min-width: 0;
        flex: 1;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .block-chart__track {
        display: flex;
        width: 100%;
        height: var(--chart-height, 156px);
        align-items: end;
        overflow: hidden;
        border-radius: 8px;
        background: rgba(255,255,255,0.06);
      }
      .block-chart__bar {
        width: 100%;
        border-radius: 8px;
        background: var(--slide-fg);
      }
      .block-chart__label {
        max-width: 100%;
        overflow: hidden;
        color: var(--slide-muted);
        font-size: 10px;
        letter-spacing: 0.1em;
        text-overflow: ellipsis;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .block-image {
        width: 100%;
        max-width: 54rem;
        overflow: hidden;
        border-radius: 18px;
        border: 1px solid var(--slide-border);
        background: rgba(255,255,255,0.06);
        box-shadow: 0 24px 72px rgba(0,0,0,0.24);
      }
      .block-image img {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }
      .motion-block--full {
        position: absolute;
        inset: 0;
        z-index: 0;
        margin: 0;
      }
      .motion-block--full .block-image {
        width: 100%;
        height: 100%;
        max-width: none;
        border: 0;
        border-radius: 0;
      }
      .motion-block--full .block-image img {
        height: 100%;
        aspect-ratio: auto;
      }
      .slide-meta {
        position: absolute;
        top: 18px;
        right: 18px;
        z-index: 2;
        padding: 7px 10px;
        border-radius: 999px;
        background: rgba(0,0,0,0.2);
        color: var(--slide-muted);
        font: 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      .controls {
        display: grid;
        grid-template-columns: auto minmax(160px, 1fr) auto;
        align-items: center;
        gap: 12px;
        width: min(100%, 1440px);
        margin: 0 auto;
      }
      .button-group {
        display: flex;
        gap: 8px;
      }
      .control-button {
        min-width: 38px;
        height: 34px;
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 8px;
        background: rgba(255,255,255,0.06);
        color: #f8fafc;
        cursor: pointer;
      }
      .control-button:hover {
        background: rgba(255,255,255,0.12);
      }
      .counter {
        color: #a3a3a3;
        font: 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
        white-space: nowrap;
      }
      .progress {
        height: 6px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255,255,255,0.1);
      }
      .progress span {
        display: block;
        width: var(--progress, 0%);
        height: 100%;
        border-radius: inherit;
        background: #ffffff;
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
        .slide__content {
          flex-direction: column;
          padding: 22px;
        }
        .slide-meta {
          display: none;
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
      }`;
