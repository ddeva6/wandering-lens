/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { ElephantMember } from './elephantMember.js';
import { animalMemory } from '../AnimalMemory.js';
import { eventBus } from '../../utils/eventBus.js';
import { getGameHour } from '../../world/dayNight.js';
import { distance2D, randomInRadius } from '../../utils/mathUtils.js';
import { WATERHOLE_POSITION } from '../WaterholeManager.js';

const HERD_SIZE = 8;
const HERD_CENTER = { x: -200, z: -150 };
const SPREAD_RADIUS = 30;
const REST_ZONE = { x: -260, z: -220 };
const CALF_TRIGGER_DISTANCE = 15;
const ADULT_TRIGGER_DISTANCE = 20;

function isActiveHour(hour) {
  return (hour >= 6.5 && hour <= 9) || (hour >= 16 && hour <= 19);
}

export class ElephantHerd {
  constructor(scene) {
    this.scene = scene;
    this.members = Array.from({ length: HERD_SIZE }, (_, i) => {
      const isCalf = i % 3 === 2;
      const spawn = randomInRadius(HERD_CENTER.x, HERD_CENTER.z, SPREAD_RADIUS);
      return new ElephantMember(`elephant_${String(i + 1).padStart(2, '0')}`, scene, isCalf, spawn);
    });
    this.wasActive = true;
  }

  get position() {
    return this.members[0].mesh.position;
  }

  drinkAtWaterhole() {
    this.members.forEach((elephant) => {
      const spot = randomInRadius(WATERHOLE_POSITION.x, WATERHOLE_POSITION.z, 12);
      elephant.walkTo(spot);
      elephant._pendingDrink = true;
    });
  }

  update(delta, context) {
    const hour = getGameHour();
    const active = isActiveHour(hour);
    if (active !== this.wasActive) {
      this.wasActive = active;
      if (!active) this.members.forEach((e) => e.walkTo(randomInRadius(REST_ZONE.x, REST_ZONE.z, 15)));
    }

    // Herd-level charge trigger: calves take priority over adult warnings.
    const isCharging = this.members.some((e) => e.state === 'charge');
    if (!isCharging && context.playerPosition) {
      const calves = this.members.filter((e) => e.isCalf);
      const adults = this.members.filter((e) => !e.isCalf);
      const nearestCalfDist = Math.min(
        ...calves.map((c) => distance2D(c.mesh.position, context.playerPosition))
      );
      if (nearestCalfDist < CALF_TRIGGER_DISTANCE && adults.length) {
        const guardian = adults.reduce((closest, a) =>
          distance2D(a.mesh.position, context.playerPosition) <
          distance2D(closest.mesh.position, context.playerPosition)
            ? a
            : closest
        );
        guardian.startCharge('real');
      } else {
        const nearAdult = adults.find(
          (a) => distance2D(a.mesh.position, context.playerPosition) < ADULT_TRIGGER_DISTANCE
        );
        if (nearAdult) nearAdult.startCharge('mock');
      }
    }

    this.members.forEach((elephant) => {
      if (elephant._pendingDrink && elephant.state === 'idle' && !elephant.target) {
        elephant._pendingDrink = false;
        elephant.drinkAt(elephant.mesh.position);
      }
      elephant.trustLevel = animalMemory.getTrust(elephant.id);
      animalMemory.onPlayerApproach(
        elephant.id,
        context.playerPosition ? distance2D(elephant.mesh.position, context.playerPosition) : Infinity,
        elephant.getSafeApproachDistance()
      );
      elephant.update(delta, context);

      if (elephant.state === 'drink' && hour >= 6.5 && hour <= 9) {
        eventBus.emit('photo:momentActive', { species: 'elephant', quality: 'legendary' });
      }
    });
  }

  dispose() {
    this.members.forEach((e) => e.dispose());
  }
}
