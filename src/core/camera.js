/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { PerspectiveCamera, Frustum, Matrix4 } from 'three';
import { eventBus } from '../utils/eventBus.js';
import { isOnFoot, getPlayerPosition, EYE_LEVEL } from '../jeep/onFootMode.js';

const CHASE_DISTANCE = 12;
const CHASE_HEIGHT = 5;

export const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FOV = 60;
const NEAR = 0.1;
const FAR = 5000;

// Dehydration sway refreshes every 500ms while active; if no refresh
// arrives within this window the effect is treated as stopped, so no
// explicit "sway off" event is required.
const SWAY_EXPIRY_MS = 700;

let swayIntensity = 0;
let swayExpiresAt = 0;
let shakeIntensity = 0;
let shakeUntil = 0;
let shakeDuration = 1;

eventBus.on('camera:sway', ({ intensity }) => {
  swayIntensity = intensity;
  swayExpiresAt = Date.now() + SWAY_EXPIRY_MS;
});

eventBus.on('camera:shake', ({ intensity, duration }) => {
  shakeIntensity = intensity;
  shakeDuration = Math.max(duration, 0.001);
  shakeUntil = Date.now() + duration * 1000;
});

// comebackManager's post-flood "you can see everything" beat: a brief full
// camera hijack rather than an additive offset, so it's handled separately
// from sway/shake via getCinematicOverride().
const CINEMATIC_DURATION_MS = 4000;
const CINEMATIC_POSITION = { x: 0, y: 320, z: -100 };
const CINEMATIC_LOOKAT = { x: 0, y: 0, z: -250 };
let cinematicUntil = 0;

eventBus.on('world:plateauView', () => {
  cinematicUntil = Date.now() + CINEMATIC_DURATION_MS;
  cinematicShot = { position: CINEMATIC_POSITION, lookAt: CINEMATIC_LOOKAT };
});

// Generic version of the same hijack, used by ending cutscenes to hold on
// an arbitrary point (e.g. the returnEnding's "camera stays on the group
// as the jeep drives away") instead of the hardcoded plateau shot.
let cinematicShot = { position: CINEMATIC_POSITION, lookAt: CINEMATIC_LOOKAT };

export function holdCameraOn(position, lookAt, durationMs) {
  cinematicUntil = Date.now() + durationMs;
  cinematicShot = { position, lookAt };
}

export function getCinematicOverride() {
  if (Date.now() >= cinematicUntil) return null;
  return cinematicShot;
}

export let camera = null;

export function createCamera() {
  camera = new PerspectiveCamera(
    FOV,
    window.innerWidth / window.innerHeight,
    NEAR,
    FAR
  );
  camera.position.set(0, 2, 5);
  return camera;
}

export function resizeCamera(camera) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// Applies dehydration sway and crisis shake as temporary position offsets.
// Call this after the caller has already set camera.position/lookAt for
// the frame — these are perturbations on top of that base position.
export function applyCameraEffects(camera) {
  if (prefersReducedMotion) return;
  const now = Date.now();

  if (now < swayExpiresAt) {
    camera.position.x += Math.sin(now * 0.001) * swayIntensity * 0.3;
    camera.position.y += Math.sin(now * 0.0013) * swayIntensity * 0.15;
  }

  if (now < shakeUntil) {
    const remaining = (shakeUntil - now) / 1000;
    const decay = remaining / shakeDuration;
    camera.position.x += (Math.random() - 0.5) * 2 * shakeIntensity * decay;
    camera.position.y += (Math.random() - 0.5) * 2 * shakeIntensity * decay;
  }
}

export const frustum = new Frustum();
const frustumMatrix = new Matrix4();

export function updateFrustum(cameraInstance) {
  if (!cameraInstance) return;
  frustumMatrix.multiplyMatrices(
    cameraInstance.projectionMatrix,
    cameraInstance.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(frustumMatrix);
}

// Third-person chase cam while driving, first-person eyes while on foot,
// or a full hijack while a cinematic override is active.
export function updateChaseCamera(cameraInstance, jeep, look) {
  const cinematic = getCinematicOverride();
  if (cinematic) {
    cameraInstance.position.set(cinematic.position.x, cinematic.position.y, cinematic.position.z);
    cameraInstance.lookAt(cinematic.lookAt.x, cinematic.lookAt.y, cinematic.lookAt.z);
    return;
  }
  if (isOnFoot()) {
    const player = getPlayerPosition();
    const eyeY = player.y + EYE_LEVEL;
    cameraInstance.position.set(player.x, eyeY, player.z);
    cameraInstance.lookAt(
      player.x - Math.sin(look.yaw) * Math.cos(look.pitch),
      eyeY - Math.sin(look.pitch),
      player.z - Math.cos(look.yaw) * Math.cos(look.pitch)
    );
    applyCameraEffects(cameraInstance);
    return;
  }
  const yaw = jeep.rotation.y + look.yaw;
  const target = jeep.position;
  cameraInstance.position.set(
    target.x + Math.sin(yaw) * CHASE_DISTANCE,
    target.y + CHASE_HEIGHT + look.pitch * 8,
    target.z + Math.cos(yaw) * CHASE_DISTANCE
  );
  cameraInstance.lookAt(target.x, target.y + 1.5, target.z);
  applyCameraEffects(cameraInstance);
}
