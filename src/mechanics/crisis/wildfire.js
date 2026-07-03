/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import {
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  CircleGeometry,
  MeshStandardMaterial,
  Mesh,
  Color,
} from 'three';
import { eventBus } from '../../utils/eventBus.js';
import { save, load } from '../../utils/localStorage.js';
import { getAnimalManager } from '../../animals/AnimalManager.js';
import { getGameHour } from '../../world/dayNight.js';
import { resourceManager } from '../survival/resourceManager.js';
import { isMobile } from '../../core/renderer.js';
import { prefersReducedMotion } from '../../core/camera.js';

const DAILY_CHANCE = 0.15;
const TRIGGER_HOUR = 13;
const PARTICLE_COUNT = isMobile ? 400 : 800;
const SPAWN_X_RANGE = [-100, 100];
const SPAWN_Z = 200;
const PARTICLE_LIFETIME_S = 4;
// scene.fog is THREE.Fog (linear near/far, set up in world/weather.js) —
// not FogExp2, so "visibility ~15m" is expressed as a near/far pair rather
// than a density value.
const FOG_FIRE_NEAR = 0.5;
const FOG_FIRE_FAR = 15;
const FOG_CLEAR_FAR = 1800;
const RIVER_X = 500;
const RIVER_MARKER = { x: 600, y: 0, z: 0 };
const IN_GAME_MINUTE_S = (4 * 60) / 24; // 4 real minutes per in-game day
const SURVIVE_WINDOW_S = 4 * IN_GAME_MINUTE_S;
const FOG_RESTORE_S = 30;
const BURN_RADIUS = 200;
const TICK_MS = 200;

let playerPosition = { x: 0, y: 0, z: 0 };
eventBus.on('jeep:positionUpdate', ({ position }) => {
  playerPosition = position;
});

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createParticles(scene) {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const ages = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    positions[i * 3] = SPAWN_X_RANGE[0] + Math.random() * (SPAWN_X_RANGE[1] - SPAWN_X_RANGE[0]);
    positions[i * 3 + 1] = Math.random() * 4;
    positions[i * 3 + 2] = SPAWN_Z + (Math.random() - 0.5) * 10;
    ages[i] = Math.random() * PARTICLE_LIFETIME_S;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  const material = new PointsMaterial({
    color: 0x2a2a2a,
    size: 8 + Math.random() * 7,
    opacity: 0.6,
    transparent: true,
    sizeAttenuation: true,
  });
  const points = new Points(geometry, material);
  scene.add(points);
  return { points, geometry, material, ages };
}

function updateParticles(particles, dt) {
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    particles.ages[i] += dt;
    positions[i * 3 + 1] += dt * 3; // rise upward
    positions[i * 3] += (Math.random() - 0.5) * dt * 2; // drift
    if (particles.ages[i] >= PARTICLE_LIFETIME_S) {
      particles.ages[i] = 0;
      positions[i * 3] = SPAWN_X_RANGE[0] + Math.random() * (SPAWN_X_RANGE[1] - SPAWN_X_RANGE[0]);
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = SPAWN_Z + (Math.random() - 0.5) * 10;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;
}

function burnTerrainPatch(scene) {
  const geometry = new CircleGeometry(BURN_RADIUS, 32);
  geometry.rotateX(-Math.PI / 2);
  const material = new MeshStandardMaterial({
    color: new Color(0x3a2a1a),
    roughness: 1,
    transparent: true,
    opacity: 0.55,
  });
  const patch = new Mesh(geometry, material);
  patch.position.set(0, 0.06, SPAWN_Z);
  scene.add(patch);
}

let smokeOverlay = null;

function showStaticSmokeOverlay() {
  smokeOverlay = document.createElement('div');
  smokeOverlay.className = 'smoke-overlay';
  smokeOverlay.style.position = 'fixed';
  smokeOverlay.style.top = '0';
  smokeOverlay.style.left = '0';
  smokeOverlay.style.width = '100vw';
  smokeOverlay.style.height = '100vh';
  smokeOverlay.style.backgroundColor = 'rgba(42, 42, 42, 0.75)';
  smokeOverlay.style.zIndex = '999';
  smokeOverlay.style.pointerEvents = 'none';
  document.body.appendChild(smokeOverlay);
}

function removeStaticSmokeOverlay() {
  if (smokeOverlay) {
    smokeOverlay.remove();
    smokeOverlay = null;
  }
}

function showSubtitle() {
  const el = document.createElement('p');
  el.className = 'fire-subtitle';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('role', 'status');
  el.textContent = 'Navigate by compass only. The river breaks the fire.';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5500);
}

function triggerWildfire() {
  const scene = getAnimalManager()?.scene;
  if (!scene) return;

  eventBus.emit('crisis:wildfireStart');
  const particles = prefersReducedMotion ? null : createParticles(scene);
  if (prefersReducedMotion) {
    showStaticSmokeOverlay();
  }
  scene.fog.wildfireOverride = true;
  scene.fog.near = FOG_FIRE_NEAR;
  scene.fog.far = FOG_FIRE_FAR;
  eventBus.emit('ui:hideMarkers');
  eventBus.emit('ui:compassShow', { target: RIVER_MARKER });
  showSubtitle();

  let elapsed = 0;
  let resolved = false;

  const interval = setInterval(() => {
    const dt = TICK_MS / 1000;
    elapsed += dt;
    if (particles) {
      updateParticles(particles, dt);
    }

    if (!resolved && playerPosition.x > RIVER_X) {
      resolved = true;
      clearInterval(interval);
      succeed(scene, particles);
    } else if (!resolved && elapsed >= SURVIVE_WINDOW_S) {
      resolved = true;
      clearInterval(interval);
      fail(scene, particles);
    }
  }, TICK_MS);
}

function stopParticles(scene, particles) {
  if (prefersReducedMotion) {
    removeStaticSmokeOverlay();
  } else if (particles) {
    scene.remove(particles.points);
    particles.geometry.dispose();
    particles.material.dispose();
  }
}

function restoreFog(scene) {
  const startFar = scene.fog.far;
  const startTime = Date.now();
  const restoreInterval = setInterval(() => {
    const t = Math.min(1, (Date.now() - startTime) / (FOG_RESTORE_S * 1000));
    scene.fog.far = startFar + (FOG_CLEAR_FAR - startFar) * t;
    if (t >= 1) {
      clearInterval(restoreInterval);
      scene.fog.wildfireOverride = false;
    }
  }, TICK_MS);
}

function succeed(scene, particles) {
  eventBus.emit('crisis:survived', { type: 'wildfire' });
  const comeback = load('comeback', {});
  comeback.wildfire = true;
  save('comeback', comeback);

  restoreFog(scene);
  stopParticles(scene, particles);
  burnTerrainPatch(scene);
  eventBus.emit('world:wildfireReceded');
}

function fail(scene, particles) {
  eventBus.emit('mission:fail', { reason: 'wildfire' });
  restoreFog(scene);
  stopParticles(scene, particles);
  resourceManager.adjust('fuel', -30);
  resourceManager.adjust('water', -25);
  resourceManager.adjust('battery', -20);
}

export function init() {
  let lastCheckedDay = null;
  eventBus.on('resource:update', () => {
    const day = todayKey();
    if (Math.floor(getGameHour()) !== TRIGGER_HOUR) return;
    if (lastCheckedDay === day || load('wildfire_triggered', null) === day) return;
    lastCheckedDay = day;
    save('wildfire_triggered', day);
    if (Math.random() < DAILY_CHANCE) triggerWildfire();
  });
}
