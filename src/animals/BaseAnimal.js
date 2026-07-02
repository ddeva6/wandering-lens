/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { animalMemory } from './AnimalMemory.js';

export const ANIMAL_STATES = [
  'idle',
  'walk',
  'graze',
  'drink',
  'flee',
  'charge',
  'race',
];

const SAFE_DISTANCE = { neutral: 40, spooked: 80, familiar: 20 };

// Abstract base every species class extends. Subclasses set this.mesh
// (and this.mixer once a model loads) and override update()/getSafeApproachDistance().
export class BaseAnimal {
  constructor(id, scene, options = {}) {
    if (new.target === BaseAnimal) {
      throw new Error('BaseAnimal is abstract — extend it from a species class');
    }
    this.id = id;
    this.scene = scene;
    this.options = options;
    this.state = 'idle';
    this.trustLevel = animalMemory.getTrust(id);
    this.mesh = null;
    this.mixer = null;
  }

  setState(newState) {
    if (!ANIMAL_STATES.includes(newState)) {
      throw new Error(`Invalid animal state: ${newState}`);
    }
    if (this.state === newState) return;
    this.state = newState;
    eventBus.emit('animal:stateChange', { id: this.id, state: newState });
  }

  // eslint-disable-next-line no-unused-vars
  update(delta) {
    throw new Error(`${this.constructor.name} must override update()`);
  }

  getSafeApproachDistance() {
    return SAFE_DISTANCE[this.trustLevel] ?? SAFE_DISTANCE.neutral;
  }

  dispose() {
    if (!this.mesh) return;
    this.scene.remove(this.mesh);
    this.mesh.traverse((child) => {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material?.dispose();
    });
  }
}
