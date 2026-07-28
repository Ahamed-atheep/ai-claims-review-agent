import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Sparkles, Edges } from "@react-three/drei";
import type { ColorRef, NumberRef } from "./types";

export interface AgentNodeConfig {
  id: string;
  label: string;
  position: [number, number, number];
  scale: number;
  /** Per-node time offset so all five nodes don't bob/shimmer in lockstep. */
  phase: number;
  /** Distinct color for this specialized agent */
  color: string;
}

/**
 * Five nodes for the five specialized agents named in the product copy
 * (fraud, medical records, document integrity, risk, compliance). Positions
 * form a loose left-of-center cluster so the busiest geometry reads as
 * texture behind the hero headline while staying well clear of the claim
 * form on the right.
 */
export const AGENT_NODES: AgentNodeConfig[] = [
  { id: "fraud",     label: "Fraud Detection",    position: [-3.8, 0.05,  1.2],  scale: 0.80, phase: 0.2, color: "#5B8DEF" }, // Blue
  { id: "medical",   label: "Medical Records",    position: [-2.5, 0.42, -1.0],  scale: 0.85, phase: 1.8, color: "#7C6CF0" }, // Violet
  { id: "integrity",label: "Document Integrity",  position: [-0.8, 0.70,  0.5],  scale: 1.10, phase: 3.1, color: "#4FC3F7" }, // Cyan
  { id: "risk",      label: "Risk Assessment",     position: [ 0.6, 0.20, -0.8],  scale: 0.80, phase: 4.4, color: "#5B8DEF" }, // Blue
  { id: "compliance",label: "Compliance",          position: [ 2.0, 0.48,  1.2],  scale: 0.88, phase: 5.6, color: "#8B7CF6" }, // Purple
];

/** Which nodes are visually wired together by DataStreams. "integrity" acts as the hub. */
export const AGENT_CONNECTIONS: [string, string][] = [
  ["integrity", "fraud"],
  ["integrity", "medical"],
  ["integrity", "risk"],
  ["integrity", "compliance"],
  ["fraud", "medical"],
];

export function getNodePosition(id: string): THREE.Vector3 {
  const node = AGENT_NODES.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown agent node id: "${id}"`);
  return new THREE.Vector3(...node.position);
}

const CORE_GEOMETRY = new THREE.IcosahedronGeometry(0.34, 1);
const SHELL_GEOMETRY = new THREE.IcosahedronGeometry(0.62, 1);
const PEDESTAL_GEOMETRY = new THREE.CylinderGeometry(0.22, 0.28, 0.14, 6);

interface AgentNodeProps {
  config: AgentNodeConfig;
  colorRef: ColorRef;
  glowRef: ColorRef;
  speedRef: NumberRef;
  pulseRef: NumberRef;
  reducedMotion: boolean;
  tier?: 'high' | 'medium' | 'low'; // Accepting all PerformanceTier values
}

function AgentNode({ config, colorRef, glowRef, speedRef, pulseRef, reducedMotion, tier = 'high' }: AgentNodeProps) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const elapsed = useRef(config.phase);

  const coreMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: new THREE.Color(config.color),
        emissiveIntensity: 1.6,
        roughness: 0.1,
        metalness: 0.1, // lowered to prevent mirror chrome effect
        toneMapped: false,
      }),
    [config.color]
  );

  const shellMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d8e8f8",
        emissive: new THREE.Color("#90c0ff"),
        emissiveIntensity: 0.15,
        roughness: 0.12,
        metalness: 0.25,
        transmission: 0.15,
        thickness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.88,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!reducedMotion) elapsed.current += delta * speedRef.current;
    const t = elapsed.current;

    if (shell.current) {
      shell.current.rotation.y += delta * 0.15 * speedRef.current;
      shell.current.rotation.x += delta * 0.05 * speedRef.current;
    }
    if (core.current) {
      const pulse = pulseRef.current;
      const baseScale = 0.85 + Math.sin(t * 1.6 + config.phase) * 0.15;
      core.current.scale.setScalar(baseScale + pulse * 0.35);
    }

    coreMaterial.emissiveIntensity = 1.3 + pulseRef.current * 2.2 + Math.sin(t * 1.8) * 0.4;
    // Removed shellMaterial.emissive override so it stays pale and frosted
  });

  return (
    <group position={config.position} scale={config.scale}>
      <mesh geometry={PEDESTAL_GEOMETRY} position={[0, -0.42, 0]}>
        <meshPhysicalMaterial color="#b0ccee" roughness={0.3} metalness={0.4} clearcoat={0.8} clearcoatRoughness={0.1} />
      </mesh>
      
      <Float speed={1.2 * speedRef.current} rotationIntensity={0.4} floatIntensity={0.8} floatingRange={[-0.05, 0.05]}>
        <group ref={group}>
          <mesh ref={core} geometry={CORE_GEOMETRY} material={coreMaterial} />
          
          <pointLight color={config.color} intensity={2.2} distance={3} decay={2} />

          <mesh ref={shell} geometry={SHELL_GEOMETRY}>
            {tier === 'high' ? (
              <MeshTransmissionMaterial
                flatShading
                color="#F1F5FF"
                thickness={0.35}
                roughness={0.28}
                transmission={0.92}
                distortion={0.15}
                distortionScale={0.3}
                temporalDistortion={0.1}
                ior={1.25}
                chromaticAberration={0.015}
                backside
                samples={6}
                resolution={256}
              />
            ) : (
              <meshPhysicalMaterial
                color="#F1F5FF"
                roughness={0.35}
                metalness={0.0}
                transparent
                opacity={0.65}
                clearcoat={1}
              />
            )}
            <Edges scale={1.001} threshold={15} color="#ffffff" />
          </mesh>

          {tier === 'high' && (
            <Sparkles count={12} scale={1.4} size={2} speed={0.3} color={config.color} opacity={0.6} />
          )}
        </group>
      </Float>
    </group>
  );
}

interface AgentNodeFieldProps {
  colorRef: ColorRef;
  glowRef: ColorRef;
  speedRef: NumberRef;
  pulseRef: NumberRef;
  reducedMotion: boolean;
  tier?: 'high' | 'medium' | 'low';
}

/** Renders all five agent nodes, sharing the same state-driven refs. */
export function AgentNodeField({ colorRef, glowRef, speedRef, pulseRef, reducedMotion, tier = 'high' }: AgentNodeFieldProps) {
  return (
    <group>
      {AGENT_NODES.map((node) => (
        <AgentNode
          key={node.id}
          config={node}
          colorRef={colorRef}
          glowRef={glowRef}
          speedRef={speedRef}
          pulseRef={pulseRef}
          reducedMotion={reducedMotion}
          tier={tier}
        />
      ))}
    </group>
  );
}
