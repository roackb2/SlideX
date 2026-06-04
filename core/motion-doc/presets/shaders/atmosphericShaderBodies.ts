export const auroraBody = `
// --- Starfield ---
float starHash(vec2 p) {
  p = fract(p * vec2(443.8975, 397.2973));
  p += dot(p.xy, p.yx + 19.19);
  return fract(p.x * p.y);
}

float starField(vec2 uv, float t) {
  float stars = 0.0;
  // Layer 1: dense small stars
  for (int layer = 0; layer < 3; layer++) {
    float fl = float(layer);
    float density = 60.0 + fl * 40.0;
    vec2 grid = uv * density;
    vec2 gid = floor(grid);
    vec2 gf = fract(grid) - 0.5;
    float n = starHash(gid + fl * 100.0);
    if (n > 0.97 - fl * 0.01) {
      float brightness = (n - 0.96) * 30.0;
      float twinkle = sin(t * (2.0 + n * 4.0) + n * 62.8) * 0.4 + 0.6;
      float size = 0.04 - fl * 0.008;
      stars += smoothstep(size, 0.0, length(gf)) * brightness * twinkle;
    }
  }
  return clamp(stars, 0.0, 1.0);
}

// --- Aurora curtain ray function ---
float auroraRay(vec2 p, float t, float layerOffset, float scl, float det) {
  // Vertical curtain: the x-coord determines the ray, y is height
  float curtainWave = sin(p.x * 1.5 * scl + t * 0.4 + layerOffset * 3.0) * 0.12
                    + sin(p.x * 0.7 * scl - t * 0.25 + layerOffset * 7.0) * 0.08
                    + cos(p.x * 2.3 * scl + t * 0.15) * 0.05;

  float adjustedY = p.y - curtainWave;

  // Vertical ray filaments using noise at different detail levels
  int octaves = 3 + int(det * 4.0);
  float rayNoise = 0.0;
  float amp = 0.5;
  float freq = 8.0 * scl;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  vec2 np = vec2(p.x * freq + layerOffset * 50.0, adjustedY * 2.0 + t * 0.3);
  for (int i = 0; i < 7; i++) {
    if (i >= octaves) break;
    rayNoise += amp * noise(np);
    np = rot * np * 2.0;
    amp *= 0.5;
  }

  // Shape the curtain: bright band with soft vertical falloff
  float curtainCenter = 0.1 + layerOffset * 0.06;
  float curtainWidth = 0.18 + u_softness * 0.12;
  float verticalShape = smoothstep(curtainCenter + curtainWidth, curtainCenter, adjustedY)
                      * smoothstep(curtainCenter - curtainWidth * 0.6, curtainCenter, adjustedY);

  // Upward atmospheric decay
  float upDecay = exp(-2.5 * max(adjustedY - curtainCenter, 0.0) / (0.5 + u_softness * 0.5));

  return verticalShape * upDecay * (0.3 + 0.7 * rayNoise);
}

void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.15;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // Scale factor
  float scl = 0.5 + u_scale * 1.5;
  float det = clamp(u_detail, 0.1, 1.0);

  // 1. Night sky gradient
  vec3 skyTop = vec3(0.01, 0.01, 0.03);
  vec3 skyHorizon = u_color2 * 0.08;
  vec3 sky = mix(skyHorizon, skyTop, smoothstep(0.0, 0.7, uv.y));

  // 2. Stars
  float stars = starField(p * scl, t);
  vec3 starCol = vec3(0.85, 0.9, 1.0) * stars * 0.7;

  // 3. Multi-layer aurora curtains
  vec3 auroraCol = vec3(0.0);

  // Real aurora color gradient: green at base, purple/magenta at top, blue at edges
  vec3 greenAurora = u_color1;
  vec3 purpleAurora = u_color3;
  vec3 blueEdge = u_color2;

  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float layerDepth = fi * 0.2;

    float ray = auroraRay(p, t + fi * 8.0, fi, scl, det);

    // Height-based color: green at bottom → purple at top
    float heightFactor = smoothstep(0.0, 0.35, p.y + 0.1 - fi * 0.03);
    vec3 layerColor = mix(greenAurora, purpleAurora, heightFactor * 0.7);
    layerColor = mix(layerColor, blueEdge, heightFactor * heightFactor * 0.3);

    // Depth-based opacity (front layers brighter)
    float depthFade = 1.0 - layerDepth * 0.6;

    // Vertical ripple shimmer
    float shimmer = 1.0 + 0.3 * sin(p.x * 30.0 * scl - t * 2.5 + fi * 4.0);

    auroraCol += layerColor * ray * depthFade * shimmer * 0.45;
  }

  // 4. Atmospheric bloom / glow
  float bloomRadius = 0.3 + u_softness * 0.4;
  float bloom = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float ray = auroraRay(p * (0.95 + fi * 0.02), t + fi * 8.0, fi, scl * 0.7, det * 0.5);
    bloom += ray * (1.0 - fi * 0.15);
  }
  vec3 bloomColor = mix(greenAurora, purpleAurora, 0.3) * bloom * bloomRadius * 0.15;

  // 5. Horizon ground silhouette
  float groundLine = smoothstep(0.02, -0.01, p.y + 0.42);
  vec3 ground = vec3(0.005, 0.005, 0.01) * groundLine;

  // 6. Horizon glow (reflected aurora light)
  float horizonGlow = exp(-8.0 * pow(p.y + 0.38, 2.0)) * 0.15;
  vec3 horizonColor = mix(greenAurora, blueEdge, 0.5) * horizonGlow;

  // Compose
  vec3 finalCol = sky + starCol + auroraCol + bloomColor + ground + horizonColor;

  // Vignette
  float vig = 1.0 - 0.3 * pow(length(p) * 0.9, 2.5);
  finalCol *= max(vig, 0.0);

  // Mask out stars behind bright aurora regions
  float auroraMask = clamp(length(auroraCol) * 3.0, 0.0, 1.0);
  finalCol -= starCol * auroraMask * 0.7;

  fragColor = vec4(finalCol * u_intensity * 1.8, 1.0);
}`;

