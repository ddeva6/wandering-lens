/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import * as THREE from 'three';
import { ElephantHerd } from './species/Elephant.js';
import { LionPride } from './species/Lion.js';
import { Cheetah } from './species/Cheetah.js';
import { GiraffeGroup } from './species/Giraffe.js';
import { ZebraHerd } from './species/Zebra.js';
import { WaterholeManager } from './WaterholeManager.js';
import { eventBus } from '../utils/eventBus.js';
import { distance2D } from '../utils/mathUtils.js';
import { getGameHour } from '../world/dayNight.js';
import { isMobile } from '../core/renderer.js';

let currentInstance = null;

export function getAnimalManager() {
  return currentInstance;
}

export function getActiveMeshCount() {
  const manager = getAnimalManager();
  if (!manager || !manager.animals) return 0;
  return manager.animals.filter((animal) => animal.mesh && animal.mesh.visible).length;
}

export class AnimalManager {
  constructor(scene, terrain, camera) {
    this.scene = scene;
    this.terrain = terrain;
    this.camera = camera;
    this.playerPosition = { x: 0, z: 0 };
    this.frameCount = 0;
    currentInstance = this;

    this.frustum = new THREE.Frustum();
    this.frustumMatrix = new THREE.Matrix4();

    this.elephantHerd = new ElephantHerd(scene);
    this.lionPride = new LionPride(scene, terrain);
    this.cheetah = new Cheetah(scene);
    this.giraffeGroup = new GiraffeGroup(scene);
    this.zebraHerd = new ZebraHerd(scene);
    this.waterhole = new WaterholeManager(scene);
    this.waterhole.registerAnimals(this);

    this.groups = [
      this.elephantHerd,
      this.lionPride,
      this.cheetah,
      this.giraffeGroup,
      this.zebraHerd,
    ];

    // Gather all individual animal members
    this.animals = [];
    this.groups.forEach((group) => {
      if (group.members) {
        this.animals.push(...group.members);
      } else {
        this.animals.push(group);
      }
    });

    eventBus.on('jeep:positionUpdate', ({ position }) => {
      this.playerPosition = position;
    });

    // Wrap the update method of each individual animal for LOD & Frustum Culling
    this.animals.forEach((animal) => {
      const originalUpdate = animal.update.bind(animal);
      animal.update = (delta, context) => {
        if (!animal.mesh) return;

        const dist = distance2D(animal.mesh.position, this.playerPosition);

        // Mobile vs Desktop limits
        const nearLimit = isMobile ? 100 : 200;
        const midLimit = isMobile ? 200 : 400;
        const farLimit = isMobile ? 350 : 600;

        // Active hour check for Zebra/Cheetah
        const hour = getGameHour();
        let isTimeVisible = true;
        if (animal.id.includes('zebra') && !(hour >= 6 && hour <= 19)) {
          isTimeVisible = false;
        }
        if (animal.id.includes('cheetah') && !(hour >= 16 && hour <= 18.5)) {
          isTimeVisible = false;
        }

        if (dist > farLimit || !isTimeVisible) {
          animal.mesh.visible = false;
          return;
        }

        // Frustum culling check
        if (!this.frustum.containsPoint(animal.mesh.position)) {
          animal.mesh.visible = false;
          return;
        }

        animal.mesh.visible = true;

        // LOD updates
        let shouldUpdateAI = false;
        let deltaScale = 1;
        if (dist <= nearLimit) {
          shouldUpdateAI = true;
          deltaScale = 1;
        } else if (dist <= midLimit) {
          shouldUpdateAI = (this.frameCount % 3 === 0);
          deltaScale = 3;
        } else {
          shouldUpdateAI = (this.frameCount % 10 === 0);
          deltaScale = 10;
        }

        if (shouldUpdateAI) {
          originalUpdate(delta * deltaScale, context);
        }

        // Mixer updates
        if (animal.mixer) {
          if (dist <= nearLimit) {
            animal.mixer.update(delta);
          } else if (dist <= midLimit) {
            animal.mixer.update(delta * 0.5);
          }
        }
      };
    });
  }

  getPlayerDistanceTo(animalGroup) {
    const meshPos = animalGroup.position ?? (animalGroup.mesh ? animalGroup.mesh.position : null);
    if (!meshPos) return Infinity;
    return distance2D(meshPos, this.playerPosition);
  }

  getNearestAnimalDistance() {
    let nearest = Infinity;
    this.animals.forEach((animal) => {
      if (animal.mesh) {
        const dist = distance2D(animal.mesh.position, this.playerPosition);
        if (dist < nearest) nearest = dist;
      }
    });
    return nearest;
  }

  update(delta) {
    this.frameCount += 1;

    // Update frustum
    if (this.camera) {
      this.frustumMatrix.multiplyMatrices(
        this.camera.projectionMatrix,
        this.camera.matrixWorldInverse
      );
      this.frustum.setFromProjectionMatrix(this.frustumMatrix);
    }

    this.waterhole.attractAnimals(getGameHour());

    // Culling for waterhole plane
    if (this.waterhole && this.waterhole.mesh) {
      this.waterhole.mesh.visible = this.frustum.containsPoint(this.waterhole.mesh.position);
    }

    const predators = [
      { type: 'lion', position: this.lionPride.position },
    ];
    const context = { playerPosition: this.playerPosition, predators };

    // Update each group
    this.groups.forEach((group) => {
      const dist = this.getPlayerDistanceTo(group);
      const farLimit = isMobile ? 350 : 600;
      if (dist > farLimit + 50) return; // Add buffer before skipping

      group.update(delta, context);
    });
  }

  dispose() {
    this.groups.forEach((group) => group.dispose());
    this.waterhole.dispose();
  }
}
