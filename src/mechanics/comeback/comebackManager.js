/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import {
  Group,
  BoxGeometry,
  CylinderGeometry,
  CircleGeometry,
  MeshStandardMaterial,
  Mesh,
} from 'three';
import { eventBus } from '../../utils/eventBus.js';
import { save, load } from '../../utils/localStorage.js';
import { getAnimalManager } from '../../animals/AnimalManager.js';
import { distance2D, moveToward } from '../../utils/mathUtils.js';
import { getPlayerPosition, isOnFoot } from '../../jeep/onFootMode.js';

const VICTOR_CAMP_POSITION = { x: 80, z: 180 };
const FOSSIL_TREE_POSITION = { x: 0, y: 42, z: -300 };
const VICTOR_CAMP_DELAY_MS = 10000;
const FOSSIL_TREE_DELAY_MS = 15000;
const CUB_BOND_DELAY_MS = 20000;
const CUB_FOLLOW_KMH = 4;
const CUB_LEASH_DISTANCE = 8;
const CUB_DURATION_S = 1200;
const INTERACT_RANGE = { camp: 5, tree: 3 };

let playerPosition = { x: 0, y: 0, z: 0 };
eventBus.on('jeep:positionUpdate', ({ position }) => {
  playerPosition = position;
});

// Both discoveries are one-time narrative beats — guard against a second
// wildfire/flood in the same session re-spawning duplicate geometry and
// interact listeners.
let victorCampSpawned = false;
let fossilTreeSpawned = false;

function spawnVictorCamp(scene) {
  if (victorCampSpawned) return;
  victorCampSpawned = true;
  const group = new Group();
  group.position.set(VICTOR_CAMP_POSITION.x, 0, VICTOR_CAMP_POSITION.z);

  const box = new Mesh(
    new BoxGeometry(0.4, 0.3, 0.3),
    new MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.9, metalness: 0.4 })
  );
  box.position.set(0.5, 0.15, 0);

  const tentMaterial = new MeshStandardMaterial({ color: 0x7a6a52, roughness: 1 });
  const frameA = new Mesh(new CylinderGeometry(0.02, 0.02, 1.6, 6), tentMaterial);
  frameA.rotation.z = Math.PI / 3;
  frameA.position.set(-0.3, 0.3, 0);
  const frameB = frameA.clone();
  frameB.rotation.z = -Math.PI / 3;
  frameB.position.set(-0.9, 0.3, 0);

  const ash = new Mesh(
    new CircleGeometry(0.8, 16).rotateX(-Math.PI / 2),
    new MeshStandardMaterial({ color: 0x2a2a2a, roughness: 1 })
  );
  ash.position.set(0, 0.01, -0.8);

  group.add(box, frameA, frameB, ash);
  scene.add(group);
  eventBus.emit('world:victorCampDiscovered');

  window.addEventListener('keydown', function onInteract(event) {
    if (event.code !== 'KeyE') return;
    if (distance2D(getPlayerPosition(), group.position) > INTERACT_RANGE.camp) return;
    eventBus.emit('story:victorCampOpened');
  });
}

function spawnFossilTree(scene) {
  if (fossilTreeSpawned) return;
  fossilTreeSpawned = true;
  const group = new Group();
  group.position.set(FOSSIL_TREE_POSITION.x, FOSSIL_TREE_POSITION.y, FOSSIL_TREE_POSITION.z);

  const material = new MeshStandardMaterial({ color: 0x3a3a3a, roughness: 1 });
  const trunk = new Mesh(new CylinderGeometry(0.8, 1.2, 4, 8), material);
  trunk.position.y = 2;

  const branchA = new Mesh(new BoxGeometry(0.3, 1.4, 0.3), material);
  branchA.position.set(0.8, 3.6, 0);
  branchA.rotation.z = Math.PI / 5;
  const branchB = new Mesh(new BoxGeometry(0.25, 1.1, 0.25), material);
  branchB.position.set(-0.6, 3.3, 0.3);
  branchB.rotation.z = -Math.PI / 4;

  group.add(trunk, branchA, branchB);
  scene.add(group);

  window.addEventListener('keydown', function onInteract(event) {
    if (event.code !== 'KeyE') return;
    if (distance2D(getPlayerPosition(), group.position) > INTERACT_RANGE.tree) return;
    eventBus.emit('story:fossilTreeRead');
  });
}

function spawnOrphanCub(scene, lionPridePosition) {
  const cub = new Mesh(
    new BoxGeometry(0.8, 0.6, 1.2),
    new MeshStandardMaterial({ color: 0xd9a441, roughness: 0.8 })
  );
  const start = isOnFoot() ? getPlayerPosition() : playerPosition;
  cub.position.set(start.x + 1.5, 0, start.z);
  scene.add(cub);

  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 0.5;
    const player = isOnFoot() ? getPlayerPosition() : playerPosition;
    if (elapsed < CUB_DURATION_S) {
      if (distance2D(cub.position, player) > CUB_LEASH_DISTANCE) {
        moveToward(cub, player, CUB_FOLLOW_KMH, 0.5, CUB_LEASH_DISTANCE * 0.5);
      }
    } else {
      const arrived = moveToward(cub, lionPridePosition, CUB_FOLLOW_KMH, 0.5, 2);
      if (arrived) {
        clearInterval(interval);
        scene.remove(cub);
        cub.geometry.dispose();
        cub.material.dispose();
        eventBus.emit('event:cubLeft');
      }
    }
  }, 500);
}

function trackSurvivalCount() {
  const comeback = load('comeback', {});
  comeback.survivalCount = (comeback.survivalCount ?? 0) + 1;
  save('comeback', comeback);
  if (comeback.survivalCount % 3 === 0) {
    eventBus.emit('story:grandfatherNote', { noteId: 'persistence' });
  }
}

export function init() {
  eventBus.on('world:wildfireReceded', () => {
    setTimeout(() => {
      const scene = getAnimalManager()?.scene;
      if (scene) spawnVictorCamp(scene);
    }, VICTOR_CAMP_DELAY_MS);
  });

  eventBus.on('world:floodReceded', () => {
    setTimeout(() => {
      const scene = getAnimalManager()?.scene;
      if (scene) spawnFossilTree(scene);
    }, FOSSIL_TREE_DELAY_MS);
  });

  eventBus.on('crisis:survived', (payload) => {
    trackSurvivalCount();

    if (payload.type === 'lionCharge') {
      const alreadyTriggered = load('comeback', {}).lionSurvived === true;
      if (!alreadyTriggered) {
        setTimeout(() => {
          const am = getAnimalManager();
          if (am?.scene) spawnOrphanCub(am.scene, am.lionPride.position);
        }, CUB_BOND_DELAY_MS);
      }
    }

    if (payload.type === 'flashFlood') {
      eventBus.emit('world:plateauView');
    }
  });
}
