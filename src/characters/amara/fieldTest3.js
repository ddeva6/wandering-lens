/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import {
  CircleGeometry,
  MeshStandardMaterial,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
} from 'three';
import { distance2D, randomInRadius } from '../../utils/mathUtils.js';
import { getAnimalManager } from '../../animals/AnimalManager.js';

const HIDDEN_WATERHOLE = { x: 180, z: 350 };
const SPOOK_DISTANCE = 25;
const ARRIVAL_DISTANCE = 20;
const RETRY_COOLDOWN_MS = 5 * 60 * 1000;
const BUTTERFLY_COUNT = 40;
const TICK_MS = 200;

let active = false;
let tickInterval = null;
let cooldownUntil = 0;

function showMessage(text) {
  const el = document.createElement('p');
  el.className = 'victor-subtitle victor-subtitle--visible';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.remove('victor-subtitle--visible');
    setTimeout(() => el.remove(), 500);
  }, 4500);
}

function spawnButterflies(scene) {
  const positions = new Float32Array(BUTTERFLY_COUNT * 3);
  for (let i = 0; i < BUTTERFLY_COUNT; i += 1) {
    const spot = randomInRadius(HIDDEN_WATERHOLE.x, HIDDEN_WATERHOLE.z, 12);
    positions[i * 3] = spot.x;
    positions[i * 3 + 1] = Math.random() * 2;
    positions[i * 3 + 2] = spot.z;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  const material = new PointsMaterial({ color: 0xffffff, size: 3, transparent: true, opacity: 0.8 });
  const points = new Points(geometry, material);
  scene.add(points);

  const interval = setInterval(() => {
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < BUTTERFLY_COUNT; i += 1) {
      pos[i * 3 + 1] += 0.02;
      pos[i * 3] += (Math.random() - 0.5) * 0.05;
    }
    geometry.attributes.position.needsUpdate = true;
  }, TICK_MS);

  return () => clearInterval(interval);
}

function revealHiddenWaterhole(scene) {
  const geometry = new CircleGeometry(10, 32).rotateX(-Math.PI / 2);
  const material = new MeshStandardMaterial({ color: 0x1a6b8a, roughness: 0.1, metalness: 0.3 });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(HIDDEN_WATERHOLE.x, 0.05, HIDDEN_WATERHOLE.z);
  scene.add(mesh);
  spawnButterflies(scene);
}

function scatterHerd(elephantHerd) {
  elephantHerd.members.forEach((member) => {
    const scatterPoint = randomInRadius(member.mesh.position.x, member.mesh.position.z, 80);
    member.walkTo(scatterPoint);
  });
}

export function start(character, onSuccess, onFail) {
  if (active || Date.now() < cooldownUntil) return;
  const animalManager = getAnimalManager();
  const scene = character.scene;
  if (!animalManager || !scene) return;
  active = true;

  const mainWaterholeMesh = animalManager.waterhole?.mesh;
  if (mainWaterholeMesh) mainWaterholeMesh.visible = false;

  const { elephantHerd } = animalManager;
  elephantHerd.members.forEach((member) => member.walkTo(HIDDEN_WATERHOLE));

  tickInterval = setInterval(() => {
    const playerPos = character.playerPosition;
    const nearestMemberDist = Math.min(
      ...elephantHerd.members.map((m) => distance2D(playerPos, m.mesh.position))
    );
    const arrivalDist = distance2D(playerPos, HIDDEN_WATERHOLE);

    if (nearestMemberDist < SPOOK_DISTANCE) {
      finish(false);
      return;
    }
    if (arrivalDist <= ARRIVAL_DISTANCE) {
      finish(true);
    }
  }, TICK_MS);

  function finish(success) {
    clearInterval(tickInterval);
    active = false;
    if (mainWaterholeMesh) mainWaterholeMesh.visible = true;

    if (success) {
      revealHiddenWaterhole(scene);
      onSuccess();
    } else {
      scatterHerd(elephantHerd);
      showMessage("They knew you were following. Give them space. Try again when they've settled.");
      cooldownUntil = Date.now() + RETRY_COOLDOWN_MS;
      onFail();
    }
  }
}

export function isActive() {
  return active;
}
