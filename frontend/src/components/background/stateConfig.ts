import * as THREE from "three";
import type { BackgroundState, PerformanceTier, StateVisualConfig } from "./types";

/**
 * Color palette lifted directly from the ClaimGuard AI product UI (buttons,
 * links, stat callouts) and the reference 3D key art. This is the single
 * source of truth for color so the background can never visually drift from
 * the app it sits behind.
 */
export const PALETTE = {
  navy: "#1a3a5c",         // grid lines / deep accents
  blue: "#2a7fff",         // primary brand blue (glowing streams)
  blueLight: "#60b4ff",   // lighter accent, node + stream highlights
  skyMist: "#c8dff5",     // atmospheric fog (light sky)
  white: "#ffffff",
  panelFace: "#a8cdf0",   // glass panel face tint
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
} as const;

/** Seconds a one-shot state-entry pulse takes to fully decay. */
export const PULSE_DURATION = 1.4;

export const STATE_CONFIG: Record<BackgroundState, StateVisualConfig> = {
  idle: { accent: PALETTE.blue, glow: PALETTE.blueLight, speed: 0.45, bloom: 0.55, pulse: 0 },
  processing: { accent: PALETTE.blue, glow: PALETTE.blueLight, speed: 1.65, bloom: 0.9, pulse: 0.3 },
  success: { accent: PALETTE.success, glow: PALETTE.success, speed: 0.7, bloom: 1.1, pulse: 1 },
  warning: { accent: PALETTE.warning, glow: PALETTE.warning, speed: 0.85, bloom: 0.95, pulse: 0.7 },
  error: { accent: PALETTE.error, glow: PALETTE.error, speed: 0.6, bloom: 0.85, pulse: 1 },
};

// Reused THREE.Color instances so per-frame color interpolation never
// allocates a new object. Populated lazily and cached by hex value.
const colorCache = new Map<string, THREE.Color>();
export function getCachedColor(hex: string): THREE.Color {
  let cached = colorCache.get(hex);
  if (!cached) {
    cached = new THREE.Color(hex);
    colorCache.set(hex, cached);
  }
  return cached;
}

interface QualitySettings {
  /** Ambient floating-cube particle count. */
  particles: number;
  /** Floating claim-document count. */
  documents: number;
  /** [min, max] device pixel ratio clamp passed to the Canvas. */
  dpr: [number, number];
  /** Whether bloom/vignette post-processing is enabled. */
  bloom: boolean;
}

export const QUALITY: Record<PerformanceTier, QualitySettings> = {
  low: { particles: 40, documents: 3, dpr: [1, 1], bloom: false },
  medium: { particles: 90, documents: 6, dpr: [1, 1.5], bloom: true },
  high: { particles: 160, documents: 10, dpr: [1, 2], bloom: true },
};