export const meshGradientBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.15;
  float scl = 0.5 + u_scale * 1.5;
  float det = clamp(u_detail, 0.1, 1.0);
  float soft = 0.3 + u_softness * 0.7;

  // Multi-layered warping for iridescent fluid flow
  vec2 q = vec2(fbm(uv * 1.5 * scl + vec2(t * 0.2, t * 0.1)), fbm(uv * 2.0 * scl - vec2(t * 0.1, t * 0.2)));
  vec2 r = vec2(fbm(uv * 2.5 * scl + q * 1.8 * det + vec2(t * 0.15, t * 0.15)), fbm(uv * 2.0 * scl + q * 1.2 * det - vec2(t * 0.2, t * 0.2)));
  vec2 distortedUv = uv + r * 0.38 * soft;

  // Moving control centers
  vec2 c1 = vec2(0.25 + sin(t * 0.7) * 0.2, 0.3 + cos(t * 0.5) * 0.25);
  vec2 c2 = vec2(0.75 + cos(t * 0.6) * 0.25, 0.7 + sin(t * 0.8) * 0.2);

  float w1 = 1.0 - smoothstep(0.0, 0.5 + soft * 0.5, length(distortedUv - c1));
  float w2 = 1.0 - smoothstep(0.0, 0.6 + soft * 0.5, length(distortedUv - c2));

  // Iridescent Chrome spectrum colors
  vec3 spectralColor = 0.5 + 0.5 * cos(length(distortedUv) * 6.28 * det + vec3(0.0, 2.0, 4.0) + t);
  
  // Blend preset colors with iridescent spectrum
  vec3 baseCol = mix(u_color1, u_color2, w1);
  baseCol = mix(baseCol, u_color3, w2 * 0.8);
  vec3 col = mix(baseCol, spectralColor * u_color3, 0.28 * det);

  // Dynamic contrast lighting
  col += u_color1 * 0.15 * (1.0 - w1);

  // Animated premium grain
  float grain = hash(uv * 1234.56 + vec2(fract(sin(t * 987.65) * 4321.0)));
  col += (grain - 0.5) * 0.045 * (0.3 + 0.7 * u_intensity);

  fragColor = vec4(col * u_intensity, 1.0);
}`;

export const silkGradientBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.08;
  float scl = 0.65 + u_scale * 1.35;
  float det = clamp(u_detail, 0.1, 1.0);
  float soft = 0.35 + u_softness * 0.65;

  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 q = vec2(
    fbm(uv * (1.2 * scl) + vec2(t * 0.25, -t * 0.08)),
    fbm(uv * (1.6 * scl) - vec2(t * 0.10, t * 0.22))
  );
  vec2 r = vec2(
    fbm(uv * (2.1 * scl) + q * (1.6 * det) + vec2(t * 0.14)),
    fbm(uv * (1.9 * scl) - q * (1.2 * det) - vec2(t * 0.09))
  );

  vec2 warped = uv + (r - 0.5) * (0.28 * soft);
  float diagonal = warped.x * 0.74 + warped.y * 0.58;
  float veil = smoothstep(0.08, 0.98, diagonal + 0.12 * sin(t + warped.y * 3.0));
  float bloomA = 1.0 - smoothstep(0.0, 0.62 + soft * 0.28, length(warped - vec2(0.22, 0.24)));
  float bloomB = 1.0 - smoothstep(0.0, 0.72 + soft * 0.24, length(warped - vec2(0.82, 0.74)));
  float satin = pow(abs(sin((warped.x - warped.y) * 9.0 + q.x * 2.8 + t * 1.2)), 10.0);

  vec3 col = mix(u_color2, u_color1, veil);
  col = mix(col, u_color3, bloomA * 0.48 + bloomB * 0.36);
  vec3 pearl = vec3(0.96, 0.98, 1.0) * (0.12 + 0.28 * satin * det);
  col += pearl;

  float grain = hash(uv * 980.0 + vec2(t * 7.0));
  col += (grain - 0.5) * 0.025;
  col *= 0.78 + 0.22 * smoothstep(1.1, 0.22, length(p));

  fragColor = vec4(col * (0.55 + u_intensity * 0.85), 1.0);
}`;

