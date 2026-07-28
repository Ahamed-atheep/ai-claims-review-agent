import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PALETTE } from "./stateConfig";
import type { NumberRef } from "./types";

const LINES_PER_DOC = 3;
const DRIFT_SPAN_X = 11; // world-space distance a document travels before recycling
const DRIFT_START_X = -6;
const CARD_GEOMETRY = new THREE.PlaneGeometry(0.3, 0.4);
const LINE_GEOMETRY = new THREE.PlaneGeometry(0.18, 0.025);
const LINE_LOCAL_OFFSETS: [number, number][] = [
  [0.06, 0.06],
  [-0.03, -0.01],
  [0.02, -0.08],
];

interface DocDatum {
  y: number;
  z: number;
  startProgress: number;
  speed: number;
  bobPhase: number;
  bobAmplitude: number;
  tilt: number;
  spinPhase: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createDocs(count: number): DocDatum[] {
  const rand = seededRandom(9973);
  return Array.from({ length: count }, () => ({
    y: 0.4 + rand() * 2.1,
    z: -2.6 + rand() * 4.6,
    startProgress: rand() * DRIFT_SPAN_X,
    speed: 0.18 + rand() * 0.16,
    bobPhase: rand() * Math.PI * 2,
    bobAmplitude: 0.05 + rand() * 0.08,
    tilt: (rand() - 0.5) * 0.5,
    spinPhase: rand() * Math.PI * 2,
  }));
}

interface FloatingDocumentsProps {
  count: number;
  speedRef: NumberRef;
  intensity: number;
  reducedMotion: boolean;
}

/**
 * Flat "claim document" cards drifting left-to-right through the scene,
 * built from plain geometry (a card plane + three thin "text line" planes)
 * rather than a texture, so there is no asset to load or fail. Two
 * InstancedMeshes (cards, lines) keep this at two draw calls regardless of
 * document count.
 */
export function FloatingDocuments({ count, speedRef, intensity, reducedMotion }: FloatingDocumentsProps) {
  const cardRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.InstancedMesh>(null);
  const docs = useMemo(() => createDocs(count), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lineDummy = useMemo(() => new THREE.Object3D(), []);
  const scratchOffset = useMemo(() => new THREE.Vector3(), []);
  const elapsed = useRef(0);

  const cardMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f0f6ff",
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.92 * intensity,
        side: THREE.DoubleSide,
      }),
    [intensity]
  );

  const lineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#2a5a9a",
        transparent: true,
        opacity: 0.7 * intensity,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [intensity]
  );

  useFrame((_, delta) => {
    const cardMesh = cardRef.current;
    const lineMesh = lineRef.current;
    if (!cardMesh || !lineMesh) return;
    if (!reducedMotion) elapsed.current += delta * speedRef.current;
    const t = elapsed.current;

    docs.forEach((doc, i) => {
      const progress = (doc.startProgress + t * doc.speed * 2) % DRIFT_SPAN_X;
      const x = DRIFT_START_X + progress;
      const bob = Math.sin(t * 0.5 + doc.bobPhase) * doc.bobAmplitude;

      dummy.position.set(x, doc.y + bob, doc.z);
      dummy.rotation.set(doc.tilt * 0.3, Math.sin(t * 0.2 + doc.spinPhase) * 0.35, doc.tilt);
      dummy.scale.setScalar(0.8);
      dummy.updateMatrix();
      cardMesh.setMatrixAt(i, dummy.matrix);

      for (let l = 0; l < LINES_PER_DOC; l += 1) {
        const [ox, oy] = LINE_LOCAL_OFFSETS[l];
        scratchOffset.set(ox, oy, 0.006).applyEuler(dummy.rotation);
        lineDummy.position.copy(dummy.position).add(scratchOffset);
        lineDummy.rotation.copy(dummy.rotation);
        lineDummy.scale.setScalar(0.78);
        lineDummy.updateMatrix();
        lineMesh.setMatrixAt(i * LINES_PER_DOC + l, lineDummy.matrix);
      }
    });

    cardMesh.instanceMatrix.needsUpdate = true;
    lineMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={cardRef} args={[CARD_GEOMETRY, cardMaterial, count]} frustumCulled={false} />
      <instancedMesh
        ref={lineRef}
        args={[LINE_GEOMETRY, lineMaterial, count * LINES_PER_DOC]}
        frustumCulled={false}
      />
    </group>
  );
}
