import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PALETTE } from "./stateConfig";
import type { ColorRef, NumberRef, PointerRef } from "./types";

const BOUNDS = { x: 8, yMin: -1.1, yMax: 3.2, zMin: -3.2, zMax: 3.2 };
const PROXIMITY_RADIUS = 1.6;
const PROXIMITY_BOOST = 0.55;
const PARTICLE_GEOMETRY = new THREE.BoxGeometry(0.05, 0.05, 0.05);
const BASE_COLOR = new THREE.Color("#4a80c0");

interface ParticleDatum {
  basePosition: THREE.Vector3;
  phase: number;
  bobAmplitude: number;
  bobSpeed: number;
  spin: number;
  scale: number;
}

/** Small deterministic PRNG so the particle field is stable across reloads (no hydration/layout jitter). */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createParticles(count: number): ParticleDatum[] {
  const rand = seededRandom(1337);
  return Array.from({ length: count }, () => ({
    basePosition: new THREE.Vector3(
      (rand() - 0.5) * 2 * BOUNDS.x,
      BOUNDS.yMin + rand() * (BOUNDS.yMax - BOUNDS.yMin),
      BOUNDS.zMin + rand() * (BOUNDS.zMax - BOUNDS.zMin)
    ),
    phase: rand() * Math.PI * 2,
    bobAmplitude: 0.08 + rand() * 0.18,
    bobSpeed: 0.15 + rand() * 0.35,
    spin: (rand() - 0.5) * 0.6,
    scale: 0.4 + rand() * 1,
  }));
}

interface ParticleFieldProps {
  count: number;
  speedRef: NumberRef;
  glowRef: ColorRef;
  pointerRef: PointerRef;
  interactive: boolean;
  reducedMotion: boolean;
  intensity: number;
}

/**
 * Ambient floating-cube texture behind the whole scene (the small scattered
 * cubes seen in the reference art). A single InstancedMesh keeps this to one
 * draw call regardless of particle count. When `interactive`, particles near
 * the pointer brighten and swell slightly — a deliberately subtle effect.
 */
export function ParticleField({
  count,
  speedRef,
  glowRef,
  pointerRef,
  interactive,
  reducedMotion,
  intensity,
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => createParticles(count), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const proximityColor = useMemo(() => new THREE.Color(), []);
  const elapsed = useRef(0);
  const { viewport } = useThree();

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.5 * intensity,
        toneMapped: false,
      }),
    [intensity]
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!reducedMotion) elapsed.current += delta * speedRef.current;
    const t = elapsed.current;

    const pointerWorldX = interactive ? pointerRef.current.x * viewport.width * 0.5 : Number.POSITIVE_INFINITY;
    const pointerWorldY = interactive ? pointerRef.current.y * viewport.height * 0.5 : Number.POSITIVE_INFINITY;

    particles.forEach((p, i) => {
      const bob = Math.sin(t * p.bobSpeed + p.phase) * p.bobAmplitude;
      dummy.position.set(p.basePosition.x, p.basePosition.y + bob, p.basePosition.z);
      dummy.rotation.set(t * p.spin, t * p.spin * 0.7, 0);

      let boost = 0;
      if (interactive) {
        const dx = dummy.position.x - pointerWorldX;
        const dy = dummy.position.y - pointerWorldY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        boost = Math.max(0, 1 - dist / PROXIMITY_RADIUS) * PROXIMITY_BOOST;
      }

      dummy.scale.setScalar(p.scale * (1 + boost * 0.6));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      proximityColor.copy(BASE_COLOR).lerp(glowRef.current, Math.min(1, boost + 0.12));
      mesh.setColorAt(i, proximityColor);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[PARTICLE_GEOMETRY, material, count]}
      frustumCulled={false}
    />
  );
}