export const noiseFogBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.12;
  float scl = 0.5 + u_scale * 1.5;
  float det = clamp(u_detail, 0.1, 1.0);
  float soft = 0.2 + u_softness * 0.6;

  // Volumetric cloud layer 1
  vec2 uv1 = uv * 2.0 * scl + vec2(t * 0.25, t * 0.1);
  float n1 = fbm(uv1 + vec2(fbm(uv1 * 1.5 * det - vec2(t * 0.1))));

  // Volumetric cloud layer 2 (opposite direction, swirling)
  vec2 uv2 = uv * 3.5 * scl - vec2(t * 0.15, t * 0.3);
  float n2 = fbm(uv2 + vec2(n1) * det);

  // Nebula structure
  float density = smoothstep(0.2 * (1.0 - soft), 0.5 + soft * 0.3, (n1 + n2) * 0.5);

  // Base color blending
  vec3 col = mix(u_color1 * 0.2, u_color2, density);
  col = mix(col, u_color3 * 1.2, smoothstep(0.4, 0.9, n2) * 0.7);

  // Pseudo 3D normal shading for volumetric volume depth
  vec2 eps = vec2(0.015 / scl, 0.0);
  float nx = fbm(uv2 + vec2(eps.x, eps.y)) - fbm(uv2 - vec2(eps.x, eps.y));
  float ny = fbm(uv2 + vec2(eps.y, eps.x)) - fbm(uv2 - vec2(eps.y, eps.x));
  vec3 normal = normalize(vec3(-nx, -ny, 0.08 * (1.0 + soft)));
  
  // Virtual light source from top-right
  vec3 lightDir = normalize(vec3(0.5, 0.5, 0.5));
  float diffuse = max(dot(normal, lightDir), 0.0);
  col += u_color3 * diffuse * density * 0.45 * det;

  // Volumetric rim light
  float rim = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
  col += u_color1 * rim * density * 0.3;

  // Cinematic contrast and vignette
  float dist = length(uv - 0.5);
  float vignette = smoothstep(1.3, 0.25, dist);
  col *= vignette;
  
  // Highlight core spots
  col += u_color2 * pow(density, 4.0) * 0.3;

  fragColor = vec4(col * u_intensity, 1.0);
}`;
