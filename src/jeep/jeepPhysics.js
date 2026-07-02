/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { getEngineState } from './engineCut.js';

// Arcade driving — no physics engine. speed is in km/h.
const ACCELERATION = 15;
const MAX_SPEED = 80;
const MAX_REVERSE_SPEED = 20;
const FRICTION = 0.92; // per-frame damping, normalised to 60 fps
const TURN_SPEED = 0.03; // radians per frame at 60 fps
const KMH_TO_MS = 1 / 3.6;

let speed = 0;
const velocity = { x: 0, z: 0 };

export function getSpeed() {
  return speed;
}

// Advances the jeep one frame. Returns metres driven this frame so the
// caller can deplete fuel.
export function applyDriving(delta, keys, jeep) {
  const frames = delta * 60;

  const throttle = getEngineState()
    ? (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0)
    : 0;
  if (throttle !== 0) {
    speed += throttle * ACCELERATION * delta;
  } else {
    // Coasting or engine off: friction decelerates the jeep to a stop.
    speed *= Math.pow(FRICTION, frames);
  }
  speed = Math.min(MAX_SPEED, Math.max(-MAX_REVERSE_SPEED, speed));
  if (Math.abs(speed) < 0.05) speed = 0;

  // Only turn while rolling; flip steering when reversing.
  const turnFactor = Math.min(Math.abs(speed) / 10, 1) * Math.sign(speed);
  if (keys.left) jeep.rotation.y += TURN_SPEED * frames * turnFactor;
  if (keys.right) jeep.rotation.y -= TURN_SPEED * frames * turnFactor;

  const metres = speed * KMH_TO_MS * delta;
  velocity.x = -Math.sin(jeep.rotation.y) * speed * KMH_TO_MS;
  velocity.z = -Math.cos(jeep.rotation.y) * speed * KMH_TO_MS;
  jeep.position.x += velocity.x * delta;
  jeep.position.z += velocity.z * delta;

  return Math.abs(metres);
}
