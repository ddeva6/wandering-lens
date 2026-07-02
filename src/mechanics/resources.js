/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { save, load } from '../utils/localStorage.js';
import { eventBus } from '../utils/eventBus.js';

export const DEFAULT_RESOURCES = { fuel: 100, battery: 100, water: 100, film: 36 };

const FUEL_PER_METRE = 0.5 / 100; // -0.5 fuel per 100 m driven
const WATER_PER_SECOND = 1 / 60; // -1 water per real minute
const PERSIST_INTERVAL = 1; // dashboard re-reads localStorage every second

// Battery costs land in Phase 5 with the photo system:
// -10 per standard shot, -30 per legendary. Film is also managed there.

export function createResources() {
  const resources = { ...DEFAULT_RESOURCES, ...load('resources', {}) };
  save('resources', resources);
  let persistTimer = 0;

  function update(delta, metresDriven = 0) {
    resources.fuel = Math.max(0, resources.fuel - metresDriven * FUEL_PER_METRE);
    resources.water = Math.max(0, resources.water - delta * WATER_PER_SECOND);

    persistTimer += delta;
    if (persistTimer >= PERSIST_INTERVAL) {
      persistTimer = 0;
      save('resources', resources);
      eventBus.emit('resources:changed', { ...resources });
    }
  }

  return {
    update,
    get: () => resources,
  };
}
