import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { NumberRef } from "./types";

// Blue glass palette matching the reference video
const GRID_COLOR = "#2a7fff";
const GRID_COLOR_BRIGHT = "#60b4ff";
const PANEL_COLOR = "#4a9eff";

const FLOOR_SIZE = 30;
const FLOOR_DIVISIONS = 18;
const FLOOR_Y = -1.4;

/** Elevated isometric glass panel configs matching the reference */
const PANEL_CONFIGS: { w: number; h: number; position: [number, number, number]; rotY: number; elevation: number }[] = [
  { w: 3.5, h: 2.5, position: [-3.8, 0.3, -0.2], rotY: 0, elevation: 0 },
  { w: 2.2, h: 1.8, position: [-1.2, 0.8, -1.9], rotY: 0.05, elevation: 0.4 },
  { w: 4.6, h: 3.0, position: [1.4, 0.5, -2.8], rotY: -0.05, elevation: 0 },
  { w: 1.8, h: 1.5, position: [-5.2, -0.1, 1.2], rotY: 0.02, elevation: 0.2 },
  { w: 5.0, h: 3.5, position: [3.5, 0.2, -0.8], rotY: -0.08, elevation: 0 },
  { w: 2.8, h: 2.0, position: [0.5, 1.1, 1.6], rotY: 0.03, elevation: 0.6 },
];

function buildFloorGeometry(): THREE.BufferGeometry {
  const points: number[] = [];
  const half = FLOOR_SIZE / 2;
  const step = FLOOR_SIZE / FLOOR_DIVISIONS;
  for (let i = 0; i <= FLOOR_DIVISIONS; i += 1) {
    const p = -half + i * step;
    points.push(-half, 0, p, half, 0, p);
    points.push(p, 0, -half, p, 0, half);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

function buildPanelGeometry(w: number, h: number): THREE.BufferGeometry {
  // Build a flat rectangular grid panel (isometric glass panel)
  const points: number[] = [];
  const divX = Math.round(w * 2.5);
  const divZ = Math.round(h * 2.5);
  for (let i = 0; i <= divX; i++) {
    const x = -w / 2 + (i / divX) * w;
    points.push(x, 0, -h / 2, x, 0, h / 2);
  }
  for (let j = 0; j <= divZ; j++) {
    const z = -h / 2 + (j / divZ) * h;
    points.push(-w / 2, 0, z, w / 2, 0, z);
  }
  // Add a border box frame
  points.push(-w / 2, 0, -h / 2, w / 2, 0, -h / 2);
  points.push(w / 2, 0, -h / 2, w / 2, 0, h / 2);
  points.push(w / 2, 0, h / 2, -w / 2, 0, h / 2);
  points.push(-w / 2, 0, h / 2, -w / 2, 0, -h / 2);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

interface GridLatticeProps {
  intensity: number;
  speedRef: NumberRef;
  reducedMotion: boolean;
}

export function GridLattice({ intensity, speedRef, reducedMotion }: GridLatticeProps) {
  const floorGeometry = useMemo(buildFloorGeometry, []);
  const panelGeometries = useMemo(
    () => PANEL_CONFIGS.map((p) => buildPanelGeometry(p.w, p.h)),
    []
  );
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  const floorMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: GRID_COLOR_BRIGHT,
        transparent: true,
        opacity: 0.32 * intensity,
      }),
    [intensity]
  );

  const panelMaterials = useMemo(
    () =>
      PANEL_CONFIGS.map((_, i) =>
        new THREE.LineBasicMaterial({
          color: i % 2 === 0 ? GRID_COLOR : PANEL_COLOR,
          transparent: true,
          opacity: (0.28 + i * 0.04) * intensity,
        })
      ),
    [intensity]
  );

  // Translucent glass face for each panel
  const panelFaceMaterials = useMemo(
    () =>
      PANEL_CONFIGS.map(() =>
        new THREE.MeshBasicMaterial({
          color: "#a0c8f0",
          transparent: true,
          opacity: 0.04,
          side: THREE.DoubleSide,
        })
      ),
    []
  );

  const panelFaceGeometries = useMemo(
    () =>
      PANEL_CONFIGS.map((p) =>
        new THREE.PlaneGeometry(p.w, p.h)
      ),
    []
  );

  useFrame((_, delta) => {
    if (!reducedMotion) elapsed.current += delta * speedRef.current;
    if (group.current) {
      group.current.rotation.y = Math.sin(elapsed.current * 0.018) * 0.025;
    }
  });

  return (
    <group ref={group}>
      {/* Main floor grid */}
      <lineSegments geometry={floorGeometry} material={floorMaterial} position={[0, FLOOR_Y, 0]} />

      {/* Elevated glass panel grids */}
      {PANEL_CONFIGS.map((panel, i) => (
        <group
          key={i}
          position={panel.position}
          rotation={[0, panel.rotY, 0]}
        >
          {/* Glass face */}
          <mesh
            geometry={panelFaceGeometries[i]}
            material={panelFaceMaterials[i]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
          {/* Grid lines */}
          <lineSegments geometry={panelGeometries[i]} material={panelMaterials[i]} />
          {/* Raised edge frame (vertical walls for depth illusion) */}
          <lineSegments
            geometry={panelGeometries[i]}
            material={panelMaterials[i]}
            position={[0, panel.elevation, 0]}
            scale={[1.02, 1, 1.02]}
          />
        </group>
      ))}
    </group>
  );
}
