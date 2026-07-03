/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';

const CRITICAL_WATER = 20;
const SWAY_INTERVAL_MS = 500;

let vignette = null;
let swayTimer = null;

function ensureVignette() {
  if (vignette) return vignette;
  vignette = document.createElement('div');
  vignette.className = 'dehydration-vignette';
  document.body.appendChild(vignette);
  return vignette;
}

function removeVignette() {
  if (!vignette) return;
  vignette.remove();
  vignette = null;
}

function startSway() {
  if (swayTimer) return;
  swayTimer = setInterval(() => {
    const resources = JSON.parse(window.localStorage.getItem('wl_resources') || '{}');
    const water = resources.water ?? 100;
    if (water >= CRITICAL_WATER) return;
    eventBus.emit('camera:sway', { intensity: (CRITICAL_WATER - water) / CRITICAL_WATER });
  }, SWAY_INTERVAL_MS);
}

function stopSway() {
  clearInterval(swayTimer);
  swayTimer = null;
}

function applyEffects(water) {
  const canvas = document.getElementById('game-canvas');
  if (water < CRITICAL_WATER) {
    const el = ensureVignette();
    const opacity = (CRITICAL_WATER - water) / CRITICAL_WATER;
    el.style.opacity = String(Math.min(1, Math.max(0, opacity)));
    if (canvas) canvas.style.filter = `saturate(${(water / CRITICAL_WATER) * 100}%)`;
    startSway();
  } else {
    removeVignette();
    if (canvas) canvas.style.filter = '';
    stopSway();
  }
}

export function init() {
  eventBus.on('resource:update', ({ water }) => applyEffects(water));
}
