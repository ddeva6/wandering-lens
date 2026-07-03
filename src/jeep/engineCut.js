/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';

// Stealth: with the engine off, animals within this range do not react to
// the jeep. Consumed by the animal AI in Phase 4.
export const STEALTH_RADIUS = 80;

const DOUBLE_TAP_MS = 300;

let isEngineOn = true;
let lastTapTime = 0;

export function getEngineState() {
  return isEngineOn;
}

function toggleEngine() {
  isEngineOn = !isEngineOn;
  eventBus.emit('jeep:engineChanged', isEngineOn);
  if (import.meta.env.DEV) console.log(`[JEEP] engine ${isEngineOn ? 'on' : 'off'}`);
}

export function initEngineCut() {
  window.addEventListener('keydown', (event) => {
    if (event.code !== 'Space' || event.repeat) return;
    event.preventDefault();
    toggleEngine();
  });

  // Double-tap toggles on mobile. Taps on the joystick zone are ignored so
  // rapid steering corrections don't kill the engine.
  window.addEventListener('touchend', (event) => {
    if (event.target.closest?.('.joystick-zone')) return;
    const now = performance.now();
    if (now - lastTapTime < DOUBLE_TAP_MS) {
      lastTapTime = 0;
      toggleEngine();
    } else {
      lastTapTime = now;
    }
  });
}
