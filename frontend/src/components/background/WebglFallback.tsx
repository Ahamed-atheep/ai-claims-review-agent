import { useMemo } from "react";
import { STATE_CONFIG } from "./stateConfig";
import type { BackgroundState } from "./types";

interface WebglFallbackProps {
  state: BackgroundState;
  className?: string;
}

/**
 * Static, animation-light fallback for browsers/devices without WebGL. Uses
 * the same palette as the 3D scene (via the current state's glow color) so
 * switching in and out of this fallback is never visually jarring.
 */
export function WebglFallback({ state, className }: WebglFallbackProps) {
  const config = STATE_CONFIG[state];

  const style = useMemo(
    () => ({
      background: `radial-gradient(120% 90% at 8% 15%, ${config.glow}22 0%, transparent 55%),
        linear-gradient(115deg, #0f1b3d 0%, #1d3a8f 22%, #2563eb 45%, #dce8fb 78%, #ffffff 100%)`,
    }),
    [config.glow]
  );

  return (
    <div
      aria-hidden="true"
      className={`claims-bg-fallback pointer-events-none absolute inset-0 z-0 overflow-hidden${
        className ? ` ${className}` : ""
      }`}
      style={style}
    >
      <div className="claims-bg-fallback__grid" />
    </div>
  );
}
