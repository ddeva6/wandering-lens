/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl } from 'howler';
import { PlaneGeometry, MeshStandardMaterial, Mesh } from 'three';
import { eventBus } from '../../utils/eventBus.js';
import { save, load } from '../../utils/localStorage.js';
import { getAnimalManager } from '../../animals/AnimalManager.js';
import { resourceManager } from '../survival/resourceManager.js';

const STORM_TRIGGER_CHANCE = 0.3;
const DELAY_MIN_S = 60;
const DELAY_MAX_S = 90;
const RISE_DURATION_S = 90;
const RISE_RATE = 0.08; // m/s, over 90s reaches y = -2 + 0.08*90 = 5.2
const RECEDE_RATE = 0.04;
const START_Y = -2;
const SURVIVE_Y = 40;
const PLATEAU_POSITION = { x: 0, y: 45, z: -300 };
const TICK_MS = 200;

let playerPosition = { x: 0, y: 0, z: 0 };
eventBus.on('jeep:positionUpdate', ({ position }) => {
  playerPosition = position;
});

function showSubtitle(text) {
  const el = document.createElement('p');
  el.className = 'flood-subtitle';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5500);
}

function playVictorClip() {
  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/victor/plateau.mp3`],
    onloaderror: () => console.warn('[ASSET MISSING] audio/victor/plateau.mp3'),
  });
  sound.play();
  showSubtitle(
    'From the plateau, you can see everything. This is where he used to watch the migration.'
  );
}

function createUrgencyBar() {
  const bar = document.createElement('div');
  bar.className = 'flood-urgency-bar';
  bar.innerHTML = `
    <p class="flood-urgency-text">REACH HIGH GROUND</p>
    <div class="flood-urgency-track"><div class="flood-urgency-fill"></div></div>
  `;
  document.body.appendChild(bar);
  const fill = bar.querySelector('.flood-urgency-fill');
  requestAnimationFrame(() => {
    fill.style.transitionDuration = `${RISE_DURATION_S}s`;
    fill.style.transform = 'scaleX(0)';
  });
  return bar;
}

function triggerFlood() {
  const scene = getAnimalManager()?.scene;
  if (!scene) return;

  eventBus.emit('crisis:floodStart');
  eventBus.emit('ui:compassShow', { target: PLATEAU_POSITION });

  const geometry = new PlaneGeometry(2000, 2000);
  geometry.rotateX(-Math.PI / 2);
  const material = new MeshStandardMaterial({
    color: 0x1a4a6b,
    opacity: 0.85,
    transparent: true,
  });
  const water = new Mesh(geometry, material);
  water.position.y = START_Y;
  scene.add(water);

  const urgencyBar = createUrgencyBar();
  let elapsed = 0;
  let resolved = false;

  const riseInterval = setInterval(() => {
    const dt = TICK_MS / 1000;
    elapsed += dt;
    water.position.y = Math.min(START_Y + RISE_RATE * elapsed, START_Y + RISE_RATE * RISE_DURATION_S);

    if (!resolved && playerPosition.y > SURVIVE_Y) {
      resolved = true;
      clearInterval(riseInterval);
      succeed(water, urgencyBar, geometry, material, scene);
    } else if (!resolved && elapsed >= RISE_DURATION_S) {
      resolved = true;
      clearInterval(riseInterval);
      fail(water, urgencyBar, geometry, material, scene);
    }
  }, TICK_MS);
}

function recede(water, geometry, material, scene, onDone) {
  const recedeInterval = setInterval(() => {
    water.position.y -= RECEDE_RATE * (TICK_MS / 1000);
    if (water.position.y <= START_Y) {
      clearInterval(recedeInterval);
      scene.remove(water);
      geometry.dispose();
      material.dispose();
      onDone();
    }
  }, TICK_MS);
}

function succeed(water, urgencyBar, geometry, material, scene) {
  urgencyBar.remove();
  eventBus.emit('crisis:survived', { type: 'flashFlood' });
  const comeback = load('comeback', {});
  comeback.flood = true;
  save('comeback', comeback);

  recede(water, geometry, material, scene, () => {
    eventBus.emit('world:floodReceded');
    playVictorClip();
  });
}

function fail(water, urgencyBar, geometry, material, scene) {
  urgencyBar.remove();
  eventBus.emit('mission:fail', { reason: 'flashFlood' });
  resourceManager.adjust('fuel', -40);
  resourceManager.adjust('water', -30);

  setTimeout(() => {
    recede(water, geometry, material, scene, () => {});
  }, 30000);
}

export function init() {
  eventBus.on('weather:changed', (state) => {
    if (state !== 'storm') return;
    if (Math.random() >= STORM_TRIGGER_CHANCE) return;
    const delay = (DELAY_MIN_S + Math.random() * (DELAY_MAX_S - DELAY_MIN_S)) * 1000;
    setTimeout(triggerFlood, delay);
  });
}
