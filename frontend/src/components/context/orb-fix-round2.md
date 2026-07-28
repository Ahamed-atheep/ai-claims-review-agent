# Orb fix — round 2: bring back the facets & glow

## What's off right now
- Nodes render as perfectly smooth spheres — no visible polygon facets
- No inner glow / bloom halo around any core
- Little color differentiation between the five nodes
- One node (bottom-left) reads as a mirror-chrome ball rather than frosted glass

## Most likely cause
`implementation_plan.md` describes swapping the **material** on the existing `AgentNode` mesh, but doesn't mention swapping the **geometry**. If the mesh is still something like `<sphereGeometry args={[r, 32, 32]} />`, `MeshTransmissionMaterial` will render it perfectly round regardless of the material — you need a low-poly `icosahedronGeometry` *and* `flatShading` for the crystalline look.

Separately: the glow relies on a **separate, un-tonemapped emissive mesh**, not just a `pointLight`. A point light illuminating a diffuse surface won't cross the Bloom `luminanceThreshold` — scene lighting and rendered-pixel brightness aren't the same thing. If the existing core mesh doesn't carry `emissive` + `emissiveIntensity` + `toneMapped={false}`, Bloom has nothing bright enough to grab, hence the flat, halo-less result.

## Fixes for the agent to apply in `AgentNode.tsx`

### 1. Facets — geometry + flatShading
```tsx
<mesh ref={shellRef}>
  <icosahedronGeometry args={[0.62, 1]} />
  <MeshTransmissionMaterial
    flatShading
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
</mesh>
```
`flatShading` is the piece missing from the original spec — without it, even a low-poly icosahedron gets smooth-shaded normals and reads as a round ball.

### 2. Glow — a real emissive core, not just a light
```tsx
<mesh ref={coreRef}>
  <icosahedronGeometry args={[0.34, 1]} />
  <meshStandardMaterial
    color={coreColor}
    emissive={coreColor}
    emissiveIntensity={1.6}
    toneMapped={false}   // critical — lets brightness exceed 1.0 so Bloom can pick it up
  />
</mesh>
<pointLight color={coreColor} intensity={2.2} distance={3} decay={2} />
```
Check whether the existing core mesh wired to `colorRef` sets `emissive`/`toneMapped={false}`, or only `color`. If `colorRef` only drives `color`, that mesh will never bloom no matter what the light does.

### 3. Confirm Bloom is actually reading the emissive layer (`PostFX.tsx`)
- If ambient/environment lighting is bright, `luminanceThreshold={0.2}` may be catching the whole scene instead of just the cores — try 0.4–0.6 so only the emissive meshes cross it.
- Confirm `mipmapBlur` is on.
- Confirm there's only **one** `<EffectComposer>` in the tree — a second one mounted elsewhere will silently fight this one.

### 4. The chrome/mirror node
That flat mirror finish is characteristic of low `roughness` + high `metalness` combined with `Environment preset="city"` reflecting hard into it. If that's an intentional "idle" state color, fine — but if not, check what `colorRef` resolves to for that node's current state; it may be defaulting to a neutral/grey value that, combined with the new environment map, reads as chrome instead of tinted glass. Try clamping `metalness` low (≤0.1) regardless of state, and let `colorRef` drive only `color`/`emissive`, never roughness/metalness.

### 5. Color differentiation
Confirm each node actually receives a distinct `coreColor` — in the screenshot all five read as the same washed-out blue/grey rather than the blue/violet/cyan spread from the original spec. Log `coreColor` per node on mount to confirm the palette is wired through rather than falling back to one default.

---

If this doesn't fully resolve it, paste me the current `AgentNode.tsx` and `PostFX.tsx` — this diagnosis is from your plan/walkthrough notes and the screenshot, not the actual diff, so there may be a specific prop value I'm not accounting for.
