export const gridPulseBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.4;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;
  float scl = 0.5 + u_scale * 1.5;
  float det = clamp(u_detail, 0.1, 1.0);
  float soft = 0.3 + u_softness * 0.7;

  // Create subtle grid tilt/perspective or coordinate warping
  float warp = fbm(uv * 1.5 * det + vec2(t * 0.15)) * 0.1 * det;
  vec2 warpedUv = uv + vec2(warp);

  // 1. Grid coordinates
  float gridDensity = 10.0 + scl * 10.0;
  vec2 gridVal = warpedUv * aspect * gridDensity;
  vec2 gridFract = fract(gridVal);
  vec2 gridDist = abs(gridFract - 0.5);

  // Neon glowing line formulation: glow = thickness / distance
  float lineThickness = 0.003 + soft * 0.006;
  float lineX = lineThickness / (gridDist.x + 0.002);
  float lineY = lineThickness / (gridDist.y + 0.002);
  float gridLines = max(lineX, lineY);

  // Soften line edges based on aspect boundaries
  gridLines *= smoothstep(0.7, 0.4, max(abs(p.x), abs(p.y)));

  // 2. Multi-frequency ripple waves
  float r1 = length(p + vec2(sin(t * 0.5) * 0.2, cos(t * 0.3) * 0.2));
  float r2 = length(p - vec2(cos(t * 0.4) * 0.3, sin(t * 0.6) * 0.1));
  
  float wave1 = sin(r1 * 12.0 * scl - t * 2.5) * 0.5 + 0.5;
  float wave2 = sin(r2 * 8.0 * scl - t * 1.8) * 0.5 + 0.5;
  float pulse = mix(wave1, wave2, 0.5);

  // 3. Data packet pulses (particles traveling along lines)
  vec2 cellId = floor(gridVal);
  float packetProb = hash(cellId);
  float packetGlow = 0.0;
  if (packetProb > 0.7) {
    float offset = fract(t * 0.8 + packetProb * 5.0);
    float dX = abs(gridFract.x - offset);
    float dY = abs(gridFract.y - offset);
    float packetSize = 0.04 + soft * 0.06;
    packetGlow = smoothstep(packetSize, 0.0, dX) * lineY * 0.35 + smoothstep(packetSize, 0.0, dY) * lineX * 0.35;
  }

  // Intersections glow dots
  float dotSize = 0.08 + soft * 0.08;
  float dots = smoothstep(dotSize, 0.01, length(gridFract - 0.5));

  // Color composites
  vec3 col = u_color1 * gridLines * 0.22;
  col += u_color2 * gridLines * pulse * 0.35;
  col += u_color3 * dots * (0.3 + 0.7 * pulse) * 1.2;
  col += u_color3 * packetGlow * 1.5;

  // Soft radial background light
  col += u_color1 * 0.035 * (1.0 - length(p));
  col += u_color2 * 0.02 * pulse;

  // Contrast vignette
  col *= smoothstep(1.2, 0.3, length(p));

  fragColor = vec4(col * u_intensity, 1.0);
}`;

export const particleFieldBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.15;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;
  float scl = 0.5 + u_scale * 1.5;
  float det = clamp(u_detail, 0.1, 1.0);
  float soft = 0.3 + u_softness * 0.7;

  // Background nebula dust
  float nebula = fbm(uv * 1.8 * scl + vec2(t * 0.05, -t * 0.03));
  vec3 col = mix(u_color1 * 0.06, u_color2 * 0.08, nebula);
  col += u_color3 * 0.02 * fbm(uv * 3.0 * scl - vec2(t * 0.1));

  // Optimized grid-based particle fields (3 layers of depth)
  for (int layer = 0; layer < 3; layer++) {
    float layerF = float(layer);
    float scale = (4.0 + layerF * 3.5) * scl;
    
    // Distort grid for organic drifting path
    vec2 drift = vec2(t * (0.12 - layerF * 0.02), t * (0.05 + layerF * 0.015));
    vec2 gridUv = p * scale + drift;
    
    vec2 gridId = floor(gridUv);
    vec2 gridFract = fract(gridUv) - 0.5;

    // Pseudo-random offset and properties per grid cell
    vec2 randSeed = gridId + vec2(layerF * 13.57);
    float h1 = hash(randSeed);
    float h2 = hash(randSeed + 57.23);
    float h3 = hash(randSeed + 91.85);

    // Skip some cells to make distribution natural and non-uniform
    float threshold = 0.45 - det * 0.15;
    if (h1 > threshold) {
      // Animated particle offset in cell (orbital motion)
      vec2 offset = vec2(sin(t * 0.8 + h2 * 6.28), cos(t * 0.6 + h3 * 6.28)) * 0.3;
      vec2 particlePos = gridFract - offset;

      float dist = length(particlePos);
      
      // Bokeh particle look: bright core + large soft outer halo
      float coreSize = 0.008 + h3 * 0.012;
      float haloSize = coreSize * (4.0 + h2 * 8.0) * soft;
      
      float core = smoothstep(coreSize, 0.0, dist) * 1.5;
      float halo = smoothstep(haloSize, 0.0, dist) * 0.4 * soft;
      
      // Twinkle effect
      float twinkle = 0.4 + 0.6 * sin(t * (1.2 + h1 * 2.0) + h2 * 10.0);
      
      // Depth fading (smaller particles are darker and in background)
      float depthFade = (1.0 / (layerF + 1.0)) * (0.3 + 0.7 * h3);

      vec3 pColor = mix(u_color1, u_color3, h1);
      pColor = mix(pColor, u_color2, h2 * 0.3);

      col += pColor * (core + halo) * twinkle * depthFade;
    }
  }

  // Soft vignette
  col *= smoothstep(1.3, 0.4, length(p));

  fragColor = vec4(col * u_intensity, 1.0);
}`;

