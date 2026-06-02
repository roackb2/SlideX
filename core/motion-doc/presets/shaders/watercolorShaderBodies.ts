export const watercolorClassicBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.1;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * 380.0;
  float fiber = noise(pUv) * 0.6 + noise(pUv * 2.0) * 0.4;
  vec2 eps = vec2(0.003, 0.0);
  float nx = noise(pUv + vec2(eps.x, eps.y)) - noise(pUv - vec2(eps.x, eps.y));
  float ny = noise(pUv + vec2(eps.y, eps.x)) - noise(pUv - vec2(eps.y, eps.x));
  vec3 normal = normalize(vec3(-nx * 0.3, -ny * 0.3, 0.08));
  vec3 lightDir = normalize(vec3(-0.5, 0.5, 0.7));
  vec3 paperBase = vec3(0.97, 0.96, 0.94) * (0.92 + 0.08 * max(dot(normal, lightDir), 0.0));

  vec2 q = vec2(fbm(uv * 2.8 + vec2(t * 0.15, t * 0.05)), fbm(uv * 3.0 - vec2(t * 0.05, t * 0.1)));
  vec2 r = vec2(fbm(uv * 3.5 + q * 1.5 + vec2(t * 0.1, t * 0.2)), fbm(uv * 3.2 - q * 1.8 - vec2(t * 0.15, t * 0.08)));
  float bleedVal = fbm(uv * 2.2 + r * 1.3);

  float shape = smoothstep(0.2, 0.65, bleedVal);
  float ring = smoothstep(0.04, 0.0, abs(bleedVal - 0.45));
  float ringGlow = smoothstep(0.08, 0.0, abs(bleedVal - 0.45));
  
  vec3 paint = mix(u_color1, u_color2, smoothstep(0.3, 0.7, bleedVal));
  paint = mix(paint, u_color3 * 0.7, ring * 0.55 + ringGlow * 0.15);

  vec3 paintedPaper = paint * paperBase * (1.0 - fiber * 0.08);
  vec3 col = mix(paperBase, paintedPaper, shape);
  col *= smoothstep(1.3, 0.5, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;

export const watercolorWetBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.15;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * 320.0;
  float fiber = noise(pUv) * 0.5 + noise(pUv * 2.0) * 0.5;
  vec3 paperBase = vec3(0.96, 0.95, 0.93) * (0.94 + 0.06 * noise(pUv * 0.5));

  vec2 warp1 = vec2(sin(uv.y * 3.0 + t), cos(uv.x * 3.0 - t)) * 0.15;
  vec2 warp2 = vec2(fbm(uv * 4.0 + warp1 * 2.0), fbm(uv * 3.5 - warp1 * 1.5)) * 0.25;
  vec2 warp3 = vec2(fbm(uv * 5.0 + warp2 * 1.8), fbm(uv * 4.5 - warp2 * 2.0));
  
  float flowVal = fbm(uv * 1.8 + warp3 * 1.5);
  float shape = smoothstep(0.15, 0.7, flowVal);

  vec3 paint = mix(u_color1, u_color2, flowVal);
  float eddy = sin(flowVal * 12.0 + t * 2.0) * 0.5 + 0.5;
  paint = mix(paint, u_color3, eddy * 0.3);

  float wetEdge = smoothstep(0.08, 0.0, abs(flowVal - 0.45)) * 0.25;
  paint = mix(paint, u_color1 * 0.5, wetEdge);

  vec3 paintedPaper = paint * paperBase * (1.0 - fiber * 0.06);
  vec3 col = mix(paperBase, paintedPaper, shape);
  col *= smoothstep(1.3, 0.45, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;

export const watercolorRoughBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.05;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * 480.0;
  float fiber = noise(pUv) * 0.7 + noise(pUv * 2.5) * 0.3;
  vec2 eps = vec2(0.002, 0.0);
  float nx = noise(pUv + vec2(eps.x, eps.y)) - noise(pUv - vec2(eps.x, eps.y));
  float ny = noise(pUv + vec2(eps.y, eps.x)) - noise(pUv - vec2(eps.y, eps.x));
  vec3 normal = normalize(vec3(-nx * 0.8, -ny * 0.8, 0.04));
  vec3 lightDir = normalize(vec3(-0.6, 0.6, 0.5));
  vec3 paperBase = vec3(0.96, 0.95, 0.93) * (0.85 + 0.15 * max(dot(normal, lightDir), 0.0));

  vec2 q = vec2(fbm(uv * 2.0 + t), fbm(uv * 2.5 - t));
  float bleedVal = fbm(uv * 1.5 + q * 0.8);

  float dryBrushMask = smoothstep(0.4, 0.75, fiber);
  float shape = smoothstep(0.25, 0.6, bleedVal) * dryBrushMask;

  vec3 paint = mix(u_color1, u_color2, bleedVal);
  float edge = smoothstep(0.03, 0.0, abs(bleedVal - 0.55)) * dryBrushMask;
  paint = mix(paint, u_color3 * 0.6, edge * 0.8);

  vec3 paintedPaper = paint * paperBase * (1.0 - fiber * 0.15);
  vec3 col = mix(paperBase, paintedPaper, shape);
  col *= smoothstep(1.3, 0.5, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;

export const watercolorSaltBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.06;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * 360.0;
  float fiber = noise(pUv) * 0.6 + noise(pUv * 2.0) * 0.4;
  vec3 paperBase = vec3(0.97, 0.96, 0.94) * (0.92 + 0.08 * noise(pUv * 0.3));

  vec2 q = vec2(fbm(uv * 2.5 + t), fbm(uv * 2.8 - t));
  float bleedVal = fbm(uv * 2.0 + q * 1.2);

  vec2 saltUv = uv * 14.0 + vec2(t * 0.2, -t * 0.1);
  vec2 cellId = floor(saltUv);
  vec2 cellFract = fract(saltUv) - 0.5;
  float cellHash = hash(cellId);
  float saltSpot = 0.0;
  if (cellHash > 0.6) {
    vec2 offset = vec2(sin(cellHash * 6.28), cos(cellHash * 6.28)) * 0.25;
    float dist = length(cellFract - offset);
    float star = 1.0 - smoothstep(0.0, 0.3, dist);
    star *= 0.6 + 0.4 * noise(uv * 180.0 + cellHash);
    saltSpot = star * 0.7;
  }

  float modifiedBleed = clamp(bleedVal - saltSpot * 0.6, 0.0, 1.0);
  float shape = smoothstep(0.2, 0.65, modifiedBleed);
  float ring = smoothstep(0.04, 0.0, abs(modifiedBleed - 0.42)) * 0.6;
  float saltRing = smoothstep(0.03, 0.0, abs(saltSpot - 0.18)) * 0.4;

  vec3 paint = mix(u_color1, u_color2, smoothstep(0.3, 0.7, modifiedBleed));
  paint = mix(paint, u_color3 * 0.6, ring + saltRing * 1.2);

  vec3 paintedPaper = paint * paperBase * (1.0 - fiber * 0.08);
  vec3 col = mix(paperBase, paintedPaper, shape);
  col = mix(col, paperBase, saltSpot * 0.4 * shape);

  col *= smoothstep(1.3, 0.5, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;

export const watercolorInkBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.08;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * vec2(40.0, 420.0);
  float fiber = noise(pUv) * 0.7 + noise(uv * 450.0) * 0.3;
  vec3 paperBase = vec3(0.95, 0.94, 0.91) * (0.95 + 0.05 * noise(uv * 12.0));

  vec2 q = vec2(fbm(uv * 2.0 + vec2(t * 0.1, t * 0.03)), fbm(uv * 2.2 - vec2(t * 0.03, t * 0.1)));
  q.x += fiber * 0.15;
  float bleedVal = fbm(uv * 1.6 + q * 1.4);

  float shape = smoothstep(0.15, 0.75, bleedVal);

  float lum1 = dot(u_color1, vec3(0.299, 0.587, 0.114));
  float lum2 = dot(u_color2, vec3(0.299, 0.587, 0.114));
  float lum3 = dot(u_color3, vec3(0.299, 0.587, 0.114));

  vec3 inkColor1 = vec3(0.06, 0.06, 0.07) * (0.8 + 0.4 * lum1);
  vec3 inkColor2 = vec3(0.18, 0.18, 0.20) * (0.7 + 0.5 * lum2);
  vec3 inkColor3 = vec3(0.42, 0.42, 0.45) * (0.6 + 0.6 * lum3);

  vec3 paint = mix(inkColor2, inkColor1, smoothstep(0.3, 0.8, bleedVal));
  float fiberBleed = smoothstep(0.06, 0.0, abs(bleedVal - 0.45)) * fiber * 0.25;
  paint = mix(paint, inkColor3 * 0.4, fiberBleed);

  vec3 paintedPaper = paint * paperBase * (1.0 - fiber * 0.05);
  vec3 col = mix(paperBase, paintedPaper, shape);

  col *= smoothstep(1.3, 0.45, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;

export const watercolorGlazeBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.06;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * 380.0;
  float fiber = noise(pUv) * 0.6 + noise(pUv * 2.0) * 0.4;
  vec3 paperBase = vec3(0.97, 0.96, 0.94);

  vec2 q1 = vec2(fbm(uv * 2.0 + vec2(t * 0.1, t * 0.05)), fbm(uv * 2.2 - vec2(t * 0.05, t * 0.08)));
  float bleed1 = fbm(uv * 1.8 + q1 * 1.2);
  float shape1 = smoothstep(0.22, 0.6, bleed1);
  float ring1 = smoothstep(0.03, 0.0, abs(bleed1 - 0.42)) * 0.3;
  vec3 paint1 = mix(u_color1, u_color3 * 0.8, bleed1);
  paint1 = mix(paint1, u_color3 * 0.5, ring1);

  vec2 q2 = vec2(fbm(uv * 2.3 - vec2(t * 0.08, t * 0.1)), fbm(uv * 2.5 + vec2(t * 0.05, t * 0.05)));
  float bleed2 = fbm(uv * 2.0 + q2 * 1.1);
  float shape2 = smoothstep(0.25, 0.65, bleed2);
  float ring2 = smoothstep(0.03, 0.0, abs(bleed2 - 0.45)) * 0.3;
  vec3 paint2 = mix(u_color2, u_color3 * 0.9, bleed2);
  paint2 = mix(paint2, u_color3 * 0.4, ring2);

  vec3 col = paperBase;
  if (shape1 > 0.0) {
    vec3 layer1 = mix(paperBase, paint1 * paperBase, shape1);
    col = layer1;
  }
  if (shape2 > 0.0) {
    vec3 layer2 = paint2 * (col / paperBase);
    col = mix(col, layer2 * paperBase, shape2);
  }

  col *= (1.0 - fiber * 0.06);
  col *= smoothstep(1.3, 0.5, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;

export const watercolorMetallicBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.08;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * 400.0;
  float n1 = noise(pUv);
  float n2 = noise(pUv * 2.0);
  float fiber = n1 * 0.6 + n2 * 0.4;

  vec2 eps = vec2(0.003, 0.0);
  float nx = noise(pUv + vec2(eps.x, eps.y)) - noise(pUv - vec2(eps.x, eps.y));
  float ny = noise(pUv + vec2(eps.y, eps.x)) - noise(pUv - vec2(eps.y, eps.x));
  vec3 normal = normalize(vec3(-nx * 0.5, -ny * 0.5, 0.06));

  vec3 lightDir = normalize(vec3(-0.4 + 0.1 * sin(t), 0.5, 0.6));
  float diffuse = max(dot(normal, lightDir), 0.0);
  vec3 paperBase = vec3(0.96, 0.95, 0.93) * (0.92 + 0.08 * diffuse);

  vec2 q = vec2(fbm(uv * 2.8 + vec2(t * 0.1, t * 0.05)), fbm(uv * 3.0 - vec2(t * 0.05, t * 0.1)));
  float bleedVal = fbm(uv * 2.2 + q * 1.3);
  float shape = smoothstep(0.2, 0.65, bleedVal);

  vec3 paint = mix(u_color1, u_color2, smoothstep(0.3, 0.7, bleedVal));
  float ring = smoothstep(0.04, 0.0, abs(bleedVal - 0.45));
  paint = mix(paint, u_color3 * 0.6, ring * 0.5);

  vec2 sparkleGrid = uv * 320.0;
  vec2 cellId = floor(sparkleGrid);
  float cellHash = hash(cellId);
  
  float sparkle = 0.0;
  if (cellHash > 0.94) {
    vec3 halfVec = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(normal, halfVec), 0.0), 16.0 + cellHash * 32.0);
    float twinkle = 0.5 + 0.5 * sin(t * 5.0 + cellHash * 100.0);
    sparkle = spec * twinkle * (0.4 + 0.6 * shape);
  }

  vec3 paintedPaper = paint * paperBase * (1.0 - fiber * 0.08);
  vec3 col = mix(paperBase, paintedPaper, shape);

  vec3 goldColor = vec3(1.0, 0.82, 0.35) * u_color3;
  col += goldColor * sparkle * 2.2 * u_intensity;

  col *= smoothstep(1.3, 0.5, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;

export const watercolorGravityBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.1;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * 360.0;
  float fiber = noise(pUv) * 0.6 + noise(pUv * 2.0) * 0.4;
  vec3 paperBase = vec3(0.97, 0.96, 0.94);

  vec2 gravityUv = uv;
  float drips = sin(uv.x * 6.0 + fbm(uv * 2.0) * 0.5) * 0.4;
  gravityUv.y += drips * fbm(vec2(uv.x * 4.0, uv.y - t * 0.4)) * 0.3;
  gravityUv.y -= t * 0.1;

  vec2 q = vec2(fbm(gravityUv * 2.4), fbm(gravityUv * 2.6));
  float bleedVal = fbm(gravityUv * 1.8 + q * 1.2);
  float shape = smoothstep(0.2, 0.62, bleedVal);

  float ring = smoothstep(0.04, 0.0, abs(bleedVal - 0.44));

  vec3 paint = mix(u_color1, u_color2, bleedVal);
  paint = mix(paint, u_color3 * 0.7, ring * 0.6);

  vec3 paintedPaper = paint * paperBase * (1.0 - fiber * 0.08);
  vec3 col = mix(paperBase, paintedPaper, shape);

  col *= smoothstep(1.3, 0.5, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;

export const watercolorGranulatingBody = `
void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.06;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pUv = uv * 420.0;
  float n1 = noise(pUv);
  float n2 = noise(pUv * 3.0);
  float fiber = n1 * 0.65 + n2 * 0.35;
  vec3 paperBase = vec3(0.97, 0.96, 0.94);

  vec2 q = vec2(fbm(uv * 2.8 + t), fbm(uv * 3.0 - t));
  float bleedVal = fbm(uv * 2.2 + q * 1.3);
  float shape = smoothstep(0.18, 0.65, bleedVal);

  float sedimentVal = smoothstep(0.35, 0.6, fiber);
  
  vec3 heavyPigment = u_color1 * 0.85;
  vec3 lightPigment = u_color2;
  
  vec3 basePaint = mix(heavyPigment, lightPigment, bleedVal);
  vec3 granularPaint = mix(heavyPigment * 0.7, basePaint, sedimentVal);
  
  float grainNoise = hash(floor(pUv * 1.5));
  vec3 paint = mix(granularPaint, heavyPigment * 0.5, (1.0 - sedimentVal) * grainNoise * 0.45);

  float ring = smoothstep(0.04, 0.0, abs(bleedVal - 0.45));
  paint = mix(paint, u_color3 * 0.6, ring * 0.5);

  vec3 paintedPaper = paint * paperBase * (1.0 - fiber * 0.12);
  vec3 col = mix(paperBase, paintedPaper, shape);

  col *= smoothstep(1.3, 0.5, length(p));
  fragColor = vec4(col * u_intensity, 1.0);
}
`;
