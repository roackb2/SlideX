/** Shared fullscreen-quad vertex shader */
const FULLSCREEN_VERTEX = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  vUv = vec2(x, y) * 0.5;
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0);
}`;

/** WebGL1 fallback vertex shader (attribute-based) */
const FULLSCREEN_VERTEX_V1 = `
precision highp float;
attribute vec2 a_position;
varying vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/* ────────────────────────────────────────────────────────────
   Common GLSL helpers (inlined into every fragment shader)
   ──────────────────────────────────────────────────────────── */

const NOISE_HELPERS = `
// Simple pseudo-random
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Smooth value noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// Fractal Brownian Motion
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}
`;

/* ────────────────────────────────────────────────────────────
   Shader Preset Definitions
   ──────────────────────────────────────────────────────────── */

export type ShaderPreset = {
  id: string;
  name: string;
  category: "geometric" | "organic" | "particle" | "gradient";
  thumbnail: string; // CSS gradient for UI preview
  fragmentV3: string; // GLSL 300 es
  fragmentV1: string; // GLSL 100 (WebGL1 fallback)
};

function makeFragment300(body: string) {
  return `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec3  u_color1;
uniform vec3  u_color2;
uniform vec3  u_color3;
uniform float u_intensity;
uniform float u_speed;
uniform float u_softness;
uniform float u_scale;
uniform float u_detail;

${NOISE_HELPERS}

${body}`;
}

function makeFragment100(body: string) {
  return `precision highp float;
varying vec2 vUv;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec3  u_color1;
uniform vec3  u_color2;
uniform vec3  u_color3;
uniform float u_intensity;
uniform float u_speed;
uniform float u_softness;
uniform float u_scale;
uniform float u_detail;

${NOISE_HELPERS}

${body.replace("fragColor", "gl_FragColor")}`;
}

export function makePreset(
  id: string,
  name: string,
  category: ShaderPreset["category"],
  thumbnail: string,
  mainBody: string
): ShaderPreset {
  return {
    id,
    name,
    category,
    thumbnail,
    fragmentV3: makeFragment300(mainBody),
    fragmentV1: makeFragment100(mainBody),
  };
}

export const FULLSCREEN_VERTEX_SHADER = FULLSCREEN_VERTEX;
export const FULLSCREEN_VERTEX_SHADER_V1 = FULLSCREEN_VERTEX_V1;
