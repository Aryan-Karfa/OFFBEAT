import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

export interface GlowCursorProps {
  className?: string;
  glowColor1?: [number, number, number]; // RGB normalized 0-1
  glowColor2?: [number, number, number];
  subtle?: boolean;
}

export const GlowCursor: React.FC<GlowCursorProps> = ({
  className = "",
  glowColor1 = [1.0, 0.353, 0.212], // OFFBEAT coral #ff5a36
  glowColor2 = [0.898, 0.663, 0.235], // OFFBEAT amber #e5a93c
  subtle = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect if device supports fine hover/pointer (degrade on touch)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let renderer: Renderer | null = null;
    let animId: number = 0;
    let canvasEl: HTMLCanvasElement | null = null;

    try {
      renderer = new Renderer({
        alpha: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const gl = renderer.gl;
      if (gl.canvas instanceof HTMLCanvasElement) {
        canvasEl = gl.canvas;
        canvasEl.className = "absolute inset-0 w-full h-full pointer-events-none";
        container.appendChild(canvasEl);
      }
    } catch {
      // WebGL not supported or failed to init - graceful fallback
      return;
    }

    if (!renderer) return;
    const gl = renderer.gl;
    const geometry = new Triangle(gl);

    // Vertex shader
    const vertex = `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader for luminous glow and decaying trail
    const fragment = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec2 uPrevMouse[6];
      uniform float uIntensity;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        float aspect = uResolution.x / uResolution.y;
        vec2 uvC = vec2(st.x * aspect, st.y);
        vec2 mouseC = vec2(uMouse.x * aspect, uMouse.y);

        // Core glow
        float dist = length(uvC - mouseC);
        float glow = 0.025 / (dist * dist * 45.0 + 0.05);

        // Trailing luminous points
        for (int i = 0; i < 6; i++) {
          vec2 prevC = vec2(uPrevMouse[i].x * aspect, uPrevMouse[i].y);
          float pDist = length(uvC - prevC);
          float decay = float(6 - i) / 6.0;
          glow += (0.012 * decay) / (pDist * pDist * 55.0 + 0.08);
        }

        glow *= uIntensity;

        // Color blend
        vec3 color = mix(uColor1, uColor2, sin(uTime * 0.8) * 0.5 + 0.5);
        vec3 finalColor = color * glow;
        float alpha = clamp(glow * 0.7, 0.0, 0.40);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const trailCount = 6;
    const trailPositions: Array<[number, number]> = Array(trailCount)
      .fill(null)
      .map(() => [0.5, 0.5]);

    const targetMouse = { x: 0.5, y: 0.5 };
    const currentMouse = { x: 0.5, y: 0.5 };
    let currentIntensity = 0.0;
    let targetIntensity = 0.0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [container.clientWidth, container.clientHeight] },
        uMouse: { value: [0.5, 0.5] },
        uPrevMouse: {
          value: trailPositions.flat(),
        },
        uIntensity: { value: 0 },
        uColor1: { value: glowColor1 },
        uColor2: { value: glowColor2 },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { geometry, program });

    // Handle resize
    const handleResize = () => {
      if (!renderer || !container) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL Y is inverted

      targetMouse.x = x;
      targetMouse.y = y;
      targetIntensity = subtle ? 0.9 : 1.2;

      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        targetIntensity = 0.15; // Fade to gentle ambient glow when idle
      }, 1200);
    };

    const handleMouseLeave = () => {
      targetIntensity = 0.0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Animation render loop
    const render = (time: number) => {
      animId = requestAnimationFrame(render);

      // Smooth lerp mouse position
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.18;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.18;

      // Update trail positions
      trailPositions.pop();
      trailPositions.unshift([currentMouse.x, currentMouse.y]);

      // Smooth lerp intensity
      currentIntensity += (targetIntensity - currentIntensity) * 0.08;

      program.uniforms.uTime.value = time * 0.001;
      program.uniforms.uMouse.value = [currentMouse.x, currentMouse.y];
      program.uniforms.uPrevMouse.value = trailPositions.flat();
      program.uniforms.uIntensity.value = currentIntensity;

      if (renderer) {
        renderer.render({ scene: mesh });
      }
    };

    animId = requestAnimationFrame(render);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);

      if (canvasEl && canvasEl.parentNode) {
        canvasEl.parentNode.removeChild(canvasEl);
      }
    };
  }, [glowColor1, glowColor2, subtle]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    />
  );
};
