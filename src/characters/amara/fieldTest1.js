/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Group, BoxGeometry, CircleGeometry, MeshStandardMaterial, Mesh } from 'three';
import { eventBus } from '../../utils/eventBus.js';
import { distance2D, randomInRadius } from '../../utils/mathUtils.js';
import { getEngineState } from '../../jeep/engineCut.js';
import {
  isOnFoot,
  isForcedWalkMode,
  setForcedWalkMode,
  getPlayerPosition,
} from '../../jeep/onFootMode.js';

const LEOPARD_MIN_DIST = 150;
const LEOPARD_MAX_DIST = 250;
const FOOTPRINT_COUNT = 8;
const FOOTPRINT_SPACING = 20;
const FLEE_DISTANCE = 15;
const SUCCESS_DISTANCE = 60;
const SUCCESS_HOLD_S = 30;
const CLEANUP_DELAY_MS = 10000;
const TICK_MS = 200;

let active = false;
let leopard = null;
let footprints = [];
let holdTimer = 0;
let tickInterval = null;
let jeepRef = null;

function onKeyF(event) {
  if (event.code !== 'KeyF' || !active) return;
  if (!isForcedWalkMode() && jeepRef) {
    // Stepping out — start walking from beside the parked jeep.
    const player = getPlayerPosition();
    player.set(jeepRef.position.x + 2.5, 0, jeepRef.position.z);
  }
  setForcedWalkMode(!isForcedWalkMode());
}

function spawnLeopard(scene, amaraPosition) {
  const spot = randomInRadius(
    amaraPosition.x,
    amaraPosition.z,
    LEOPARD_MAX_DIST
  );
  const dist = distance2D(spot, amaraPosition);
  const scale = dist < LEOPARD_MIN_DIST ? LEOPARD_MIN_DIST / Math.max(dist, 1) : 1;
  const position = {
    x: amaraPosition.x + (spot.x - amaraPosition.x) * scale,
    z: amaraPosition.z + (spot.z - amaraPosition.z) * scale,
  };

  const mesh = new Mesh(
    new BoxGeometry(1.5, 0.8, 2.8),
    new MeshStandardMaterial({ color: 0xc8a45a, roughness: 0.8 })
  );
  mesh.position.set(position.x, 0.4, position.z);
  scene.add(mesh);
  return mesh;
}

function spawnFootprints(scene, from, to) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz) || 1;
  const material = new MeshStandardMaterial({ color: 0x2a1f14, roughness: 1 });
  const trail = [];
  for (let i = 1; i <= FOOTPRINT_COUNT; i += 1) {
    const t = (i * FOOTPRINT_SPACING) / length;
    const mesh = new Mesh(new CircleGeometry(0.3, 6).rotateX(-Math.PI / 2), material);
    mesh.position.set(from.x + dx * t, 0.02, from.z + dz * t);
    scene.add(mesh);
    trail.push(mesh);
  }
  return trail;
}

function cleanup(scene) {
  if (leopard) {
    scene.remove(leopard);
    leopard.geometry.dispose();
    leopard.material.dispose();
    leopard = null;
  }
  footprints.forEach((f) => {
    scene.remove(f);
    f.geometry.dispose();
  });
  footprints = [];
}

function showMessage(text) {
  const el = document.createElement('p');
  el.className = 'victor-subtitle victor-subtitle--visible';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.remove('victor-subtitle--visible');
    setTimeout(() => el.remove(), 500);
  }, 4000);
}

export function start(character, onSuccess, onFail) {
  const scene = character.scene;
  if (!scene || active) return;
  active = true;
  holdTimer = 0;
  jeepRef = character.jeep;

  leopard = spawnLeopard(scene, character.mesh.position);
  footprints = spawnFootprints(scene, character.mesh.position, leopard.position);
  window.addEventListener('keydown', onKeyF);

  tickInterval = setInterval(() => {
    const player = getPlayerPosition();
    const dist = distance2D(player, leopard.position);
    const inStealth = !getEngineState() && isOnFoot();

    if (dist < FLEE_DISTANCE) {
      finish(false, onFail);
      return;
    }

    if (dist <= SUCCESS_DISTANCE && inStealth) {
      holdTimer += TICK_MS / 1000;
      if (holdTimer >= SUCCESS_HOLD_S) finish(true, onSuccess);
    } else {
      holdTimer = 0;
    }
  }, TICK_MS);

  function finish(success, callback) {
    clearInterval(tickInterval);
    window.removeEventListener('keydown', onKeyF);
    setForcedWalkMode(false);
    active = false;

    if (success) {
      setTimeout(() => cleanup(scene), CLEANUP_DELAY_MS);
      callback();
    } else {
      showMessage('The leopard is gone. Try again tomorrow.');
      cleanup(scene);
      eventBus.emit('amara:fieldTest1Failed');
      callback();
    }
  }
}

export function isActive() {
  return active;
}
