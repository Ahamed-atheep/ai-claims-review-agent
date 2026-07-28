import { useRef } from "react";
import type { Ref } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction, type BloomEffect } from "postprocessing";
import type { NumberRef } from "./types";

interface PostFXProps {
  bloomRef: NumberRef;
  intensity: number;
}

/**
 * Minimal post-processing: bloom (so emissive node cores and data packets
 * actually glow) plus a soft vignette (focuses the eye and helps the UI's
 * edges/corners stay calm). Bloom intensity is driven every frame from
 * `bloomRef` by mutating the effect instance directly — no React state, so
 * state transitions never trigger an EffectComposer re-render.
 */
export function PostFX({ bloomRef, intensity }: PostFXProps) {
  const bloomEffectRef = useRef<BloomEffect>(null);

  useFrame(() => {
    if (bloomEffectRef.current) {
      bloomEffectRef.current.intensity = bloomRef.current * intensity * 1.4;
    }
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        // @react-three/postprocessing types Bloom's `ref` prop as
        // `typeof BloomEffect` (the constructor) instead of a `BloomEffect`
        // instance, which is an upstream typing gap, not a runtime issue —
        // the ref genuinely receives the effect instance. Cast at the
        // boundary only; bloomEffectRef itself stays correctly typed.
        ref={bloomEffectRef as unknown as Ref<typeof BloomEffect>}
        mipmapBlur
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        intensity={0.9}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.55} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}
