export const PREMIUM_SHADER_VARIANTS = {
  aurora: 0,
  "geometric-grid": 4,
  "mesh-gradient": 1,
  "noise-fog": 3,
  "particle-field": 5,
  "reaction-diffusion": 7,
  "silk-gradient": 2,
  "watercolor-classic": 1,
  "watercolor-glaze": 2,
  "watercolor-granulating": 4,
  "watercolor-gravity": 3,
  "watercolor-ink": 7,
  "watercolor-metallic": 6,
  "watercolor-rough": 3,
  "watercolor-salt": 5,
  "watercolor-wet": 2,
  "wave-distortion": 6
} as const;

export type PremiumShaderId = keyof typeof PREMIUM_SHADER_VARIANTS;

export const PREMIUM_SHADER_IDS = Object.keys(PREMIUM_SHADER_VARIANTS) as PremiumShaderId[];

export const PREMIUM_SHADER_BODY = `
float saturate(float v) {
  return clamp(v, 0.0, 1.0);
}

vec2 rot2(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

float softBlob(vec2 p, vec2 center, vec2 radius, float angle, float power) {
  vec2 q = rot2(p - center, angle) / radius;
  return exp(-dot(q, q) * power);
}

float ribbon(vec2 p, float offset, float angle, float width, float t, float curve) {
  vec2 q = rot2(p, angle);
  float flow = sin(q.x * curve + t) * 0.16 + fbm(q * 1.15 + vec2(t * 0.07, -t * 0.05)) * 0.22;
  return smoothstep(width, 0.0, abs(q.y + flow - offset));
}

float grain(vec2 uv, float t) {
  return hash(uv * 1200.0 + vec2(t * 17.0, -t * 11.0)) - 0.5;
}

vec3 screenBlend(vec3 base, vec3 layer, float amount) {
  vec3 screened = 1.0 - (1.0 - base) * (1.0 - layer);
  return mix(base, screened, amount);
}

vec3 grade(vec3 color, vec2 p, vec2 uv, float t, float det) {
  float vignette = smoothstep(1.28, 0.18, length(p));
  color *= 0.76 + vignette * 0.36;
  color += grain(uv, t) * (0.012 + det * 0.020);
  color = pow(max(color, vec3(0.0)), vec3(0.88));
  return clamp(color, 0.0, 1.55);
}

// --- Simplex 2D noise from Ashima Arts ---
vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Twinkling Starfield Helpers for Aurora Polaris
float starHash(vec2 p) {
  p = fract(p * vec2(443.8975, 397.2973));
  p += dot(p.xy, p.yx + 19.19);
  return fract(p.x * p.y);
}

float starField(vec2 uv, float t) {
  float stars = 0.0;
  for (int layer = 0; layer < 2; layer++) {
    float fl = float(layer);
    float density = 45.0 + fl * 30.0;
    vec2 grid = uv * density;
    vec2 gid = floor(grid);
    vec2 gf = fract(grid) - 0.5;
    float n = starHash(gid + fl * 100.0);
    if (n > 0.975 - fl * 0.005) {
      float brightness = (n - 0.96) * 25.0;
      float twinkle = sin(t * (1.5 + n * 3.0) + n * 62.8) * 0.45 + 0.55;
      float size = 0.03 - fl * 0.006;
      stars += smoothstep(size, 0.0, length(gf)) * brightness * twinkle;
    }
  }
  return clamp(stars, 0.0, 1.0);
}

vec3 polarSilk(vec2 uv, vec2 p, float t, float scl, float soft, float det) {
  vec3 base = mix(vec3(0.035, 0.027, 0.060), u_color2 * 0.28, smoothstep(-0.35, 0.90, p.y));
  base += u_color1 * softBlob(p, vec2(-0.64, -0.12), vec2(0.68, 0.52) * soft, -0.45, 2.0) * 0.14;
  base += u_color3 * softBlob(p, vec2(0.58, 0.18), vec2(0.84, 0.66) * soft, 0.50, 1.8) * 0.12;

  float veilA = ribbon(p, 0.18, -0.55, 0.28 * soft, t * 0.34, 1.7 * scl);
  float veilB = ribbon(p, -0.02, -0.63, 0.22 * soft, t * 0.28 + 1.7, 2.0 * scl);
  float veilC = ribbon(p, 0.36, -0.48, 0.18 * soft, t * 0.22 + 3.2, 2.5 * scl);
  vec3 col = base;
  col = screenBlend(col, u_color1 * (0.80 + det * 0.25), veilA * 0.56);
  col = screenBlend(col, u_color3 * (0.65 + det * 0.20), veilB * 0.42);
  col += u_color2 * veilC * 0.20;
  col += vec3(0.85, 1.0, 0.92) * pow(veilA, 2.6) * 0.12;
  return col;
}

vec3 pearlMesh(vec2 uv, vec2 p, float t, float scl, float soft, float det) {
  // Variant 1: Iridescent warped mesh
  vec2 q = vec2(
    fbm(uv * 1.5 * scl + vec2(t * 0.12, t * 0.04)),
    fbm(uv * 1.8 * scl - vec2(t * 0.06, t * 0.1))
  );
  vec2 r = vec2(
    fbm(uv * 2.2 * scl + q * 2.0 * det + vec2(t * 0.08)),
    fbm(uv * 2.0 * scl - q * 1.5 * det - vec2(t * 0.12))
  );
  vec2 w = uv + (r - 0.5) * 0.35 * soft;

  float a = softBlob(w, vec2(0.25, 0.3), vec2(0.5, 0.4) * soft, 0.25, 1.5);
  float b = softBlob(w, vec2(0.75, 0.7), vec2(0.6, 0.5) * soft, -0.4, 1.6);
  
  vec3 spectral = 0.5 + 0.5 * cos(length(w) * 6.28 * det + vec3(0.0, 2.0, 4.0) + t * 0.4);
  
  vec3 col = mix(u_color2, u_color1, a * 0.7);
  col = mix(col, u_color3, b * 0.6);
  
  col = mix(col, spectral * u_color3, 0.22 * det * u_intensity);
  
  float lines = sin(w.x * 14.0 * scl - w.y * 10.0 + t * 0.35) * 0.5 + 0.5;
  lines = pow(lines, 6.0 + 12.0 * (1.0 - u_intensity)) * u_intensity;
  col += vec3(0.96, 0.98, 1.0) * lines * 0.22;
  
  return col;
}

vec3 opalVeil(vec2 uv, vec2 p, float t, float scl, float soft, float det) {
  // Variant 2: Opal Veil / Soft gradients
  vec2 w = uv + vec2(fbm(uv * 1.8 * scl + t * 0.08), fbm(uv * 1.6 * scl - t * 0.07)) * 0.25 * soft;
  float sweep = smoothstep(0.05, 0.95, w.x * 0.6 + w.y * 0.6 + sin(w.y * 3.0 + t * 0.3) * 0.1);
  
  float pearl = pow(abs(sin((w.x - w.y) * (6.0 + 8.0 * det) + t * 0.6)), 8.0) * u_intensity;
  float blush = softBlob(w, vec2(0.7, 0.3), vec2(0.6, 0.5) * soft, -0.5, 1.8);
  float blue = softBlob(w, vec2(0.3, 0.7), vec2(0.5, 0.4) * soft, 0.3, 1.7);
  
  vec3 col = mix(u_color2, u_color1, sweep);
  col = screenBlend(col, u_color3 * 0.9, blush * 0.45);
  col = screenBlend(col, vec3(0.75, 0.9, 1.0) * u_color1, blue * 0.3);
  col += vec3(0.96, 0.98, 1.0) * pearl * 0.25;
  return col;
}

vec3 vaporGlass(vec2 uv, vec2 p, float t, float scl, float soft, float det) {
  // Variant 3: Vapor Glass / Nebulous Fog
  vec2 flow = vec2(fbm(uv * 1.4 * scl + vec2(t * 0.1, t * 0.05)), fbm(uv * 1.6 * scl - vec2(t * 0.05, t * 0.1)));
  vec2 w = uv + (flow - 0.5) * (0.38 * soft);
  
  float fogA = softBlob(w, vec2(0.25, 0.3), vec2(0.5, 0.45) * soft, 0.25, 1.6);
  float fogB = softBlob(w, vec2(0.75, 0.7), vec2(0.55, 0.5) * soft, -0.35, 1.8);
  
  float haze = fbm(w * (1.8 + det * 3.2) + t * 0.08);
  
  vec3 col = vec3(0.015, 0.02, 0.03) + u_color2 * 0.12;
  col = screenBlend(col, u_color1, fogA * 0.5);
  col = screenBlend(col, u_color3, fogB * 0.45);
  
  float rim = smoothstep(0.4, 0.85, haze) * (0.05 + 0.15 * soft);
  col += vec3(0.85, 0.98, 0.95) * rim * u_intensity * 1.5;
  
  return col;
}

vec3 blueprintGlow(vec2 uv, vec2 p, float t, float scl, float soft, float det) {
  // Variant 4: Neon Cyber Grid
  vec2 g = uv * vec2(24.0, 14.0) * scl;
  vec2 gridId = floor(g);
  vec2 gridUv = fract(g) - 0.5;
  
  float lineThick = 0.48 - 0.03 * det;
  vec2 lines = smoothstep(lineThick, 0.5, abs(gridUv));
  float gridPattern = max(lines.x, lines.y);
  
  float scanLine = sin(uv.y * 3.0 - t * 0.8) * 0.5 + 0.5;
  scanLine = pow(scanLine, 12.0) * u_intensity;
  
  float dotPattern = smoothstep(0.04 + 0.04 * det, 0.0, length(gridUv));
  
  float glow1 = softBlob(p, vec2(sin(t * 0.4) * 0.4, cos(t * 0.3) * 0.2), vec2(0.7, 0.6) * soft, 0.2, 1.5);
  float glow2 = softBlob(p, vec2(cos(t * 0.5) * 0.5, sin(t * 0.4) * 0.3), vec2(0.5, 0.4) * soft, -0.4, 1.8);
  
  vec3 base = mix(vec3(0.005, 0.01, 0.02), u_color2 * 0.12, smoothstep(-0.5, 0.5, p.y));
  base += u_color1 * glow1 * 0.15;
  base += u_color3 * glow2 * 0.15;
  
  vec3 col = base;
  col += u_color1 * gridPattern * u_intensity * 0.25;
  col += u_color3 * dotPattern * 0.15;
  col += u_color1 * scanLine * 0.3;
  
  return col;
}

vec3 dustAtelier(vec2 uv, vec2 p, float t, float scl, float soft, float det) {
  // Variant 5: Cinematic depth-of-field dust particles
  vec3 col = vec3(0.01, 0.01, 0.015) + u_color2 * 0.05;
  
  col += u_color1 * softBlob(p, vec2(-0.3, -0.2), vec2(0.8, 0.6) * soft, -0.2, 1.5) * 0.12;
  col += u_color3 * softBlob(p, vec2(0.4, 0.3), vec2(0.7, 0.5) * soft, 0.4, 1.6) * 0.10;
  
  for (int layer = 0; layer < 4; layer++) {
    float fl = float(layer);
    vec2 grid = p * (3.5 + fl * 2.8) * scl + vec2(t * (0.08 - fl * 0.01), t * (0.05 + fl * 0.015));
    vec2 id = floor(grid);
    vec2 f = fract(grid) - 0.5;
    
    float h = hash(id + fl * 27.3);
    vec2 offset = vec2(sin(h * 6.28 + t * 0.4), cos(h * 4.3 + t * 0.3)) * 0.35;
    float dist = length(f - offset);
    
    float core = smoothstep(0.015 * det, 0.0, dist);
    float halo = smoothstep((0.15 + fl * 0.15) * soft, 0.0, dist) * 0.22;
    float twinkle = sin(t * (1.5 + h * 3.0 * (1.0 + det)) + h * 10.0) * 0.4 + 0.6;
    
    vec3 pColor = mix(u_color1, u_color3, h);
    col += pColor * (core + halo) * twinkle * (0.2 + 0.8 * h) * u_intensity / (fl * 0.8 + 1.0);
  }
  return col;
}

vec3 liquidChrome(vec2 uv, vec2 p, float t, float scl, float soft, float det) {
  // Variant 6: 3D Specular Chrome
  float warp = 0.25 + 0.25 * soft;
  float h = sin(p.x * 3.5 * scl + t * 0.5) * 0.3
          + cos(p.y * 4.2 * scl - t * 0.4) * 0.25
          + fbm(uv * 2.5 * scl + vec2(t * 0.1, -t * 0.08)) * 0.35;
          
  vec2 eps = vec2(0.008, 0.0);
  float hx = sin((p.x + eps.x) * 3.5 * scl + t * 0.5) * 0.3
           + cos(p.y * 4.2 * scl - t * 0.4) * 0.25
           + fbm((uv + eps) * 2.5 * scl + vec2(t * 0.1, -t * 0.08)) * 0.35;
  float hy = sin(p.x * 3.5 * scl + t * 0.5) * 0.3
           + cos((p.y + eps.x) * 4.2 * scl - t * 0.4) * 0.25
           + fbm((uv + eps.yx) * 2.5 * scl + vec2(t * 0.1, -t * 0.08)) * 0.35;
  vec2 slope = vec2(hx - h, hy - h) / eps.x;
  
  vec3 normal = normalize(vec3(-slope, 0.15 + warp * 0.15));
  vec3 lightDir = normalize(vec3(0.5, 0.5, 0.7));
  vec3 lightDir2 = normalize(vec3(-0.5, -0.3, 0.5));
  
  float spec = pow(max(dot(normal, lightDir), 0.0), 20.0 + det * 44.0);
  float spec2 = pow(max(dot(normal, lightDir2), 0.0), 12.0) * 0.4;
  
  vec3 metal = mix(u_color1 * 0.3, u_color2 * 0.8, h * 0.5 + 0.5);
  metal = mix(metal, u_color3, spec * 0.8);
  
  vec3 reflection = 0.5 + 0.5 * cos(normal.y * (3.0 + 4.0 * det) + vec3(0.0, 1.5, 3.0) + t);
  metal = mix(metal, reflection * u_color3, 0.28 * det);
  
  metal += vec3(spec * 0.65 + spec2 * 0.35) * u_intensity;
  
  return metal;
}

vec3 inkBloom(vec2 uv, vec2 p, float t, float scl, float soft, float det) {
  // Variant 7: Balatro Swirl
  vec2 coord = uv - 0.5;
  float len = length(coord);
  
  float twist = u_intensity * 18.0;
  float speedVal = t * 0.5;
  float angle = atan(coord.y, coord.x) + speedVal - twist * (len + 0.3);
  
  vec2 shifted = vec2(len * cos(angle), len * sin(angle));
  shifted *= (1.5 / scl);
  
  vec2 uv2 = vec2(shifted.x + shifted.y);
  float loopSpeed = t * 1.8;
  
  int octaves = 3 + int(det * 3.0);
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    uv2 += sin(max(shifted.x, shifted.y)) + shifted;
    shifted += 0.5 * vec2(
      cos(5.112 + 0.35 * uv2.y + loopSpeed * 0.13),
      sin(uv2.x - 0.11 * loopSpeed)
    );
    shifted -= cos(shifted.x + shifted.y) - sin(shifted.x * 0.71 - shifted.y);
  }
  
  float contrastVal = 1.0 + 0.6 * det;
  float paint = min(2.0, max(0.0, length(shifted) * 0.035 * contrastVal));
  
  float bleed = 0.5 + soft * 0.8;
  float c1p = max(0.0, 1.0 - bleed * abs(1.0 - paint));
  float c2p = max(0.0, 1.0 - bleed * abs(paint));
  float c3p = 1.0 - min(1.0, c1p + c2p);
  
  vec3 col = (0.2) * u_color1
           + (0.8) * (u_color1 * c1p + u_color2 * c2p + u_color3 * c3p);
  return col;
}

void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed;
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect;
  float scl = 0.72 + u_scale * 1.30;
  float soft = 0.70 + u_softness * 1.15;
  float det = clamp(u_detail, 0.1, 1.0);
  vec3 col;

  if (SLIDEX_SHADER_VARIANT == 0) {
    col = polarSilk(uv, p, t, scl, soft, det);
  } else if (SLIDEX_SHADER_VARIANT == 1) {
    col = pearlMesh(uv, p, t, scl, soft, det);
  } else if (SLIDEX_SHADER_VARIANT == 2) {
    col = opalVeil(uv, p, t + 2.4, scl * 0.92, soft, det);
  } else if (SLIDEX_SHADER_VARIANT == 3) {
    col = vaporGlass(uv, p, t, scl, soft, det);
  } else if (SLIDEX_SHADER_VARIANT == 4) {
    col = blueprintGlow(uv, p, t, scl, soft, det);
  } else if (SLIDEX_SHADER_VARIANT == 5) {
    col = dustAtelier(uv, p, t, scl, soft, det);
  } else if (SLIDEX_SHADER_VARIANT == 6) {
    col = liquidChrome(uv, p, t, scl, soft, det);
  } else {
    col = inkBloom(uv, p, t, scl, soft, det);
  }

  col = grade(col, p, uv, t, det) * (0.48 + u_intensity * 0.92);
  fragColor = vec4(col, 1.0);
}
`;

export function shaderVariantForId(shader: string) {
  return PREMIUM_SHADER_VARIANTS[shader as PremiumShaderId] ?? PREMIUM_SHADER_VARIANTS["mesh-gradient"];
}

export function makeRuntimePremiumShaderBody() {
  return PREMIUM_SHADER_BODY.replace(/SLIDEX_SHADER_VARIANT ==/g, "u_variant ==");
}

export function makePremiumShaderBody(variant: number) {
  return `
const int SLIDEX_SHADER_VARIANT = ${variant};
${PREMIUM_SHADER_BODY}`;
}
