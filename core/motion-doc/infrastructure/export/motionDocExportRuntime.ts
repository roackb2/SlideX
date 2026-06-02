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
        const SHADER_VERTEX = \`#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  vUv = vec2(x, y) * 0.5;
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0);
}\`;
        const NOISE = \`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0;float a=0.5;mat2 r=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.0;a*=0.5;}return v;}
\`;
        const SHADER_FRAGS = {
          "aurora": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
float starHash(vec2 p){p=fract(p*vec2(443.8975,397.2973));p+=dot(p.xy,p.yx+19.19);return fract(p.x*p.y);}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.15;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;float stars=0.0;vec2 starGrid=p*80.0;vec2 gridId=floor(starGrid);float n=starHash(gridId);if(n>0.985){float twinkle=sin(t*4.0+n*6.28)*0.5+0.5;stars=smoothstep(0.06,0.01,length(fract(starGrid)-0.5))*twinkle*(n-0.985)*60.0;}vec3 starColor=vec3(stars)*0.85;vec3 auroraCol=vec3(0.0);for(int i=0;i<3;i++){float fi=float(i);float layerTime=t+fi*15.0;float curve=sin(p.x*(1.2+fi*0.4)+layerTime*0.5)*0.15+cos(p.x*(0.8-fi*0.2)-layerTime*0.3)*0.1;float curtainY=p.y-(0.05+fi*0.08)-curve;float rayVal=fbm(vec2(p.x*(15.0-fi*3.0)+layerTime*0.8,curtainY*0.8));float intensityMod=smoothstep(0.2,0.0,abs(curtainY))*0.9;float upwardDecay=exp(-3.2*max(curtainY,0.0));float curtainGlow=intensityMod*upwardDecay*(0.25+0.75*rayVal);vec3 layerColor=(i==0)?u_color1:((i==1)?u_color2:u_color3);auroraCol+=layerColor*curtainGlow*(1.5+0.5*sin(p.x*25.0-layerTime*2.0));}vec3 finalCol=starColor+mix(u_color2*0.02,u_color1*0.03,uv.y)+auroraCol;finalCol*=smoothstep(0.0,0.12,uv.y);finalCol*=smoothstep(1.3,0.5,length(p));fragColor=vec4(finalCol*u_intensity,1.0);}\`,
          "mesh-gradient": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.15;vec2 q=vec2(fbm(uv*1.5+vec2(t*0.2,t*0.1)),fbm(uv*2.0-vec2(t*0.1,t*0.2)));vec2 r=vec2(fbm(uv*2.5+q*1.8+vec2(t*0.15,t*0.15)),fbm(uv*2.0+q*1.2-vec2(t*0.2,t*0.2)));vec2 dUv=uv+r*0.38;vec2 c1=vec2(0.25+sin(t*0.7)*0.2,0.3+cos(t*0.5)*0.25);vec2 c2=vec2(0.75+cos(t*0.6)*0.25,0.7+sin(t*0.8)*0.2);float w1=1.0-smoothstep(0.0,0.8,length(dUv-c1));float w2=1.0-smoothstep(0.0,0.9,length(dUv-c2));vec3 sCol=0.5+0.5*cos(length(dUv)*6.28+vec3(0.0,2.0,4.0)+t);vec3 bCol=mix(u_color1,u_color2,w1);bCol=mix(bCol,u_color3,w2*0.8);vec3 col=mix(bCol,sCol*u_color3,0.28);col+=u_color1*0.15*(1.0-w1);float grain=hash(uv*1234.56+vec2(fract(sin(t*987.65)*4321.0)));col+=(grain-0.5)*0.045*(0.3+0.7*u_intensity);fragColor=vec4(col*u_intensity,1.0);}\`,
          "noise-fog": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.12;vec2 uv1=uv*2.0+vec2(t*0.25,t*0.1);float n1=fbm(uv1+vec2(fbm(uv1*1.5-vec2(t*0.1))));vec2 uv2=uv*3.5-vec2(t*0.15,t*0.3);float n2=fbm(uv2+vec2(n1));float density=smoothstep(0.2,0.8,(n1+n2)*0.5);vec3 col=mix(u_color1*0.2,u_color2,density);col=mix(col,u_color3*1.2,smoothstep(0.4,0.9,n2)*0.7);vec2 eps=vec2(0.015,0.0);float nx=fbm(uv2+vec2(eps.x,eps.y))-fbm(uv2-vec2(eps.x,eps.y));float ny=fbm(uv2+vec2(eps.y,eps.x))-fbm(uv2-vec2(eps.y,eps.x));vec3 normal=normalize(vec3(-nx,-ny,0.08));vec3 lightDir=normalize(vec3(0.5,0.5,0.5));float diffuse=max(dot(normal,lightDir),0.0);col+=u_color3*diffuse*density*0.45;float rim=pow(1.0-max(dot(normal,vec3(0.0,0.0,1.0)),0.0),3.0);col+=u_color1*rim*density*0.3;float dist=length(uv-0.5);col*=smoothstep(1.3,0.25,dist);col+=u_color2*pow(density,4.0)*0.3;fragColor=vec4(col*u_intensity,1.0);}\`,
          "geometric-grid": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.4;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;float warp=fbm(uv*1.5+vec2(t*0.15))*0.1;vec2 warpedUv=uv+vec2(warp);vec2 gridVal=warpedUv*aspect*15.0;vec2 gridFract=fract(gridVal);vec2 gridDist=abs(gridFract-0.5);float lineX=0.006/(gridDist.x+0.002);float lineY=0.006/(gridDist.y+0.002);float gridLines=max(lineX,lineY);gridLines*=smoothstep(0.7,0.4,max(abs(p.x),abs(p.y)));float r1=length(p+vec2(sin(t*0.5)*0.2,cos(t*0.3)*0.2));float r2=length(p-vec2(cos(t*0.4)*0.3,sin(t*0.6)*0.1));float wave1=sin(r1*12.0-t*2.5)*0.5+0.5;float wave2=sin(r2*8.0-t*1.8)*0.5+0.5;float pulse=mix(wave1,wave2,0.5);vec2 cellId=floor(gridVal);float packetProb=hash(cellId);float packetGlow=0.0;if(packetProb>0.7){float offset=fract(t*0.8+packetProb*5.0);float dX=abs(gridFract.x-offset);float dY=abs(gridFract.y-offset);packetGlow=smoothstep(0.08,0.0,dX)*lineY*0.35+smoothstep(0.08,0.0,dY)*lineX*0.35;}float dots=smoothstep(0.12,0.01,length(gridFract-0.5));vec3 col=u_color1*gridLines*0.22+u_color2*gridLines*pulse*0.35+u_color3*dots*(0.3+0.7*pulse)*1.2+u_color3*packetGlow*1.5;col+=u_color1*0.035*(1.0-length(p))+u_color2*0.02*pulse;col*=smoothstep(1.2,0.3,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "particle-field": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.15;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;float nebula=fbm(uv*1.8+vec2(t*0.05,-t*0.03));vec3 col=mix(u_color1*0.06,u_color2*0.08,nebula)+u_color3*0.02*fbm(uv*3.0-vec2(t*0.1));for(int layer=0;layer<3;layer++){float layerF=float(layer);float scale=4.0+layerF*3.5;vec2 drift=vec2(t*(0.12-layerF*0.02),t*(0.05+layerF*0.015));vec2 gridUv=p*scale+drift;vec2 gridId=floor(gridUv);vec2 gridFract=fract(gridUv)-0.5;vec2 randSeed=gridId+vec2(layerF*13.57);float h1=hash(randSeed);float h2=hash(randSeed+57.23);float h3=hash(randSeed+91.85);if(h1>0.45){vec2 offset=vec2(sin(t*0.8+h2*6.28),cos(t*0.6+h3*6.28))*0.3;vec2 particlePos=gridFract-offset;float dist=length(particlePos);float coreSize=0.008+h3*0.012;float haloSize=coreSize*(4.0+h2*8.0);float core=smoothstep(coreSize,0.0,dist)*1.5;float halo=smoothstep(haloSize,0.0,dist)*0.4;float twinkle=0.4+0.6*sin(t*(1.2+h1*2.0)+h2*10.0);float depthFade=(1.0/(layerF+1.0))*(0.3+0.7*h3);vec3 pColor=mix(u_color1,u_color3,h1);pColor=mix(pColor,u_color2,h2*0.3);col+=pColor*(core+halo)*twinkle*depthFade;}}col*=smoothstep(1.3,0.4,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "wave-distortion": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.12;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;float w1=sin(p.x*5.0+p.y*3.5+t*1.5)*0.4;float w2=cos(p.y*6.0-p.x*3.0-t*1.1)*0.35;float w3=sin(length(p)*7.5-t*1.8)*0.3;float h=w1+w2+w3;float eps=0.015;float hX=sin((p.x+eps)*5.0+p.y*3.5+t*1.5)*0.4+cos(p.y*6.0-(p.x+eps)*3.0-t*1.1)*0.35+sin(length(p+vec2(eps,0.0))*7.5-t*1.8)*0.3;float hY=sin(p.x*5.0+(p.y+eps)*3.5+t*1.5)*0.4+cos((p.y+eps)*6.0-p.x*3.0-t*1.1)*0.35+sin(length(p+vec2(0.0,eps))*7.5-t*1.8)*0.3;vec2 slope=vec2(hX-h,hY-h)/eps;vec2 uvR=uv+slope*0.042;vec2 uvG=uv+slope*0.038;vec2 uvB=uv+slope*0.034;vec3 col;col.r=fbm(uvR*2.0+vec2(t*0.08));col.g=fbm(uvG*2.0+vec2(t*0.08));col.b=fbm(uvB*2.0+vec2(t*0.08));vec3 chrome=mix(u_color1,u_color2,col.g);chrome=mix(chrome,u_color3*1.2,col.r*0.5);vec3 normal=normalize(vec3(-slope,0.1));vec3 light=normalize(vec3(0.5,0.5,0.5));vec3 view=vec3(0.0,0.0,1.0);vec3 halfVec=normalize(light+view);float spec=pow(max(dot(normal,halfVec),0.0),32.0);col=chrome*(0.4+0.6*h)+vec3(spec*0.7)*u_color3;float edge=smoothstep(0.92,1.0,sin(h*10.0+t));col+=u_color3*edge*0.3;col*=smoothstep(1.3,0.45,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-classic": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.1;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*380.0;float fiber=noise(pUv)*0.6+noise(pUv*2.0)*0.4;vec2 eps=vec2(0.003,0.0);float nx=noise(pUv+vec2(eps.x,eps.y))-noise(pUv-vec2(eps.x,eps.y));float ny=noise(pUv+vec2(eps.y,eps.x))-noise(pUv-vec2(eps.y,eps.x));vec3 normal=normalize(vec3(-nx*0.3,-ny*0.3,0.08));vec3 lightDir=normalize(vec3(-0.5,0.5,0.7));vec3 paperBase=vec3(0.97,0.96,0.94)*(0.92+0.08*max(dot(normal,lightDir),0.0));vec2 q=vec2(fbm(uv*2.8+vec2(t*0.15,t*0.05)),fbm(uv*3.0-vec2(t*0.05,t*0.1)));vec2 r=vec2(fbm(uv*3.5+q*1.5+vec2(t*0.1,t*0.2)),fbm(uv*3.2-q*1.8-vec2(t*0.15,t*0.08)));float bleedVal=fbm(uv*2.2+r*1.3);float shape=smoothstep(0.2,0.65,bleedVal);float ring=smoothstep(0.04,0.0,abs(bleedVal-0.45));float ringGlow=smoothstep(0.08,0.0,abs(bleedVal-0.45));vec3 paint=mix(u_color1,u_color2,smoothstep(0.3,0.7,bleedVal));paint=mix(paint,u_color3*0.7,ring*0.55+ringGlow*0.15);vec3 paintedPaper=paint*paperBase*(1.0-fiber*0.08);vec3 col=mix(paperBase,paintedPaper,shape);col*=smoothstep(1.3,0.5,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-wet": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.15;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*320.0;float fiber=noise(pUv)*0.5+noise(pUv*2.0)*0.5;vec3 paperBase=vec3(0.96,0.95,0.93)*(0.94+0.06*noise(pUv*0.5));vec2 warp1=vec2(sin(uv.y*3.0+t),cos(uv.x*3.0-t))*0.15;vec2 warp2=vec2(fbm(uv*4.0+warp1*2.0),fbm(uv*3.5-warp1*1.5))*0.25;vec2 warp3=vec2(fbm(uv*5.0+warp2*1.8),fbm(uv*4.5-warp2*2.0));float flowVal=fbm(uv*1.8+warp3*1.5);float shape=smoothstep(0.15,0.7,flowVal);vec3 paint=mix(u_color1,u_color2,flowVal);float eddy=sin(flowVal*12.0+t*2.0)*0.5+0.5;paint=mix(paint,u_color3,eddy*0.3);float wetEdge=smoothstep(0.08,0.0,abs(flowVal-0.45))*0.25;paint=mix(paint,u_color1*0.5,wetEdge);vec3 paintedPaper=paint*paperBase*(1.0-fiber*0.06);vec3 col=mix(paperBase,paintedPaper,shape);col*=smoothstep(1.3,0.45,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-rough": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.05;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*480.0;float fiber=noise(pUv)*0.7+noise(pUv*2.5)*0.3;vec2 eps=vec2(0.002,0.0);float nx=noise(pUv+vec2(eps.x,eps.y))-noise(pUv-vec2(eps.x,eps.y));float ny=noise(pUv+vec2(eps.y,eps.x))-noise(pUv-vec2(eps.y,eps.x));vec3 normal=normalize(vec3(-nx*0.8,-ny*0.8,0.04));vec3 lightDir=normalize(vec3(-0.6,0.6,0.5));vec3 paperBase=vec3(0.96,0.95,0.93)*(0.85+0.15*max(dot(normal,lightDir),0.0));vec2 q=vec2(fbm(uv*2.0+t),fbm(uv*2.5-t));float bleedVal=fbm(uv*1.5+q*0.8);float dryBrushMask=smoothstep(0.4,0.75,fiber);float shape=smoothstep(0.25,0.6,bleedVal)*dryBrushMask;vec3 paint=mix(u_color1,u_color2,bleedVal);float edge=smoothstep(0.03,0.0,abs(bleedVal-0.55))*dryBrushMask;paint=mix(paint,u_color3*0.6,edge*0.8);vec3 paintedPaper=paint*paperBase*(1.0-fiber*0.15);vec3 col=mix(paperBase,paintedPaper,shape);col*=smoothstep(1.3,0.5,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-salt": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.06;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*360.0;float fiber=noise(pUv)*0.6+noise(pUv*2.0)*0.4;vec3 paperBase=vec3(0.97,0.96,0.94)*(0.92+0.08*noise(pUv*0.3));vec2 q=vec2(fbm(uv*2.5+t),fbm(uv*2.8-t));float bleedVal=fbm(uv*2.0+q*1.2);vec2 saltUv=uv*14.0+vec2(t*0.2,-t*0.1);vec2 cellId=floor(saltUv);vec2 cellFract=fract(saltUv)-0.5;float cellHash=hash(cellId);float saltSpot=0.0;if(cellHash>0.6){vec2 offset=vec2(sin(cellHash*6.28),cos(cellHash*6.28))*0.25;float dist=length(cellFract-offset);float star=1.0-smoothstep(0.0,0.3,dist);star*=0.6+0.4*noise(uv*180.0+cellHash);saltSpot=star*0.7;}float modifiedBleed=clamp(bleedVal-saltSpot*0.6,0.0,1.0);float shape=smoothstep(0.2,0.65,modifiedBleed);float ring=smoothstep(0.04,0.0,abs(modifiedBleed-0.42))*0.6;float saltRing=smoothstep(0.03,0.0,abs(saltSpot-0.18))*0.4;vec3 paint=mix(u_color1,u_color2,smoothstep(0.3,0.7,modifiedBleed));paint=mix(paint,u_color3*0.6,ring+saltRing*1.2);vec3 paintedPaper=paint*paperBase*(1.0-fiber*0.08);vec3 col=mix(paperBase,paintedPaper,shape);col=mix(col,paperBase,saltSpot*0.4*shape);col*=smoothstep(1.3,0.5,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-ink": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.08;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*vec2(40.0,420.0);float fiber=noise(pUv)*0.7+noise(uv*450.0)*0.3;vec3 paperBase=vec3(0.95,0.94,0.91)*(0.95+0.05*noise(uv*12.0));vec2 q=vec2(fbm(uv*2.0+vec2(t*0.1,t*0.03)),fbm(uv*2.2-vec2(t*0.03,t*0.1)));q.x+=fiber*0.15;float bleedVal=fbm(uv*1.6+q*1.4);float shape=smoothstep(0.15,0.75,bleedVal);float lum1=dot(u_color1,vec3(0.299,0.587,0.114));float lum2=dot(u_color2,vec3(0.299,0.587,0.114));float lum3=dot(u_color3,vec3(0.299,0.587,0.114));vec3 inkColor1=vec3(0.06,0.06,0.07)*(0.8+0.4*lum1);vec3 inkColor2=vec3(0.18,0.18,0.20)*(0.7+0.5*lum2);vec3 inkColor3=vec3(0.42,0.42,0.45)*(0.6+0.6*lum3);vec3 paint=mix(inkColor2,inkColor1,smoothstep(0.3,0.8,bleedVal));float fiberBleed=smoothstep(0.06,0.0,abs(bleedVal-0.45))*fiber*0.25;paint=mix(paint,inkColor3*0.4,fiberBleed);vec3 paintedPaper=paint*paperBase*(1.0-fiber*0.05);vec3 col=mix(paperBase,paintedPaper,shape);col*=smoothstep(1.3,0.45,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-glaze": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.06;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*380.0;float fiber=noise(pUv)*0.6+noise(pUv*2.0)*0.4;vec3 paperBase=vec3(0.97,0.96,0.94);vec2 q1=vec2(fbm(uv*2.0+vec2(t*0.1,t*0.05)),fbm(uv*2.2-vec2(t*0.05,t*0.08)));float bleed1=fbm(uv*1.8+q1*1.2);float shape1=smoothstep(0.22,0.6,bleed1);float ring1=smoothstep(0.03,0.0,abs(bleed1-0.42))*0.3;vec3 paint1=mix(u_color1,u_color3*0.8,bleed1);paint1=mix(paint1,u_color3*0.5,ring1);vec2 q2=vec2(fbm(uv*2.3-vec2(t*0.08,t*0.1)),fbm(uv*2.5+vec2(t*0.05,t*0.05)));float bleed2=fbm(uv*2.0+q2*1.1);float shape2=smoothstep(0.25,0.65,bleed2);float ring2=smoothstep(0.03,0.0,abs(bleed2-0.45)) * 0.3;vec3 paint2=mix(u_color2,u_color3*0.9,bleed2);paint2=mix(paint2,u_color3*0.4,ring2);vec3 col=paperBase;if(shape1>0.0){col=mix(paperBase,paint1*paperBase,shape1);}if(shape2>0.0){vec3 layer2=paint2*(col/paperBase);col=mix(col,layer2*paperBase,shape2);}col*=(1.0-fiber*0.06);col*=smoothstep(1.3,0.5,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-metallic": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.08;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*400.0;float n1=noise(pUv);float n2=noise(pUv*2.0);float fiber=n1*0.6+n2*0.4;vec2 eps=vec2(0.003,0.0);float nx=noise(pUv+vec2(eps.x,eps.y))-noise(pUv-vec2(eps.x,eps.y));float ny=noise(pUv+vec2(eps.y,eps.x))-noise(pUv-vec2(eps.y,eps.x));vec3 normal=normalize(vec3(-nx*0.5,-ny*0.5,0.06));vec3 lightDir=normalize(vec3(-0.4+0.1*sin(t),0.5,0.6));float diffuse=max(dot(normal,lightDir),0.0);vec3 paperBase=vec3(0.96,0.95,0.93)*(0.92+0.08*diffuse);vec2 q=vec2(fbm(uv*2.8+vec2(t*0.1,t*0.05)),fbm(uv*3.0-vec2(t*0.05,t*0.1)));float bleedVal=fbm(uv*2.2+q*1.3);float shape=smoothstep(0.2,0.65,bleedVal);vec3 paint=mix(u_color1,u_color2,smoothstep(0.3,0.7,bleedVal));float ring=smoothstep(0.04,0.0,abs(bleedVal-0.45));paint=mix(paint,u_color3*0.6,ring*0.5);vec2 sparkleGrid=uv*320.0;vec2 cellId=floor(sparkleGrid);float cellHash=hash(cellId);float sparkle=0.0;if(cellHash>0.94){vec3 halfVec=normalize(lightDir+vec3(0.0,0.0,1.0));float spec=pow(max(dot(normal,halfVec),0.0),16.0+cellHash*32.0);float twinkle=0.5+0.5*sin(t*5.0+cellHash*100.0);sparkle=spec*twinkle*(0.4+0.6*shape);}vec3 paintedPaper=paint*paperBase*(1.0-fiber*0.08);vec3 col=mix(paperBase,paintedPaper,shape);vec3 goldColor=vec3(1.0,0.82,0.35)*u_color3;col += goldColor*sparkle*2.2*u_intensity;col*=smoothstep(1.3,0.5,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-gravity": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.1;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*360.0;float fiber=noise(pUv)*0.6+noise(pUv*2.0)*0.4;vec3 paperBase=vec3(0.97,0.96,0.94);vec2 gravityUv=uv;float drips=sin(uv.x*6.0+fbm(uv*2.0)*0.5)*0.4;gravityUv.y+=drips*fbm(vec2(uv.x*4.0,uv.y-t*0.4))*0.3;gravityUv.y-=t*0.1;vec2 q=vec2(fbm(gravityUv*2.4),fbm(gravityUv*2.6));float bleedVal=fbm(gravityUv*1.8+q*1.2);float shape=smoothstep(0.2,0.62,bleedVal);float ring=smoothstep(0.04,0.0,abs(bleedVal-0.44));vec3 paint=mix(u_color1,u_color2,bleedVal);paint=mix(paint,u_color3*0.7,ring*0.6);vec3 paintedPaper=paint*paperBase*(1.0-fiber*0.08);vec3 col=mix(paperBase,paintedPaper,shape);col*=smoothstep(1.3,0.5,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "watercolor-granulating": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.06;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 pUv=uv*420.0;float n1=noise(pUv);float n2=noise(pUv*3.0);float fiber=n1*0.65+n2*0.35;vec3 paperBase=vec3(0.97,0.96,0.94);vec2 q=vec2(fbm(uv*2.8+t),fbm(uv*3.0-t));float bleedVal=fbm(uv*2.2+q*1.3);float shape=smoothstep(0.18,0.65,bleedVal);float sedimentVal=smoothstep(0.35,0.6,fiber);vec3 heavyPigment=u_color1*0.85;vec3 lightPigment=u_color2;vec3 basePaint=mix(heavyPigment,lightPigment,bleedVal);vec3 granularPaint=mix(heavyPigment*0.7,basePaint,sedimentVal);float grainNoise=hash(floor(pUv*1.5));vec3 paint=mix(granularPaint,heavyPigment*0.5,(1.0-sedimentVal)*grainNoise*0.45);float ring=smoothstep(0.04,0.0,abs(bleedVal-0.45));paint=mix(paint,u_color3*0.6,ring*0.5);vec3 paintedPaper=paint*paperBase*(1.0-fiber*0.12);vec3 col=mix(paperBase,paintedPaper,shape);col*=smoothstep(1.3,0.5,length(p));fragColor=vec4(col*u_intensity,1.0);}\`,
          "reaction-diffusion": \`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_intensity;uniform float u_speed;
\${NOISE}
void main(){vec2 uv=vUv;float t=u_time*u_speed*0.12;vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 p=(uv-0.5)*aspect;vec2 q=vec2(fbm(p*2.2+vec2(t*0.15,t*0.05)),fbm(p*2.4-vec2(t*0.05,t*0.1)));vec2 r=vec2(fbm(p*3.5+q*1.5+vec2(t*0.1)),fbm(p*3.0-q*1.2));float d=length(p+q*0.35);float reaction=sin(p.x*14.0+r.y*6.5)*cos(p.y*14.0+r.x*6.5);reaction=sin(reaction*4.5+t*1.8)*0.5+0.5;float edge=smoothstep(0.08,0.0,abs(reaction-0.5));float fill=smoothstep(0.35,0.65,reaction);vec3 col=mix(u_color1*0.15,u_color2,fill);col=mix(col,u_color3*1.6,edge*0.75);col+=u_color3*pow(fill,4.0)*0.5*u_intensity;float fiber=noise(uv*360.0)*0.35+noise(uv*720.0)*0.15;col*=(1.0-fiber*0.06);col*=smoothstep(1.3,0.4,length(p));fragColor=vec4(col*u_intensity,1.0);}\`
        };

        function hexToVec3(hex) {
          const c = hex.replace('#','');
          const f = c.length===3 ? c[0]+c[0]+c[1]+c[1]+c[2]+c[2] : c;
          return [parseInt(f.slice(0,2),16)/255, parseInt(f.slice(2,4),16)/255, parseInt(f.slice(4,6),16)/255];
        }

        function initShader(canvas) {
          const id = canvas.dataset.shader;
          const frag = SHADER_FRAGS[id];
          if (!frag) return null;
          const gl = canvas.getContext('webgl2', {alpha:true, antialias:false, premultipliedAlpha:false});
          if (!gl) return null;
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
          return { gl, prog, c1, c2, c3, intensity, speed, softness, scale, detail, start: performance.now(), raf: 0 };
        }

        const shaderStates = new Map();

        function startShader(canvas) {
          if (shaderStates.has(canvas)) return;
          const state = initShader(canvas);
          if (!state) return;
          shaderStates.set(canvas, state);
          function tick() {
            const {gl, prog, c1, c2, c3, intensity, speed, softness, scale, detail, start} = state;
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
            gl.drawArrays(gl.TRIANGLES,0,3);
            state.raf = requestAnimationFrame(tick);
          }
          state.raf = requestAnimationFrame(tick);
        }

        function stopShader(canvas) {
          const state = shaderStates.get(canvas);
          if (!state) return;
          cancelAnimationFrame(state.raf);
          state.gl.getExtension('WEBGL_lose_context')?.loseContext();
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

        // Initial shader start
        if (slides[0]) {
          const sc = slides[0].querySelector('.shader-bg');
          if (sc) startShader(sc);
        }
      })();`;
