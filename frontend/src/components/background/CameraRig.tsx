import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { PointerRef } from "./types";

const BASE_POSITION = new THREE.Vector3(-2.2, 3.5, 10.0);

// Look target drifts with the mouse for a parallax depth effect
const BASE_LOOK = new THREE.Vector3(1.0, -0.8, -1.5);

const PARALLAX_XY = 1.4;   // camera position parallax (stronger)
const PARALLAX_Z  = 0.4;   // subtle in/out breathing with mouse Y
const LOOK_PARALLAX = 0.6; // look-target also shifts slightly with mouse

const EASE_POS  = 0.04;    // camera position easing (smooth lag)
const EASE_LOOK = 0.055;   // look target easing (slightly snappier)

// Gentle autonomous camera breathing (no mouse required)
const BREATHE_AMP_Y  = 0.12; // vertical bob amplitude
const BREATHE_AMP_X  = 0.08; // lateral drift amplitude
const BREATHE_SPEED  = 0.28; // cycles per second

interface CameraRigProps {
  pointerRef: PointerRef;
  interactive: boolean;
}

/**
 * Enhanced camera rig:
 *  - Pointer parallax shifts camera position AND look-at simultaneously,
 *    giving a convincing parallax-depth illusion.
 *  - Autonomous breathing animation keeps the scene alive even without mouse.
 *  - All motion is eased so it never feels mechanical.
 */
export function CameraRig({ pointerRef, interactive }: CameraRigProps) {
  const { camera } = useThree();
  const currentPos  = useRef(BASE_POSITION.clone());
  const targetPos   = useRef(BASE_POSITION.clone());
  const currentLook = useRef(BASE_LOOK.clone());
  const targetLook  = useRef(BASE_LOOK.clone());
  const elapsed     = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;

    // Autonomous breathing so the scene never feels frozen
    const breatheX = Math.sin(t * BREATHE_SPEED)              * BREATHE_AMP_X;
    const breatheY = Math.sin(t * BREATHE_SPEED * 0.7 + 1.0)  * BREATHE_AMP_Y;

    const px = pointerRef.current.x;
    const py = pointerRef.current.y;

    if (interactive) {
      // Camera position: parallax + breathe
      targetPos.current.set(
        BASE_POSITION.x + px * PARALLAX_XY + breatheX,
        BASE_POSITION.y + py * PARALLAX_XY * 0.55 + breatheY,
        BASE_POSITION.z - py * PARALLAX_Z   // slight zoom with vertical mouse
      );
      // Look target also shifts opposite to mouse for depth parallax
      targetLook.current.set(
        BASE_LOOK.x - px * LOOK_PARALLAX * 0.5,
        BASE_LOOK.y + py * LOOK_PARALLAX * 0.3,
        BASE_LOOK.z
      );
    } else {
      // No mouse: just breathe
      targetPos.current.set(
        BASE_POSITION.x + breatheX,
        BASE_POSITION.y + breatheY,
        BASE_POSITION.z
      );
      targetLook.current.copy(BASE_LOOK);
    }

    currentPos.current.lerp(targetPos.current, EASE_POS);
    currentLook.current.lerp(targetLook.current, EASE_LOOK);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
  });

  return null;
}
