import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { AGENT_CONNECTIONS, getNodePosition } from "./AgentNode";
import { PALETTE } from "./stateConfig";
import type { ColorRef, NumberRef } from "./types";

const PACKETS_PER_STREAM = 2;
const CURVE_SEGMENTS = 40;
const CURVE_LIFT = 0.4; // how high the connective arc rises above a straight line
const PACKET_RADIUS = 0.035;
const PACKET_SPEED = 0.16;

interface StreamRig {
  curve: THREE.CatmullRomCurve3;
  railLine: THREE.Line;
}

function buildStreamRig(fromId: string, toId: string, railMaterial: THREE.LineBasicMaterial): StreamRig {
  const from = getNodePosition(fromId);
  const to = getNodePosition(toId);
  const mid = from.clone().lerp(to, 0.5);
  mid.y += CURVE_LIFT;

  const curve = new THREE.CatmullRomCurve3([from, mid, to]);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(CURVE_SEGMENTS));
  const railLine = new THREE.Line(geometry, railMaterial);

  return { curve, railLine };
}

interface PacketSlot {
  rigIndex: number;
  phase: number;
}

interface DataStreamsProps {
  colorRef: ColorRef;
  speedRef: NumberRef;
  intensity: number;
  reducedMotion: boolean;
}

const PACKET_GEOMETRY = new THREE.SphereGeometry(PACKET_RADIUS, 8, 8);

/**
 * The five agent-to-agent connections. Rail lines are static, faint
 * infrastructure (fixed color, never re-tinted). Packet spheres carry the
 * live state color and read as "data currently in flight."
 */
export function DataStreams({ colorRef, speedRef, intensity, reducedMotion }: DataStreamsProps) {
  const railMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#2a7fff",
        transparent: true,
        opacity: 0.45 * intensity,
      }),
    [intensity]
  );

  const packetMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: PALETTE.blueLight,
        transparent: true,
        opacity: 0.85 * intensity,
        toneMapped: false,
      }),
    [intensity]
  );

  const rigs = useMemo(
    () => AGENT_CONNECTIONS.map(([a, b]) => buildStreamRig(a, b, railMaterial)),
    [railMaterial]
  );

  const packetSlots = useMemo<PacketSlot[]>(
    () =>
      rigs.flatMap((_, rigIndex) =>
        Array.from({ length: PACKETS_PER_STREAM }, (_, i) => ({
          rigIndex,
          phase: i / PACKETS_PER_STREAM,
        }))
      ),
    [rigs]
  );

  const packetRefs = useRef<(THREE.Mesh | null)[]>([]);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!reducedMotion) elapsed.current += delta * speedRef.current * PACKET_SPEED;
    packetMaterial.color.copy(colorRef.current);

    packetSlots.forEach((slot, i) => {
      const mesh = packetRefs.current[i];
      if (!mesh) return;
      const t = (elapsed.current + slot.phase) % 1;
      rigs[slot.rigIndex].curve.getPointAt(t, mesh.position);
    });
  });

  return (
    <group>
      {rigs.map((rig, i) => (
        <primitive key={`rail-${i}`} object={rig.railLine} />
      ))}
      {packetSlots.map((_slot, i) => (
        <mesh
          key={`packet-${i}`}
          geometry={PACKET_GEOMETRY}
          material={packetMaterial}
          ref={(el) => {
            packetRefs.current[i] = el;
          }}
        />
      ))}
    </group>
  );
}
