/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { LionMember } from './lionMember.js';
import { animalMemory } from '../AnimalMemory.js';
import { eventBus } from '../../utils/eventBus.js';
import { getGameHour } from '../../world/dayNight.js';
import { distance2D, randomInRadius } from '../../utils/mathUtils.js';
import { isOnFoot } from '../../jeep/onFootMode.js';
import { getEngineState } from '../../jeep/engineCut.js';

const PRIDE_CENTER = { x: 300, z: 200 };
const FOOT_CHARGE_RANGE = 40;
const JEEP_CHARGE_RANGE = 15;
const ENGINE_OFF_STALK_RANGE = 25;
const STALK_RANGE = 120;

function isActiveHour(hour) {
  return (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21);
}

export class LionPride {
  constructor(scene, terrain) {
    this.scene = scene;
    const roles = ['male', 'male', 'female', 'female', 'female', 'cub'];
    this.members = roles.map((role, i) => {
      const spawn = randomInRadius(PRIDE_CENTER.x, PRIDE_CENTER.z, 20);
      return new LionMember(`lion_${String(i + 1).padStart(2, '0')}`, scene, role, spawn);
    });
    // Lowest terrain point near spawn stands in for "nearest acacia" shade.
    this.restPosition = this.findLowestPoint(terrain);
    this.wasActive = false;
  }

  findLowestPoint(terrain) {
    let lowest = { x: PRIDE_CENTER.x, z: PRIDE_CENTER.z, h: Infinity };
    for (let i = 0; i < 12; i += 1) {
      const p = randomInRadius(PRIDE_CENTER.x, PRIDE_CENTER.z, 40);
      const h = terrain?.getHeightAt ? terrain.getHeightAt(p.x, p.z) : 0;
      if (h < lowest.h) lowest = { x: p.x, z: p.z, h };
    }
    return lowest;
  }

  get position() {
    return this.members[0].mesh.position;
  }

  approachWaterhole(waterholePosition) {
    this.members.forEach((lion) => {
      const spot = randomInRadius(waterholePosition.x, waterholePosition.z, 20);
      lion.mesh.position.set(spot.x, 0, spot.z);
    });
  }

  update(delta, context) {
    const hour = getGameHour();
    const active = isActiveHour(hour);
    if (active !== this.wasActive) {
      this.wasActive = active;
      this.members.forEach((lion) => {
        if (active) lion.startProwl();
        else lion.startRest(this.restPosition);
      });
    }

    const isCharging = this.members.some((l) => l.state === 'charge');
    const playerDist = context.playerPosition
      ? distance2D(this.position, context.playerPosition)
      : Infinity;

    if (!isCharging && active && context.playerPosition) {
      const onFoot = isOnFoot();
      const engineOn = getEngineState();
      const foot = onFoot && playerDist < FOOT_CHARGE_RANGE;
      const inJeep = !onFoot && engineOn && playerDist < JEEP_CHARGE_RANGE;
      const engineOffStalk = !onFoot && !engineOn && playerDist < ENGINE_OFF_STALK_RANGE;

      if (foot || inJeep) {
        this.members.filter((l) => l.role !== 'cub').forEach((l) => l.startCharge());
      } else if (engineOffStalk || (onFoot && playerDist < STALK_RANGE)) {
        this.members.forEach((l) => {
          if (l.state !== 'charge') l.startStalk();
        });
      }
    }

    this.members.forEach((lion) => {
      lion.trustLevel = animalMemory.getTrust(lion.id);
      animalMemory.onPlayerApproach(
        lion.id,
        context.playerPosition ? distance2D(lion.mesh.position, context.playerPosition) : Infinity,
        lion.getSafeApproachDistance()
      );
      lion.update(delta, context);
    });

    const cub = this.members.find((l) => l.role === 'cub');
    if (
      this.members[0].resting &&
      cub &&
      distance2D(cub.mesh.position, this.position) < 15 &&
      hour >= 12 &&
      hour <= 14
    ) {
      eventBus.emit('photo:momentActive', { species: 'lion', quality: 'perfect' });
    }
  }

  dispose() {
    this.members.forEach((l) => l.dispose());
  }
}
