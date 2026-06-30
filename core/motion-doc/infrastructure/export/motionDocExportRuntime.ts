import {
  makeRuntimePremiumShaderBody,
  PREMIUM_SHADER_IDS
} from "@/core/motion-doc/application/shaders/premiumShaderBodies";

const runtimePremiumShaderBody = escapeRuntimeTemplateLiteral(makeRuntimePremiumShaderBody());
const runtimePremiumShaderIds = JSON.stringify(PREMIUM_SHADER_IDS);

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

        // ── Shader Background System ──
        const THREE_MODULE_URL = "https://unpkg.com/three@0.184.0/build/three.module.js";
        const SHADER_VERTEX = \`#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  vUv = vec2(x, y) * 0.5;
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0);
}\`;
        const SHADER_VERTEX_THREE = \`precision highp float;
in vec3 position;
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}\`;
        const NOISE = \`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0;float a=0.5;mat2 r=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.0;a*=0.5;}return v;}
\`;
        const PREMIUM_FRAGMENT = \`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform float u_intensity;
uniform float u_speed;
uniform float u_softness;
uniform float u_scale;
uniform float u_detail;
uniform int u_variant;
\${NOISE}
${runtimePremiumShaderBody}
\`;
        const PREMIUM_SHADER_IDS = ${runtimePremiumShaderIds};
        const SHADER_FRAGS = Object.fromEntries(PREMIUM_SHADER_IDS.map((id) => [id, PREMIUM_FRAGMENT]));
        function hexToVec3(hex) {
          const c = hex.replace('#','');
          const f = c.length===3 ? c[0]+c[0]+c[1]+c[1]+c[2]+c[2] : c;
          return [parseInt(f.slice(0,2),16)/255, parseInt(f.slice(2,4),16)/255, parseInt(f.slice(4,6),16)/255];
        }

        let threeModulePromise = null;

        function loadThree() {
          if (!threeModulePromise) {
            threeModulePromise = import(THREE_MODULE_URL);
          }

          return threeModulePromise;
        }

        function initWebglShader(canvas) {
          const id = canvas.dataset.shader;
          const frag = SHADER_FRAGS[id];
          if (!frag) return null;
          const gl = canvas.getContext('webgl2', {alpha:true, antialias:false, premultipliedAlpha:false, preserveDrawingBuffer: true});
          if (!gl) return null;
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          function compile(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : (gl.deleteShader(s), null);
          }
          const vs = compile(gl.VERTEX_SHADER, SHADER_VERTEX);
          const fs = compile(gl.FRAGMENT_SHADER, frag);
          if (!vs || !fs) return null;
          const prog = gl.createProgram();
          gl.attachShader(prog, vs); gl.attachShader(prog, fs);
          gl.linkProgram(prog);
          if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
          gl.useProgram(prog);
          const vao = gl.createVertexArray();
          gl.bindVertexArray(vao);
          const c1 = hexToVec3(canvas.dataset.shaderColor1 || '#7c3aed');
          const c2 = hexToVec3(canvas.dataset.shaderColor2 || '#0a0a1a');
          const c3 = hexToVec3(canvas.dataset.shaderColor3 || '#06b6d4');
          const intensity = parseFloat(canvas.dataset.shaderIntensity) || 0.5;
          const speed = parseFloat(canvas.dataset.shaderSpeed) || 1;
          const softness = parseFloat(canvas.dataset.shaderSoftness) || 0.5;
          const scale = parseFloat(canvas.dataset.shaderScale) || 0.5;
          const detail = parseFloat(canvas.dataset.shaderDetail) || 0.5;
          const variant = parseInt(canvas.dataset.shaderVariant || '0', 10) || 0;
          return { kind: 'webgl', gl, prog, c1, c2, c3, intensity, speed, softness, scale, detail, variant, start: performance.now(), raf: 0 };
        }

        function initThreeShader(canvas, THREE) {
          const id = canvas.dataset.shader;
          const frag = SHADER_FRAGS[id];
          if (!frag) return null;

          let renderer;

          try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, canvas, premultipliedAlpha: false, preserveDrawingBuffer: true });
          } catch (_) {
            return null;
          }

          const uniforms = {
            u_color1: { value: safeThreeColor(THREE, canvas.dataset.shaderColor1 || '#7c3aed') },
            u_color2: { value: safeThreeColor(THREE, canvas.dataset.shaderColor2 || '#0a0a1a') },
            u_color3: { value: safeThreeColor(THREE, canvas.dataset.shaderColor3 || '#06b6d4') },
            u_detail: { value: parseFloat(canvas.dataset.shaderDetail) || 0.5 },
            u_intensity: { value: parseFloat(canvas.dataset.shaderIntensity) || 0.5 },
            u_resolution: { value: new THREE.Vector2(1, 1) },
            u_scale: { value: parseFloat(canvas.dataset.shaderScale) || 0.5 },
            u_softness: { value: parseFloat(canvas.dataset.shaderSoftness) || 0.5 },
            u_speed: { value: parseFloat(canvas.dataset.shaderSpeed) || 1 },
            u_time: { value: 0 },
            u_variant: { value: parseInt(canvas.dataset.shaderVariant || '0', 10) || 0 }
          };
          const material = new THREE.RawShaderMaterial({
            depthTest: false,
            depthWrite: false,
            fragmentShader: stripGlslVersion(frag),
            glslVersion: THREE.GLSL3,
            transparent: true,
            uniforms,
            vertexShader: SHADER_VERTEX_THREE
          });
          const scene = new THREE.Scene();
          const camera = new THREE.Camera();
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
          scene.add(mesh);
          renderer.setClearColor(0x000000, 0);
          if (THREE.SRGBColorSpace) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
          }

          return { kind: 'three', camera, material, mesh, renderer, scene, start: performance.now(), uniforms, raf: 0 };
        }

        function safeThreeColor(THREE, value) {
          try {
            return new THREE.Color(value);
          } catch (_) {
            return new THREE.Color('#000000');
          }
        }

        function stripGlslVersion(source) {
          return source.replace(/^#version\\s+300\\s+es\\s*\\n/, '');
        }

        const shaderStates = new Map();

        function startShader(canvas) {
          if (shaderStates.has(canvas)) return;

          if (canvas.dataset.shaderEngine === 'three') {
            loadThree()
              .then((THREE) => {
                if (shaderStates.has(canvas) || !canvas.isConnected) return;
                const slide = canvas.closest('.slide');
                if (slide && !slide.classList.contains('is-active')) return;
                const state = initThreeShader(canvas, THREE);
                startShaderState(canvas, state || initWebglShader(canvas));
              })
              .catch(() => startShaderState(canvas, initWebglShader(canvas)));
            return;
          }

          startShaderState(canvas, initWebglShader(canvas));
        }

        function startShaderState(canvas, state) {
          if (!state || shaderStates.has(canvas)) return;
          shaderStates.set(canvas, state);
          function tick() {
            if (state.kind === 'three') {
              const dpr = Math.min(devicePixelRatio || 1, 2);
              const w = Math.max(canvas.clientWidth, 1);
              const h = Math.max(canvas.clientHeight, 1);
              state.renderer.setPixelRatio(dpr);
              state.renderer.setSize(w, h, false);
              state.uniforms.u_resolution.value.set(Math.round(w * dpr), Math.round(h * dpr));
              state.uniforms.u_time.value = (performance.now() - state.start) / 1000;
              state.renderer.render(state.scene, state.camera);
            } else {
              const {gl, prog, c1, c2, c3, intensity, speed, softness, scale, detail, variant, start} = state;
              const dpr = Math.min(devicePixelRatio||1,2);
              const w = Math.round(canvas.clientWidth*dpr);
              const h = Math.round(canvas.clientHeight*dpr);
              if (canvas.width!==w||canvas.height!==h) { canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h); }
              const t = (performance.now()-start)/1000;
              gl.useProgram(prog);
              gl.uniform1f(gl.getUniformLocation(prog,'u_time'),t);
              gl.uniform2f(gl.getUniformLocation(prog,'u_resolution'),w,h);
              gl.uniform3f(gl.getUniformLocation(prog,'u_color1'),c1[0],c1[1],c1[2]);
              gl.uniform3f(gl.getUniformLocation(prog,'u_color2'),c2[0],c2[1],c2[2]);
              gl.uniform3f(gl.getUniformLocation(prog,'u_color3'),c3[0],c3[1],c3[2]);
              gl.uniform1f(gl.getUniformLocation(prog,'u_intensity'),intensity);
              gl.uniform1f(gl.getUniformLocation(prog,'u_speed'),speed);
              gl.uniform1f(gl.getUniformLocation(prog,'u_softness'),softness);
              gl.uniform1f(gl.getUniformLocation(prog,'u_scale'),scale);
              gl.uniform1f(gl.getUniformLocation(prog,'u_detail'),detail);
              gl.uniform1i(gl.getUniformLocation(prog,'u_variant'),variant);
              gl.drawArrays(gl.TRIANGLES,0,3);
            }
            state.raf = requestAnimationFrame(tick);
          }
          state.raf = requestAnimationFrame(tick);
        }

        function stopShader(canvas) {
          const state = shaderStates.get(canvas);
          if (!state) return;
          cancelAnimationFrame(state.raf);
          if (state.kind === 'three') {
            state.scene.remove(state.mesh);
            state.mesh.geometry.dispose();
            state.material.dispose();
            state.renderer.dispose();
          } else {
            state.gl.getExtension('WEBGL_lose_context')?.loseContext();
          }
          shaderStates.delete(canvas);
        }

        // Hook into slide transitions
        const origRender = render;
        render = function(nextIndex, replay) {
          // Stop all shaders before transition
          shaderStates.forEach((_, canvas) => stopShader(canvas));
          origRender(nextIndex, replay);
          // Start shader on active slide
          const active = slides[index];
          if (active) {
            const shaderCanvas = active.querySelector('.shader-bg');
            if (shaderCanvas) startShader(shaderCanvas);
          }
        };

        // Stop all shaders before print to prevent GPU overload during PDF export
        window.addEventListener('beforeprint', () => {
          shaderStates.forEach((_, canvas) => stopShader(canvas));
        });
        window.addEventListener('afterprint', () => {
          const active = slides[index];
          if (active) {
            const shaderCanvas = active.querySelector('.shader-bg');
            if (shaderCanvas) startShader(shaderCanvas);
          }
        });

        // Initial shader start
        if (slides[0]) {
          const sc = slides[0].querySelector('.shader-bg');
          if (sc) startShader(sc);
        }
      })();`;

function escapeRuntimeTemplateLiteral(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}
