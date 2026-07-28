import { Component, Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { WebglFallback } from "./WebglFallback";
import { useReducedMotion, useWebglSupported, usePerformanceTier } from "./hooks";
import { QUALITY } from "./stateConfig";
import type { Interactive3DBackgroundProps } from "./types";
import "./background.css";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * If the WebGL context creation or a driver-level render error throws after
 * our upfront support check (real-world drivers do this occasionally), fall
 * back to the CSS gradient instead of taking down the host page.
 */
class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.warn("[Interactive3DBackground] falling back to static background:", error);
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Interactive, state-reactive 3D background layer for the ClaimGuard AI
 * claims-review interface. Renders behind the primary UI, never intercepts
 * pointer events, and degrades gracefully on low-end devices, when WebGL is
 * unavailable, or when the user prefers reduced motion.
 *
 * ```tsx
 * <div className="relative min-h-screen overflow-hidden">
 *   <Interactive3DBackground state={agentStatus} intensity={0.8} interactive />
 *   <main className="relative z-10">...</main>
 * </div>
 * ```
 */
export function Interactive3DBackground({
  state = "idle",
  intensity = 0.8,
  interactive = true,
  qualityOverride,
  className,
}: Interactive3DBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebglSupported();
  const tier = usePerformanceTier(qualityOverride);
  const clampedIntensity = clamp01(intensity);
  const quality = QUALITY[tier];

  const glOptions = useMemo(
    () => ({
      alpha: false,
      antialias: tier !== "low",
      powerPreference: "high-performance" as const,
      stencil: false,
      depth: true,
    }),
    [tier]
  );

  if (!webglSupported) {
    return <WebglFallback state={state} className={className} />;
  }

  const wrapperClassName = `claims-3d-background pointer-events-none absolute inset-0 z-0 overflow-hidden${className ? ` ${className}` : ""
    }`;

  return (
    <div className={wrapperClassName} aria-hidden="true">
      <CanvasErrorBoundary fallback={<WebglFallback state={state} className={className} />}>
        <Canvas
          gl={glOptions}
          dpr={quality.dpr}
          camera={{ fov: 52, near: 0.1, far: 55, position: [-2.2, 3.5, 12.0] }}
          frameloop={reducedMotion ? "demand" : "always"}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
        >
          <Suspense fallback={null}>
            <Scene
              state={state}
              intensity={clampedIntensity}
              interactive={interactive}
              tier={tier}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

export default Interactive3DBackground;
