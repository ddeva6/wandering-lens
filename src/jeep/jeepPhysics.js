/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { getEngineState } from './engineCut.js';
import { eventBus } from '../utils/eventBus.js';

// Arcade driving — no physics engine. speed is in km/h.
const ACCELERATION = 15;
const MAX_SPEED = 80;
const MAX_REVERSE_SPEED = 20;
const FRICTION = 0.92; // per-frame damping, normalised to 60 fps
const TURN_SPEED = 0.03; // radians per frame at 60 fps
const KMH_TO_MS = 1 / 3.6;

let speed = 0;
const velocity = { x: 0, z: 0 };
let distanceDrivenThisFrame = 0;
let hasMovedBefore = false;
let jeepRef = null;

// Registered once by main.js at startup so scripted sequences (e.g. the
// bury/return endings' jeep cutscenes) can reach the jeep mesh without
// main.js having to pass it through every module individually.
export function setJeepRef(jeep) {
  jeepRef = jeep;
}

export function getJeepRef() {
  return jeepRef;
}

export function getSpeed() {
  return speed;
}

// World-space velocity in m/s, used by animal AI (e.g. cheetah race trigger)
// to compare travel direction against the jeep-to-animal vector.
export function getVelocity() {
  return velocity;
}

// Metres driven on the most recent applyDriving() call, read by
// resourceManager for fuel depletion. Frames where the jeep isn't driven
// (e.g. on-foot mode) must call resetDistanceDrivenThisFrame() so this
// doesn't stay stuck at a stale non-zero value.
export function getDistanceDrivenThisFrame() {
  return distanceDrivenThisFrame;
}

export function resetDistanceDrivenThisFrame() {
  distanceDrivenThisFrame = 0;
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
  if (!hasMovedBefore && speed !== 0) {
    hasMovedBefore = true;
    eventBus.emit('jeep:firstMove');
  }

  // Only turn while rolling; flip steering when reversing.
  const turnFactor = Math.min(Math.abs(speed) / 10, 1) * Math.sign(speed);
  if (keys.left) jeep.rotation.y += TURN_SPEED * frames * turnFactor;
  if (keys.right) jeep.rotation.y -= TURN_SPEED * frames * turnFactor;

  const metres = speed * KMH_TO_MS * delta;
  velocity.x = -Math.sin(jeep.rotation.y) * speed * KMH_TO_MS;
  velocity.z = -Math.cos(jeep.rotation.y) * speed * KMH_TO_MS;
  jeep.position.x += velocity.x * delta;
  jeep.position.z += velocity.z * delta;

  eventBus.emit('jeep:positionUpdate', { position: jeep.position });

  distanceDrivenThisFrame = Math.abs(metres);
  return distanceDrivenThisFrame;
}
