import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { STATE_CONFIG, getCachedColor, PULSE_DURATION } from "./stateConfig";
import type { BackgroundState, ColorRef, NumberRef, PerformanceTier, PointerRef } from "./types";

/** Tracks the user's OS/browser-level reduced-motion preference, live. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

/** Synchronously probes for WebGL support so there is no fallback "flash" on mount. */
export function useWebglSupported(): boolean {
  const [supported] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      return Boolean(gl);
    } catch {
      return false;
    }
  });
  return supported;
}

/**
 * Best-effort device capability heuristic used to scale particle counts,
 * DPR, and whether post-processing runs at all. Computed once on mount.
 */
export function usePerformanceTier(override?: PerformanceTier): PerformanceTier {
  const [tier] = useState<PerformanceTier>(() => {
    if (override) return override;
    if (typeof navigator === "undefined") return "medium";

    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    let rendererHint: string | null = null;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
      const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
      if (gl && debugInfo) {
        rendererHint = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
      }
    } catch {
      rendererHint = null;
    }
    const looksSoftwareRendered = rendererHint ? /SwiftShader|llvmpipe|Software/i.test(rendererHint) : false;

    if (looksSoftwareRendered || cores <= 2 || memory <= 2) return "low";
    if (isMobile || cores <= 4 || memory <= 4) return "medium";
    return "high";
  });

  return tier;
}

/**
 * Shares normalized (-1..1) pointer position across scene components via a
 * ref, so pointer movement never triggers a React re-render.
 */
export function usePointerRef(enabled: boolean): PointerRef {
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [enabled]);

  return pointerRef;
}

interface StateAnimatorResult {
  colorRef: ColorRef;
  glowRef: ColorRef;
  speedRef: NumberRef;
  bloomRef: NumberRef;
  pulseRef: NumberRef;
}

/**
 * Smoothly animates all state-driven visual parameters (accent color, glow
 * color, motion speed, bloom intensity, entry pulse) toward the target
 * defined for `state` in STATE_CONFIG. Values are exposed as refs and
 * mutated inside useFrame so downstream consumers never re-render.
 *
 * Must be called from a component mounted inside a react-three-fiber
 * <Canvas> (it uses useFrame/useThree internally).
 */
export function useStateAnimator(state: BackgroundState, reducedMotion: boolean): StateAnimatorResult {
  const target = STATE_CONFIG[state];
  const { invalidate } = useThree();

  const colorRef = useRef(getCachedColor(target.accent).clone());
  const glowRef = useRef(getCachedColor(target.glow).clone());
  const speedRef = useRef(target.speed);
  const bloomRef = useRef(target.bloom);
  const pulseRef = useRef(0);
  const pulseElapsed = useRef<number | null>(null);
  const prevState = useRef<BackgroundState>(state);

  useEffect(() => {
    if (prevState.current === state) return;
    prevState.current = state;
    if (target.pulse > 0) pulseElapsed.current = 0;

    // Under reduced motion the useFrame loop below is skipped entirely, so
    // snap values immediately and force a single repaint (the Canvas runs
    // frameloop="demand" in that mode).
    if (reducedMotion) {
      colorRef.current.set(target.accent);
      glowRef.current.set(target.glow);
      speedRef.current = target.speed;
      bloomRef.current = target.bloom;
    }
    invalidate();
  }, [state, reducedMotion, target, invalidate]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const smoothing = 1 - Math.pow(0.001, delta); // frame-rate independent ease

    colorRef.current.lerp(getCachedColor(target.accent), smoothing);
    glowRef.current.lerp(getCachedColor(target.glow), smoothing);
    speedRef.current += (target.speed - speedRef.current) * smoothing;
    bloomRef.current += (target.bloom - bloomRef.current) * smoothing;

    if (pulseElapsed.current !== null) {
      pulseElapsed.current += delta;
      const decay = Math.max(0, 1 - pulseElapsed.current / PULSE_DURATION);
      pulseRef.current = target.pulse * decay;
      if (decay <= 0) pulseElapsed.current = null;
    } else {
      pulseRef.current = 0;
    }
  });

  return { colorRef, glowRef, speedRef, bloomRef, pulseRef };
}