export const waveDistortionBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.12;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;
  float scl = 0.5 + u_scale * 1.5;
  float det = clamp(u_detail, 0.1, 1.0);
  float soft = 0.3 + u_softness * 0.7;

  // Liquid metal wave interference
  float wave1 = sin(p.x * 5.0 * scl + p.y * 3.5 * scl + t * 1.5) * 0.4;
  float wave2 = cos(p.y * 6.0 * scl - p.x * 3.0 * scl - t * 1.1) * 0.35;
  float wave3 = sin(length(p) * 7.5 * scl - t * 1.8) * 0.3;
  float height = wave1 + wave2 + wave3;

  // Normal mapping for chrome reflections
  float eps = 0.015 / scl;
  float hX = sin((p.x + eps) * 5.0 * scl + p.y * 3.5 * scl + t * 1.5) * 0.4 + cos(p.y * 6.0 * scl - (p.x + eps) * 3.0 * scl - t * 1.1) * 0.35 + sin(length(p + vec2(eps, 0.0)) * 7.5 * scl - t * 1.8) * 0.3;
  float hY = sin(p.x * 5.0 * scl + (p.y + eps) * 3.5 * scl + t * 1.5) * 0.4 + cos((p.y + eps) * 6.0 * scl - p.x * 3.0 * scl - t * 1.1) * 0.35 + sin(length(p + vec2(0.0, eps)) * 7.5 * scl - t * 1.8) * 0.3;
  vec2 slope = vec2(hX - height, hY - height) / eps;

  // Chromatic dispersion UV offsets (softness controls dispersion spread)
  float dispersion = 0.02 + soft * 0.04;
  vec2 uvR = uv + slope * (dispersion + 0.01);
  vec2 uvG = uv + slope * dispersion;
  vec2 uvB = uv + slope * (dispersion - 0.01);

  vec3 col;
  col.r = fbm(uvR * 2.0 * det + vec2(t * 0.08));
  col.g = fbm(uvG * 2.0 * det + vec2(t * 0.08));
  col.b = fbm(uvB * 2.0 * det + vec2(t * 0.08));

  // Metallic color blending
  vec3 chrome = mix(u_color1, u_color2, col.g);
  chrome = mix(chrome, u_color3 * 1.2, col.r * 0.5);

  // Highly reflective metallic specular highlights (specular ridges)
  vec3 normal = normalize(vec3(-slope, 0.1 * (1.0 + soft)));
  vec3 light = normalize(vec3(0.5, 0.5, 0.5));
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(light + view);
  float specPower = 16.0 + (1.0 - soft) * 32.0;
  float spec = pow(max(dot(normal, halfVec), 0.0), specPower);

  // Add metallic gloss
  col = chrome * (0.4 + 0.6 * height) + vec3(spec * 0.7) * u_color3;

  // Specular edge highlights (caustics)
  float edge = smoothstep(0.92, 1.0, sin(height * 10.0 * det + t));
  col += u_color3 * edge * 0.3;

  // Cinematic vignette
  col *= smoothstep(1.3, 0.45, length(p));

  fragColor = vec4(col * u_intensity, 1.0);
}
`;



export const reactionDiffusionBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.12;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;
  float scl = 0.5 + u_scale * 1.5;
  float det = clamp(u_detail, 0.1, 1.0);
  float soft = 0.3 + u_softness * 0.7;

  // Swirling domain warping
  vec2 q = vec2(fbm(p * 2.2 * scl + vec2(t * 0.15, t * 0.05)), fbm(p * 2.4 * scl - vec2(t * 0.05, t * 0.1)));
  vec2 r = vec2(fbm(p * 3.5 * scl + q * 1.5 * det + vec2(t * 0.1)), fbm(p * 3.0 * scl - q * 1.2 * det));
  
  // Turing-like reaction diffusion pattern
  float d = length(p + q * 0.35);
  float reaction = sin(p.x * 14.0 * scl + r.y * 6.5 * det) * cos(p.y * 14.0 * scl + r.x * 6.5 * det);
  reaction = sin(reaction * 4.5 + t * 1.8) * 0.5 + 0.5;

  // Reaction borders (Turing cell boundaries — softness controls edge width)
  float edgeWidth = 0.04 + soft * 0.08;
  float edge = smoothstep(edgeWidth, 0.0, abs(reaction - 0.5));
  float fill = smoothstep(0.35 - soft * 0.1, 0.65 + soft * 0.1, reaction);

  // Color mix: background, primary, secondary
  vec3 col = mix(u_color1 * 0.15, u_color2, fill);
  col = mix(col, u_color3 * 1.6, edge * 0.75);

  // Core glow
  col += u_color3 * pow(fill, 4.0) * 0.5 * u_intensity;

  // Add organic paper fiber texture
  float fiber = noise(uv * 360.0) * 0.35 + noise(uv * 720.0) * 0.15;
  col *= (1.0 - fiber * 0.06);

  // Vignette
  col *= smoothstep(1.3, 0.4, length(p));
  
  fragColor = vec4(col * u_intensity, 1.0);
}
`;
