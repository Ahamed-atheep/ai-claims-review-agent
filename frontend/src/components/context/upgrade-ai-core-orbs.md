# Task: Upgrade the AI Core Orb visuals (hero background)

## Context

The hero background currently renders faceted icosahedron "AI core" objects (see circled element in the attached screenshot). They read as flat, generic low-poly spheres. Upgrade them to look like premium holographic hardware — frosted glass facets with a glowing, pulsing core visible through the gaps, soft bloom, and a subtle organic float. Reference look: crystalline geodesic shell + colored inner light + bloom halo, similar to the attached concept render.

Stack already in the project (use these, don't add new deps): `three`, `@react-three/fiber` (v8), `@react-three/drei` (v9), `@react-three/postprocessing`, `postprocessing`.

## What to do

1. Add two new files:
   - `src/components/three/AICoreOrb.tsx`
   - `src/components/three/AICoreField.tsx`
2. Find the existing component that renders the current icosahedron/sphere background objects (likely something like `Hero3D.tsx`, `AIOrb.tsx`, `HeroBackground.tsx`, or inline in the hero section). Replace its mesh/geometry with `<AICoreField />`, or swap just the individual mesh for `<AICoreOrb />` if it's already wrapped in your own `<Canvas>`.
3. Remove any now-duplicate rotation/float logic on the old mesh so it isn't animated twice.
4. If a `<Canvas>` and `<EffectComposer><Bloom /></EffectComposer>` already exist elsewhere in the tree, don't nest a second `EffectComposer` — merge the `Bloom` props shown below into the existing one instead of using `AICoreField`'s built-in `<Canvas>`.

## `src/components/three/AICoreOrb.tsx`

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

export interface AICoreOrbProps {
  position?: [number, number, number]
  scale?: number
  coreColor?: string
  shellColor?: string
  speed?: number
  detail?: number
  quality?: 'high' | 'low'
}

/**
 * A single "AI core" — a frosted, faceted shell with a pulsing glow
 * visible through the gaps. Drop several into a scene with varied
 * color/position/speed for a field of orbs.
 */
export function AICoreOrb({
  position = [0, 0, 0],
  scale = 1,
  coreColor = '#5B8DEF',
  shellColor = '#EAF1FF',
  speed = 1,
  detail = 1,
  quality = 'high',
}: AICoreOrbProps) {
  const coreRef = useRef<THREE.Mesh>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const pulseOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * speed

    if (shellRef.current) {
      shellRef.current.rotation.y += delta * 0.15 * speed
      shellRef.current.rotation.x += delta * 0.05 * speed
    }

    if (coreRef.current) {
      const pulse = 0.85 + Math.sin(t * 1.6 + pulseOffset) * 0.15
      coreRef.current.scale.setScalar(pulse)
      const mat = coreRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.3 + Math.sin(t * 1.6 + pulseOffset) * 0.6
    }
  })

  return (
    <Float speed={1.2 * speed} rotationIntensity={0.4} floatIntensity={0.8}>
      <group position={position} scale={scale}>
        {/* Glowing core — this is what the Bloom pass picks up */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.34, 1]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={1.3}
            toneMapped={false}
          />
        </mesh>

        {/* Lets the core bleed real light onto the shell + nearby objects */}
        <pointLight color={coreColor} intensity={2.2} distance={3} decay={2} />

        {/* Faceted frosted-glass shell */}
        <mesh ref={shellRef}>
          <icosahedronGeometry args={[0.62, detail]} />
          {quality === 'high' ? (
            <MeshTransmissionMaterial
              color={shellColor}
              thickness={0.4}
              roughness={0.15}
              transmission={1}
              ior={1.3}
              chromaticAberration={0.02}
              backside
              samples={6}
              resolution={256}
            />
          ) : (
            // Cheaper fallback for mobile/low-power devices — see perf notes below
            <meshPhysicalMaterial
              color={shellColor}
              roughness={0.2}
              metalness={0.1}
              transparent
              opacity={0.55}
              clearcoat={1}
            />
          )}
        </mesh>

        {quality === 'high' && (
          <Sparkles count={12} scale={1.4} size={2} speed={0.3} color={coreColor} opacity={0.6} />
        )}
      </group>
    </Float>
  )
}
```

## `src/components/three/AICoreField.tsx`

```tsx
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { AICoreOrb } from './AICoreOrb'

// One orb per specialized agent (fraud, medical records, document
// integrity, risk factors, compliance) — ties the visual back to the
// "five specialized AI agents" copy instead of being decorative filler.
const AGENTS: {
  color: string
  pos: [number, number, number]
  scale: number
}[] = [
  { color: '#5B8DEF', pos: [-3.5, 1.2, -2], scale: 1 },     // fraud
  { color: '#7C6CF0', pos: [-1.5, -0.8, -1], scale: 0.7 },  // medical records
  { color: '#4FC3F7', pos: [1.2, 1.6, -3], scale: 1.2 },    // document integrity
  { color: '#5B8DEF', pos: [3, -0.4, -1.5], scale: 0.85 },  // risk factors
  { color: '#8B7CF6', pos: [0, -2, -2.5], scale: 0.6 },     // compliance
]

interface AICoreFieldProps {
  quality?: 'high' | 'low'
}

export function AICoreField({ quality = 'high' }: AICoreFieldProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />

      {/* Transmission material looks much better with something to refract —
          skip this if the surrounding page already provides an Environment */}
      {quality === 'high' && <Environment preset="city" />}

      {AGENTS.map((agent, i) => (
        <AICoreOrb
          key={i}
          position={agent.pos}
          scale={agent.scale}
          coreColor={agent.color}
          speed={0.8 + Math.random() * 0.4}
          quality={quality}
        />
      ))}

      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}
```

## Performance notes

- `MeshTransmissionMaterial` is the most expensive part of this (it renders a back-buffer pass per sample). With 5 orbs at `samples={6}`/`resolution={256}` it should hold 60fps on a mid-range laptop GPU, but test on the actual target devices.
- Pass `quality="low"` on mobile / `prefers-reduced-motion` / low `navigator.hardwareConcurrency`. The low path drops to a plain `meshPhysicalMaterial`, skips `Sparkles`, and skips `Environment` — visually close, much cheaper.
- If frame rate is still tight, the next lever is `resolution` (try 128) before touching `samples`.

## Optional next step (only if you want to go further toward the reference image)

The reference render also has thin glowing lines connecting the orbs with small cubes/documents traveling along them, plus a wireframe grid floor. That's a separate, bigger addition (a `DataStream` component using `<Line>` from drei with an animated dash-offset, plus small instanced meshes moving along a `CatmullRomCurve3`). Worth a follow-up task rather than bolting it onto this one — the orb upgrade above is a complete, self-contained change on its own.
