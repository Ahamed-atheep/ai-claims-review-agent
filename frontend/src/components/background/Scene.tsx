import { CameraRig } from "./CameraRig";
import { AgentNodeField } from "./AgentNode";
import { DataStreams } from "./DataStream";
import { FloatingDocuments } from "./FloatingDocuments";
import { ParticleField } from "./ParticleField";
import { GridLattice } from "./GridLattice";
import { PostFX } from "./PostFX";
import { PALETTE, QUALITY } from "./stateConfig";
import { useStateAnimator, usePointerRef } from "./hooks";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import type { BackgroundState, PerformanceTier } from "./types";

interface SceneProps {
  state: BackgroundState;
  intensity: number;
  interactive: boolean;
  tier: PerformanceTier;
  reducedMotion: boolean;
}

export function Scene({ state, intensity, interactive, tier, reducedMotion }: SceneProps) {
  const quality = QUALITY[tier];
  const isInteractive = interactive && !reducedMotion;
  const pointerRef = usePointerRef(isInteractive);
  const { colorRef, glowRef, speedRef, bloomRef, pulseRef } = useStateAnimator(state, reducedMotion);
  const sceneGroupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!reducedMotion) elapsed.current += delta;
    if (sceneGroupRef.current) {
      // Slow ambient Y-axis drift so the scene never feels frozen
      sceneGroupRef.current.rotation.y = Math.sin(elapsed.current * 0.07) * 0.06;
    }
  });

  return (
    <>
      <color attach="background" args={["#b8d4f0"]} />
      <fog attach="fog" args={["#d0e8f8", 10, 22]} />
      <ambientLight intensity={1.2} color="#ddeeff" />
      <directionalLight position={[6, 10, 6]} intensity={1.4} color="#ffffff" castShadow />
      <directionalLight position={[-4, 6, -4]} intensity={0.6} color="#a8c8f0" />
      <pointLight position={[0, 4, 2]} intensity={2.0} color={PALETTE.blue} distance={12} decay={2} />

      {tier === 'high' && <Environment preset="city" />}

      <CameraRig pointerRef={pointerRef} interactive={isInteractive} />

      {/* Lift entire scene content up so objects appear in upper half of viewport */}
      <group ref={sceneGroupRef} position={[0, 1.3, 0]}>
        <GridLattice intensity={intensity} speedRef={speedRef} reducedMotion={reducedMotion} />

        <ParticleField
          count={quality.particles}
          speedRef={speedRef}
          glowRef={glowRef}
          pointerRef={pointerRef}
          interactive={isInteractive}
          reducedMotion={reducedMotion}
          intensity={intensity}
        />

        <FloatingDocuments
          count={quality.documents}
          speedRef={speedRef}
          intensity={intensity}
          reducedMotion={reducedMotion}
        />

        <DataStreams colorRef={colorRef} speedRef={speedRef} intensity={intensity} reducedMotion={reducedMotion} />

        <AgentNodeField
          colorRef={colorRef}
          glowRef={glowRef}
          speedRef={speedRef}
          pulseRef={pulseRef}
          reducedMotion={reducedMotion}
          tier={tier}
        />
      </group>

      {quality.bloom && <PostFX bloomRef={bloomRef} intensity={intensity} />}
    </>
  );
}
