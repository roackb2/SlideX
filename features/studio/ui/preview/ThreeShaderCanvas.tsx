"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { getShaderPreset } from "@/core/motion-doc/presets/shaderPresets";

type ThreeShaderCanvasProps = {
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

const THREE_FULLSCREEN_VERTEX_SHADER = `precision highp float;
in vec3 position;
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

export function ThreeShaderCanvas({
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
  style
}: ThreeShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const valuesRef = useRef({
    color1,
    color2,
    color3,
    detail,
    intensity,
    scale,
    softness,
    speed
  });

  useEffect(() => {
    valuesRef.current = {
      color1,
      color2,
      color3,
      detail,
      intensity,
      scale,
      softness,
      speed
    };
  }, [color1, color2, color3, detail, intensity, scale, softness, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const preset = getShaderPreset(presetId);

    if (!canvas || !preset) {
      return;
    }

    const canvasElement = canvas;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        canvas: canvasElement,
        premultipliedAlpha: false
      });
    } catch (error) {
      console.warn("Three.js shader renderer unavailable:", error);
      return;
    }

    const initialValues = valuesRef.current;
    const uniforms = {
      u_color1: { value: safeColor(initialValues.color1) },
      u_color2: { value: safeColor(initialValues.color2) },
      u_color3: { value: safeColor(initialValues.color3) },
      u_detail: { value: initialValues.detail },
      u_intensity: { value: initialValues.intensity },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_scale: { value: initialValues.scale },
      u_softness: { value: initialValues.softness },
      u_speed: { value: initialValues.speed },
      u_time: { value: 0 }
    };
    const material = new THREE.RawShaderMaterial({
      depthTest: false,
      depthWrite: false,
      fragmentShader: stripGlslVersion(preset.fragmentV3),
      glslVersion: THREE.GLSL3,
      transparent: true,
      uniforms,
      vertexShader: THREE_FULLSCREEN_VERTEX_SHADER
    });
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);

    scene.add(mesh);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    startTimeRef.current = performance.now();

    function render() {
      const values = valuesRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(canvasElement.clientWidth, 1);
      const height = Math.max(canvasElement.clientHeight, 1);

      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);

      uniforms.u_time.value = (performance.now() - startTimeRef.current) / 1000;
      uniforms.u_resolution.value.set(Math.round(width * dpr), Math.round(height * dpr));
      uniforms.u_color1.value.copy(safeColor(values.color1));
      uniforms.u_color2.value.copy(safeColor(values.color2));
      uniforms.u_color3.value.copy(safeColor(values.color3));
      uniforms.u_intensity.value = values.intensity;
      uniforms.u_speed.value = values.speed;
      uniforms.u_softness.value = values.softness;
      uniforms.u_scale.value = values.scale;
      uniforms.u_detail.value = values.detail;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      scene.remove(mesh);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [presetId]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        height: "100%",
        width: "100%",
        ...style
      }}
    />
  );
}

function safeColor(value: string) {
  try {
    return new THREE.Color(value);
  } catch {
    return new THREE.Color("#000000");
  }
}

function stripGlslVersion(source: string) {
  return source.replace(/^#version\s+300\s+es\s*\n/, "");
}
