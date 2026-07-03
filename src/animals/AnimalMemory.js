/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { save, load } from '../utils/localStorage.js';

const FAMILIAR_SECONDS = 60;

class AnimalMemory {
  constructor() {
    this.records = load('animal_memory', {});
    this.approachTimers = new Map();
  }

  getTrust(animalId) {
    return this.records[animalId]?.trust ?? 'neutral';
  }

  setTrust(animalId, level) {
    this.records[animalId] = { ...this.records[animalId], trust: level };
    save('animal_memory', this.records);
  }

  onPlayerApproach(animalId, distance, safeDistance) {
    if (distance < safeDistance * 0.5) {
      this.setTrust(animalId, 'spooked');
      this.approachTimers.delete(animalId);
      return;
    }

    if (distance < safeDistance) {
      const start = this.approachTimers.get(animalId) ?? performance.now();
      this.approachTimers.set(animalId, start);
      if ((performance.now() - start) / 1000 >= FAMILIAR_SECONDS) {
        this.setTrust(animalId, 'familiar');
        this.approachTimers.delete(animalId);
      }
    } else {
      this.approachTimers.delete(animalId);
    }
  }

  resetAll() {
    this.records = {};
    this.approachTimers.clear();
    save('animal_memory', this.records);
  }
}

export const animalMemory = new AnimalMemory();
