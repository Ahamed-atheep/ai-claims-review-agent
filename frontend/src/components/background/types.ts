import type { MutableRefObject } from "react";
import type * as THREE from "three";

/**
 * Conceptual states the AI claims-review agent can be in. The background
 * reacts to whichever state the host application passes in — it never
 * infers state on its own.
 */
export type BackgroundState = "idle" | "processing" | "success" | "warning" | "error";

/** Coarse device capability bucket used to scale scene complexity. */
export type PerformanceTier = "low" | "medium" | "high";

export interface Interactive3DBackgroundProps {
  /** Current application state to visually reflect. @default "idle" */
  state?: BackgroundState;
  /** Overall visual strength (opacity/glow/motion energy), 0–1. @default 0.8 */
  intensity?: number;
  /** Whether the scene responds to pointer position. @default true */
  interactive?: boolean;
  /** Force a performance tier instead of auto-detecting the device. */
  qualityOverride?: PerformanceTier;
  /** Extra class names merged onto the fixed/absolute wrapper element. */
  className?: string;
}

/** Per-state target values that scene elements animate toward. */
export interface StateVisualConfig {
  /** Primary accent color for agent-node cores and data packets. */
  accent: string;
  /** Secondary glow color used for rim light, particles, and bloom tint. */
  glow: string;
  /** Multiplier applied to all ambient motion speeds. */
  speed: number;
  /** Bloom effect intensity multiplier. */
  bloom: number;
  /** Strength of the one-shot pulse played when this state is entered (0 = none). */
  pulse: number;
}

/** Mutable ref carrying a live-updated THREE.Color, read (not subscribed to) inside useFrame. */
export type ColorRef = MutableRefObject<THREE.Color>;

/** Mutable ref carrying a live-updated scalar, read (not subscribed to) inside useFrame. */
export type NumberRef = MutableRefObject<number>;

/** Mutable ref carrying normalized (-1..1) pointer coordinates. */
export type PointerRef = MutableRefObject<{ x: number; y: number }>;
