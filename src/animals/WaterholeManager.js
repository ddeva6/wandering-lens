/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { CircleGeometry, MeshStandardMaterial, Mesh } from 'three';
import { eventBus } from '../utils/eventBus.js';

export const WATERHOLE_POSITION = { x: 50, y: 0, z: 80 };
const RADIUS = 15;

// hour ranges are [start, end) in in-game hours (0-24)
const SCHEDULE = [
  { species: 'elephant', start: 6.5, end: 9 },
  { species: 'zebra', start: 11, end: 13 },
  { species: 'giraffe', start: 16, end: 18 },
  { species: 'lion', start: 18.5, end: 20 },
];

export class WaterholeManager {
  constructor(scene) {
    const geometry = new CircleGeometry(RADIUS, 32);
    geometry.rotateX(-Math.PI / 2);
    const material = new MeshStandardMaterial({
      color: 0x1a6b8a,
      roughness: 0.1,
      metalness: 0.3,
    });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(WATERHOLE_POSITION.x, WATERHOLE_POSITION.y + 0.05, WATERHOLE_POSITION.z);
    scene.add(this.mesh);

    this.scene = scene;
    this.lastHourBucket = -1;
    this.animals = null; // wired by AnimalManager after all species spawn
  }

  registerAnimals(animals) {
    this.animals = animals;
  }

  // Called every frame; only acts once per new in-game hour.
  attractAnimals(hour) {
    const bucket = Math.floor(hour);
    if (bucket === this.lastHourBucket) return;
    this.lastHourBucket = bucket;

    const active = SCHEDULE.find((slot) => hour >= slot.start && hour < slot.end);
    if (!active || !this.animals) return;

    switch (active.species) {
      case 'elephant':
        this.animals.elephantHerd.drinkAtWaterhole();
        break;
      case 'zebra':
        this.animals.zebraHerd.grazeNearWaterhole(WATERHOLE_POSITION);
        break;
      case 'giraffe':
        this.animals.giraffeGroup.approachWaterhole(WATERHOLE_POSITION);
        break;
      case 'lion':
        this.animals.lionPride.approachWaterhole(WATERHOLE_POSITION);
        break;
      default:
        break;
    }

    eventBus.emit('world:waterholeActivity', { species: active.species, hour });
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
