/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { ElephantHerd } from './species/Elephant.js';
import { LionPride } from './species/Lion.js';
import { Cheetah } from './species/Cheetah.js';
import { GiraffeGroup } from './species/Giraffe.js';
import { ZebraHerd } from './species/Zebra.js';
import { WaterholeManager } from './WaterholeManager.js';
import { eventBus } from '../utils/eventBus.js';
import { distance2D } from '../utils/mathUtils.js';
import { getGameHour } from '../world/dayNight.js';

const LOD_NEAR = 200;
const LOD_MID = 400;
const LOD_MID_INTERVAL = 3;
const LOD_FAR_INTERVAL = 10;
const OUT_OF_RANGE = 600;

export class AnimalManager {
  constructor(scene, terrain) {
    this.scene = scene;
    this.playerPosition = { x: 0, z: 0 };
    this.frameCount = 0;

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

    eventBus.on('jeep:positionUpdate', ({ position }) => {
      this.playerPosition = position;
    });
  }

  getPlayerDistanceTo(animalGroup) {
    return distance2D(animalGroup.position ?? animalGroup.mesh.position, this.playerPosition);
  }

  update(delta) {
    this.frameCount += 1;
    this.waterhole.attractAnimals(getGameHour());

    const predators = [
      { type: 'lion', position: this.lionPride.position },
    ];
    const context = { playerPosition: this.playerPosition, predators };

    this.groups.forEach((group) => {
      const dist = this.getPlayerDistanceTo(group);
      if (dist > OUT_OF_RANGE) return;

      // Distant groups update on a longer stride with a scaled-up delta so
      // movement stays correctly paced; the coarser stride is itself what
      // "skips animation" — sway/breathing ticks run far less often.
      if (dist <= LOD_NEAR) {
        group.update(delta, context);
      } else if (dist <= LOD_MID) {
        if (this.frameCount % LOD_MID_INTERVAL === 0) group.update(delta * LOD_MID_INTERVAL, context);
      } else if (this.frameCount % LOD_FAR_INTERVAL === 0) {
        group.update(delta * LOD_FAR_INTERVAL, context);
      }
    });
  }

  dispose() {
    this.groups.forEach((group) => group.dispose());
    this.waterhole.dispose();
  }
}
