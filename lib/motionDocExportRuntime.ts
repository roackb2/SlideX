export const motionDocExportRuntime = `      (() => {
        const slides = Array.from(document.querySelectorAll(".slide"));
        const progress = document.querySelector(".progress span");
        const current = document.querySelector("[data-current]");
        const playButton = document.querySelector('[data-action="play"]');
        const fullscreenButton = document.querySelector('[data-action="fullscreen"]');
        const player = document.querySelector(".player");
        const viewport = document.querySelector(".viewport");
        let index = 0;
        let timer = null;

        function updateFrameScale() {
          if (!viewport) return;
          const rect = viewport.getBoundingClientRect();
          viewport.style.setProperty("--frame-scale", String(rect.width / 1024));
        }

        function render(nextIndex, replay = false) {
          if (slides.length === 0) return;
          index = (nextIndex + slides.length) % slides.length;
          slides.forEach((slide) => slide.classList.remove("is-active"));
          const activeSlide = slides[index];

          if (replay) {
            activeSlide.getBoundingClientRect();
          }

          activeSlide.classList.add("is-active");
          if (current) current.textContent = String(index + 1);
          if (progress) progress.style.setProperty("--progress", slides.length <= 1 ? "100%" : ((index + 1) / slides.length * 100).toFixed(2) + "%");
        }

        function stop() {
          window.clearTimeout(timer);
          timer = null;
          if (playButton) playButton.textContent = "▶";
        }

        function play() {
          stop();
          if (playButton) playButton.textContent = "Ⅱ";
          const tick = () => {
            const duration = Number(slides[index]?.dataset.duration || 5);
            timer = window.setTimeout(() => {
              render(index + 1);
              tick();
            }, Math.max(duration, 1) * 1000);
          };
          tick();
        }

        async function toggleFullscreen() {
          if (!player) return;

          if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
          }

          if (player.requestFullscreen) {
            await player.requestFullscreen();
          }
        }

        function updateFullscreenButton() {
          updateFrameScale();
          if (!fullscreenButton) return;
          fullscreenButton.textContent = document.fullscreenElement ? "×" : "⛶";
          fullscreenButton.setAttribute("aria-label", document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen");
        }

        document.addEventListener("click", (event) => {
          const button = event.target.closest("[data-action]");
          if (!button) return;
          const action = button.dataset.action;

          if (action === "prev") {
            stop();
            render(index - 1);
          }
          if (action === "next") {
            stop();
            render(index + 1);
          }
          if (action === "replay") {
            render(index, true);
          }
          if (action === "play") {
            timer ? stop() : play();
          }
          if (action === "fullscreen") {
            toggleFullscreen().catch(() => {});
          }
        });

        document.addEventListener("fullscreenchange", updateFullscreenButton);
        window.addEventListener("resize", updateFrameScale);

        document.addEventListener("keydown", (event) => {
          if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
            event.preventDefault();
            stop();
            render(index + 1);
          }
          if (event.key === "ArrowLeft" || event.key === "PageUp") {
            event.preventDefault();
            stop();
            render(index - 1);
          }
          if (event.key === "Home") {
            stop();
            render(0);
          }
          if (event.key === "End") {
            stop();
            render(slides.length - 1);
          }
          if (event.key.toLowerCase() === "f") {
            event.preventDefault();
            toggleFullscreen().catch(() => {});
          }
        });

        updateFrameScale();
        render(0);
        updateFullscreenButton();
      })();`;
