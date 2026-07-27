# Interactive3DBackground — ClaimGuard AI

A production-ready, state-reactive 3D background layer for the claims-review
dashboard, built with React Three Fiber. Verified with `tsc --strict`, a real
Vite production build, and an SSR render smoke test across all five
`BackgroundState` values — see the chat response for the full writeup
(design rationale, integration steps, performance/accessibility notes).

## Install

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing
```

## Use

```tsx
import { Interactive3DBackground } from "@/components/background";

<div className="relative min-h-screen overflow-hidden">
  <Interactive3DBackground state={agentStatus} intensity={0.8} interactive />
  <main className="relative z-10">{/* existing UI */}</main>
</div>
```

## Files

| File | Responsibility |
|---|---|
| `Interactive3DBackground.tsx` | Public entry: Canvas setup, WebGL gate, error boundary |
| `Scene.tsx` | Composes lighting, fog, camera rig, and all scene elements |
| `CameraRig.tsx` | Pointer-based camera parallax |
| `AgentNode.tsx` | The 5 faceted "agent" nodes + shared network layout |
| `DataStream.tsx` | Rail lines + animated data-packet spheres between nodes |
| `FloatingDocuments.tsx` | Instanced drifting claim-document icons |
| `ParticleField.tsx` | Instanced ambient particles w/ pointer-proximity glow |
| `GridLattice.tsx` | Wireframe floor + cube-frame backdrop |
| `PostFX.tsx` | Bloom + vignette, gated off on low-tier devices |
| `WebglFallback.tsx` / `background.css` | CSS-only fallback when WebGL is unavailable |
| `hooks.ts` | Reduced motion, WebGL detection, perf tier, pointer ref, state animator |
| `stateConfig.ts` | Palette + per-state visual targets + quality tiers |
| `types.ts` | Shared TypeScript types |
| `index.ts` | Barrel export |
