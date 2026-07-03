/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { BoxGeometry, MeshStandardMaterial, Mesh, Color } from 'three';
import { eventBus } from '../utils/eventBus.js';
import { save, load } from '../utils/localStorage.js';
import { distance2D } from '../utils/mathUtils.js';
import { getAnimalManager } from '../animals/AnimalManager.js';
import { resourceManager } from './survival/resourceManager.js';

const COLLECT_RANGE = 8;
const EXAMINE_HOLD_MS = 3000;

export const DROPS = [
  { id: 1, position: { x: 120, z: 80 }, day: 1, items: { fuel: 20 } },
  { id: 2, position: { x: -90, z: 150 }, day: 2, items: { water: 30 } },
  { id: 3, position: { x: 200, z: -60 }, day: 3, items: { fuel: 15, battery: 20 } },
  { id: 4, position: { x: -180, z: 220 }, day: 4, items: { water: 25, fuel: 10 } },
  { id: 5, position: { x: 50, z: -200 }, day: 5, items: { battery: 30 } },
  { id: 6, position: { x: -120, z: -150 }, day: 6, items: { fuel: 25, water: 20 } },
];

const RESOURCE_LABELS = { fuel: 'Fuel', water: 'Water', battery: 'Battery' };

const EVIDENCE_REACTIONS = [
  'That\'s... strange. Why would supplies need a tracking device?',
  "Another one. This isn't coincidence.",
  "He knows exactly where I've been. Every stop. Every zone I photographed.",
  'All of it. Every kindness. Mapped.',
  'I need to talk to Amara.',
];

let playerPosition = { x: 0, y: 0, z: 0 };
eventBus.on('jeep:positionUpdate', ({ position }) => {
  playerPosition = position;
});

const spawned = new Map();
let prompt = null;
let holdTimer = null;
let heldPastThreshold = false;
let activeDrop = null;

function ensurePrompt() {
  if (prompt) return prompt;
  prompt = document.createElement('p');
  prompt.className = 'isaac-gift-prompt';
  prompt.textContent = 'Isaac left supplies. Press E to collect.';
  document.body.appendChild(prompt);
  return prompt;
}

function showMessage(text, durationMs = 4000) {
  const el = document.createElement('p');
  el.className = 'victor-subtitle victor-subtitle--visible isaac-gift-message';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.remove('victor-subtitle--visible');
    setTimeout(() => el.remove(), 500);
  }, durationMs);
}

function spawnDrop(drop) {
  const scene = getAnimalManager()?.scene;
  if (!scene || spawned.has(drop.id)) return;

  const mesh = new Mesh(
    new BoxGeometry(0.6, 0.4, 0.8),
    new MeshStandardMaterial({
      color: 0x5a6b3a,
      emissive: new Color(0x3a4a22),
      emissiveIntensity: 0.6,
      roughness: 0.7,
    })
  );
  mesh.position.set(drop.position.x, 0.2, drop.position.z);
  scene.add(mesh);
  spawned.set(drop.id, { drop, mesh, collected: false });
}

function applyItems(items) {
  Object.entries(items).forEach(([resource, amount]) => {
    if (resource === 'fuel') resourceManager.refuel(amount);
    else if (resource === 'water') resourceManager.refillWater(amount);
    else resourceManager.adjust(resource, amount);
  });
  const label = Object.keys(items).map((r) => RESOURCE_LABELS[r] ?? r).join(' and ');
  showMessage(`${label} replenished. Thanks to Isaac.`);
}

function revealTracker(drop) {
  const overlay = document.createElement('div');
  overlay.className = 'isaac-tracker-overlay';
  overlay.innerHTML = `
    <div class="isaac-tracker-disc"></div>
    <p class="isaac-tracker-label">Tracking device — manufactured 1991</p>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 3500);

  const evidence = load('evidence', []);
  if (!evidence.includes(drop.id)) evidence.push(drop.id);
  save('evidence', evidence);

  const reaction = EVIDENCE_REACTIONS[evidence.length - 1];
  if (reaction) showMessage(reaction, 4500);
  if (evidence.length >= 6) eventBus.emit('story:allTrackersFound');
}

function collect(entry) {
  entry.collected = true;
  applyItems(entry.drop.items);
}

function removeCrate(entry) {
  const scene = getAnimalManager()?.scene;
  scene?.remove(entry.mesh);
  entry.mesh.geometry.dispose();
  entry.mesh.material.dispose();
  spawned.delete(entry.drop.id);
}

function findNearbyDrop() {
  for (const entry of spawned.values()) {
    if (!entry.collected && distance2D(playerPosition, entry.drop.position) <= COLLECT_RANGE) {
      return entry;
    }
  }
  return null;
}

function onKeyDown(event) {
  if (event.code !== 'KeyE' || event.repeat) return;
  activeDrop = findNearbyDrop();
  if (!activeDrop) return;
  heldPastThreshold = false;
  holdTimer = setTimeout(() => {
    heldPastThreshold = true;
  }, EXAMINE_HOLD_MS);
}

function onKeyUp(event) {
  if (event.code !== 'KeyE' || !activeDrop) return;
  clearTimeout(holdTimer);
  const entry = activeDrop;
  activeDrop = null;

  collect(entry);
  if (heldPastThreshold) revealTracker(entry.drop);
  removeCrate(entry);
}

function spawnDropsForCurrentDay() {
  const day = load('radio_day', 1);
  DROPS.filter((d) => d.day === day).forEach(spawnDrop);
}

// Called by IsaacCharacter.js's first scripted appearance to make sure
// drop 1 is on the ground the moment he "leaves it behind", even if the
// day/newDay check hasn't spawned it yet for some reason.
export function spawnDropById(id) {
  const drop = DROPS.find((d) => d.id === id);
  if (drop) spawnDrop(drop);
}

export function init() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // world:newDay only fires on later midnight crossings, so day 1's drop
  // needs its own check right at startup.
  spawnDropsForCurrentDay();
  eventBus.on('world:newDay', spawnDropsForCurrentDay);

  eventBus.on('resource:update', () => {
    const nearby = findNearbyDrop();
    if (nearby) ensurePrompt().classList.add('isaac-gift-prompt--visible');
    else prompt?.classList.remove('isaac-gift-prompt--visible');
  });
}

export function updateCrates(frustum) {
  for (const entry of spawned.values()) {
    if (!entry.collected && entry.mesh) {
      entry.mesh.visible = frustum.containsPoint(entry.mesh.position);
    }
  }
}
