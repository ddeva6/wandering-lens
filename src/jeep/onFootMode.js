/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Vector3 } from 'three';
import { eventBus } from '../utils/eventBus.js';

export const WALK_SPEED_KMH = 5;
export const EYE_LEVEL = 1.7;

const WALK_SPEED_MS = WALK_SPEED_KMH / 3.6;

let onFoot = false;
const playerPosition = new Vector3();

export function isOnFoot() {
  return onFoot;
}

export function getPlayerPosition() {
  return playerPosition;
}

// Checks fuel every frame; activates on-foot mode at zero. Lion encounter
// risk doubles while on foot — Phase 6's lionCharge module reads this from
// the survival:onFoot payload.
export function updateOnFootMode(resources, jeep) {
  if (!onFoot && resources.fuel <= 0) {
    onFoot = true;
    playerPosition.copy(jeep.position).add(new Vector3(2.5, 0, 0));
    playerPosition.y = 0;
    eventBus.emit('survival:onFoot', { active: true, lionRiskMultiplier: 2 });
    if (import.meta.env.DEV) console.log('[SURVIVAL] fuel empty — on-foot mode active');
  } else if (onFoot && resources.fuel > 0) {
    onFoot = false;
    eventBus.emit('survival:onFoot', { active: false, lionRiskMultiplier: 1 });
  }
}

// First-person walking, heading taken from the camera yaw.
export function updateWalk(delta, keys, yaw) {
  const forward = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0);
  const strafe = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  if (!forward && !strafe) return;

  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  const step = WALK_SPEED_MS * delta;
  playerPosition.x += (-sin * forward + cos * strafe) * step;
  playerPosition.z += (-cos * forward - sin * strafe) * step;
}
