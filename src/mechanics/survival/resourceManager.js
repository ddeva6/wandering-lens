/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { save, load } from '../../utils/localStorage.js';
import { eventBus } from '../../utils/eventBus.js';
import { getEngineState } from '../../jeep/engineCut.js';

export const DEFAULT_RESOURCES = { fuel: 100, battery: 100, water: 100, film: 36 };

const FUEL_PER_METRE = 0.5 / 100;
const WATER_PER_SECOND = 1 / 60;
const PERSIST_INTERVAL = 5;

const THRESHOLDS = [
  { resource: 'fuel', value: 25, event: 'resource:low' },
  { resource: 'fuel', value: 0, event: 'resource:empty' },
  { resource: 'water', value: 20, event: 'resource:low' },
  { resource: 'water', value: 0, event: 'resource:empty' },
  { resource: 'battery', value: 15, event: 'resource:low' },
  { resource: 'film', value: 6, event: 'resource:low' },
];

function clamp(value) {
  return Math.min(100, Math.max(0, value));
}

// Single source of truth for wl_resources — every other module reads and
// writes resources through this singleton (battery/film mutations still
// live in the photo system, which shares this same object via init()).
class ResourceManager {
  constructor() {
    this.resources = { ...DEFAULT_RESOURCES };
    this.persistTimer = 0;
    this.crossedThresholds = new Set();
  }

  init() {
    this.resources = { ...DEFAULT_RESOURCES, ...load('resources', {}) };
    save('resources', this.resources);
    return this.resources;
  }

  get() {
    return this.resources;
  }

  checkThresholds() {
    THRESHOLDS.forEach(({ resource, value, event }) => {
      const key = `${resource}:${value}`;
      const below = this.resources[resource] <= value;
      if (below && !this.crossedThresholds.has(key)) {
        this.crossedThresholds.add(key);
        eventBus.emit(event, { type: resource });
      } else if (!below && this.crossedThresholds.has(key)) {
        this.crossedThresholds.delete(key);
      }
    });
  }

  update(delta, distanceDrivenThisFrame = 0) {
    if (getEngineState()) {
      this.resources.fuel = clamp(this.resources.fuel - distanceDrivenThisFrame * FUEL_PER_METRE);
    }
    this.resources.water = clamp(this.resources.water - delta * WATER_PER_SECOND);
    this.resources.battery = clamp(this.resources.battery);
    this.resources.film = clamp(this.resources.film);

    this.checkThresholds();

    this.persistTimer += delta;
    if (this.persistTimer >= PERSIST_INTERVAL) {
      this.persistTimer = 0;
      save('resources', this.resources);
    }

    eventBus.emit('resource:update', { ...this.resources });
  }

  // Generic +/- adjustment for any resource — used by refuel()/refillWater()
  // and by crisis events (e.g. battery loss during a wildfire) that don't
  // have their own named convenience method.
  adjust(resource, amount) {
    this.resources[resource] = clamp(this.resources[resource] + amount);
    save('resources', this.resources);
    eventBus.emit('resource:update', { ...this.resources });
  }

  refuel(amount) {
    this.adjust('fuel', amount);
  }

  refillWater(amount) {
    this.adjust('water', amount);
  }
}

export const resourceManager = new ResourceManager();
