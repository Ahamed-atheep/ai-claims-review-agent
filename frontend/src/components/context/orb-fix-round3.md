# Orb fix — round 3: frosted glass, not gemstone

## What's happening
Facets and per-node color are both working now — good. But the shell itself is rendering fully saturated (especially the cyan node), so it reads as a solid colored crystal rather than a pale, frosted shell with a glowing core visible inside it.

## Likely cause
`AgentNode` is probably feeding `coreColor` into the shell's `color` prop as well (directly or via a shared variable), instead of keeping the shell a fixed near-white tone and letting only the core carry the per-agent hue.

## Fix

```tsx
import { Edges, MeshTransmissionMaterial } from '@react-three/drei'

// Shell — same pale tone on every node. Identity comes from coreColor, not this.
<mesh ref={shellRef}>
  <icosahedronGeometry args={[0.62, 1]} />
  <MeshTransmissionMaterial
    flatShading
    color="#F1F5FF"          // near-white — do NOT bind this to coreColor
    thickness={0.35}
    roughness={0.28}         // was 0.15 — more frost, less "cut gem" clarity
    transmission={0.92}      // was 1 — a touch less glass-clear
    distortion={0.15}
    distortionScale={0.3}
    temporalDistortion={0.1}
    ior={1.25}
    chromaticAberration={0.015}
    backside
    samples={6}
    resolution={256}
  />
  {/* crisp facet edges — this is what gives the reference render its
      defined crystalline look rather than a smooth gem */}
  <Edges scale={1.001} threshold={15} color="#ffffff" />
</mesh>
```

Two independent levers here, worth checking separately:
1. **Un-bind shell color from `coreColor`** — this alone should fix most of the "gemstone" feel.
2. **`roughness`/`transmission`/`distortion`** — pushes it from crisp-cut-diamond toward soft frosted glass. Tune to taste; higher `roughness` and lower `transmission` = frostier, less see-through.

The `<Edges>` addition is optional but cheap, and it's what gives the reference image its defined facet lines instead of relying on shading alone to read as low-poly.
