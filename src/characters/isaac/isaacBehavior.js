/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Group, BoxGeometry, CylinderGeometry, MeshStandardMaterial, Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { showDialogueSequence } from '../dialogueSubtitle.js';

const DRIVE_SPEED_MPS = 8;
const STEP_OUT_DURATION_S = 1.5;

export function buildIsaacGroup(scene) {
  const group = new Group();
  const placeholder = new Mesh(
    new BoxGeometry(2, 1.5, 4.5),
    new MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.4, metalness: 0.1 })
  );
  placeholder.position.y = 0.75;
  group.add(placeholder);

  const person = new Mesh(
    new CylinderGeometry(0.3, 0.35, 1.6, 8),
    new MeshStandardMaterial({ color: 0x2a2a2a })
  );
  person.position.set(0, 0.8, 0);
  person.visible = false;
  group.add(person);

  group.visible = false;
  scene.add(group);

  new GLTFLoader().load(
    `${import.meta.env.BASE_URL}models/isaacJeep.glb`,
    (gltf) => {
      group.remove(placeholder);
      placeholder.geometry.dispose();
      placeholder.material.dispose();
      group.add(gltf.scene);
    },
    undefined,
    () => console.warn('[ASSET MISSING] isaacJeep.glb — using placeholder')
  );

  return { group, person };
}

// Drives the jeep in a straight line toward `target`; resolves once within
// arriveDistance. speedMultiplier lets the final "no urgency" departure
// move noticeably slower than every other drive-in/out.
export function driveToward(state, target, delta, arriveDistance = 1, speedMultiplier = 1) {
  const { group } = state;
  const dx = target.x - group.position.x;
  const dz = target.z - group.position.z;
  const dist = Math.hypot(dx, dz);
  if (dist <= arriveDistance) return true;

  const step = Math.min(dist, DRIVE_SPEED_MPS * speedMultiplier * delta);
  group.position.x += (dx / dist) * step;
  group.position.z += (dz / dist) * step;
  group.rotation.y = Math.atan2(dx, dz);
  return false;
}

export function stepOut(state, delta) {
  state.stepOutTimer = (state.stepOutTimer ?? 0) + delta;
  state.person.visible = true;
  const t = Math.min(1, state.stepOutTimer / STEP_OUT_DURATION_S);
  state.person.position.x = 1.5 * t;
  return t >= 1;
}

export function playDialogue(key, dialogueTable, onDone) {
  const lines = dialogueTable[key];
  const totalDelay = showDialogueSequence(lines, 'Isaac');
  setTimeout(onDone, totalDelay + 500);
}
