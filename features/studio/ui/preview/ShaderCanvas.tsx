"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import {
  getShaderPreset,
  FULLSCREEN_VERTEX_SHADER,
  FULLSCREEN_VERTEX_SHADER_V1,
} from "@/core/motion-doc/presets/shaderPresets";

type ShaderCanvasProps = {
  presetId: string;
  color1?: string;
  color2?: string;
  color3?: string;
  intensity?: number;
  speed?: number;
  softness?: number;
  scale?: number;
  detail?: number;
  className?: string;
  style?: CSSProperties;
};

/** Parse a hex color string into a normalized [r, g, b] triple. */
function hexToVec3(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const fullHex =
    clean.length === 3
      ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
      : clean;

  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;

  return [
    Number.isFinite(r) ? r : 0,
    Number.isFinite(g) ? g : 0,
    Number.isFinite(b) ? b : 0,
  ];
}

function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  // Shaders can be detached after linking
  gl.detachShader(program, vert);
  gl.detachShader(program, frag);
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  return program;
}

export function ShaderCanvas({
  presetId,
  color1 = "#7c3aed",
  color2 = "#2563eb",
  color3 = "#06b6d4",
  intensity = 0.5,
  speed = 1,
  softness = 0.5,
  scale = 0.5,
  detail = 0.5,
  className,
  style,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>(0);
  const renderRef = useRef<() => void>(() => {});
  const startTimeRef = useRef<number>(0);
  const uniformsRef = useRef({
    color1: hexToVec3(color1),
    color2: hexToVec3(color2),
    color3: hexToVec3(color3),
    intensity,
    speed,
    softness,
    scale,
    detail,
  });
  const isV2Ref = useRef(false);
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
  const vboRef = useRef<WebGLBuffer | null>(null);

  useEffect(() => {
    uniformsRef.current = {
      color1: hexToVec3(color1),
      color2: hexToVec3(color2),
      color3: hexToVec3(color3),
      intensity,
      speed,
      softness,
      scale,
      detail,
    };
  }, [color1, color2, color3, intensity, speed, softness, scale, detail]);

  useEffect(() => {
    renderRef.current = () => {
      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;

      if (!gl || !program || !canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.round(canvas.clientWidth * dpr);
      const displayHeight = Math.round(canvas.clientHeight * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
      }

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const u = uniformsRef.current;

      gl.useProgram(program);

      const uTime = gl.getUniformLocation(program, "u_time");
      const uResolution = gl.getUniformLocation(program, "u_resolution");
      const uColor1 = gl.getUniformLocation(program, "u_color1");
      const uColor2 = gl.getUniformLocation(program, "u_color2");
      const uColor3 = gl.getUniformLocation(program, "u_color3");
      const uIntensity = gl.getUniformLocation(program, "u_intensity");
      const uSpeed = gl.getUniformLocation(program, "u_speed");
      const uSoftness = gl.getUniformLocation(program, "u_softness");
      const uScale = gl.getUniformLocation(program, "u_scale");
      const uDetail = gl.getUniformLocation(program, "u_detail");

      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, displayWidth, displayHeight);
      gl.uniform3f(uColor1, u.color1[0], u.color1[1], u.color1[2]);
      gl.uniform3f(uColor2, u.color2[0], u.color2[1], u.color2[2]);
      gl.uniform3f(uColor3, u.color3[0], u.color3[1], u.color3[2]);
      gl.uniform1f(uIntensity, u.intensity);
      gl.uniform1f(uSpeed, u.speed);
      gl.uniform1f(uSoftness, u.softness);
      gl.uniform1f(uScale, u.scale);
      gl.uniform1f(uDetail, u.detail);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      rafRef.current = requestAnimationFrame(renderRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preset = getShaderPreset(presetId);
    if (!preset) return;

    // Try WebGL2, fallback to WebGL1
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false });
    let isV2 = true;

    if (!gl) {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
      isV2 = false;
    }

    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }

    isV2Ref.current = isV2;
    glRef.current = gl;

    const vertexSource = isV2 ? FULLSCREEN_VERTEX_SHADER : FULLSCREEN_VERTEX_SHADER_V1;
    const fragmentSource = isV2 ? preset.fragmentV3 : preset.fragmentV1;

    const program = createProgram(gl, vertexSource, fragmentSource);
    if (!program) return;

    programRef.current = program;

    // For WebGL1 we need a buffer + attribute; for WebGL2 we can use gl_VertexID
    if (!isV2) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      vboRef.current = buffer;

      const aPos = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    } else {
      // WebGL2: VAO with no attributes (vertex shader uses gl_VertexID)
      const gl2 = gl as WebGL2RenderingContext;
      const vao = gl2.createVertexArray();
      gl2.bindVertexArray(vao);
      vaoRef.current = vao;
    }

    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(renderRef.current);

    // Pause when tab hidden
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        startTimeRef.current = performance.now() - (startTimeRef.current > 0 ? 0 : 0);
        rafRef.current = requestAnimationFrame(renderRef.current);
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);

      if (programRef.current) {
        gl!.deleteProgram(programRef.current);
        programRef.current = null;
      }
      if (vaoRef.current && isV2Ref.current) {
        (gl as WebGL2RenderingContext).deleteVertexArray(vaoRef.current);
        vaoRef.current = null;
      }
      if (vboRef.current) {
        gl!.deleteBuffer(vboRef.current);
        vboRef.current = null;
      }
      glRef.current = null;
    };
  }, [presetId]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        ...style,
      }}
    />
  );
}
