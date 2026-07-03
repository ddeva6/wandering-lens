/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { GiraffeMember } from './giraffeMember.js';
import { animalMemory } from '../AnimalMemory.js';
import { eventBus } from '../../utils/eventBus.js';
import { getGameHour } from '../../world/dayNight.js';
import { distance2D, randomInRadius } from '../../utils/mathUtils.js';
import { WATERHOLE_POSITION } from '../WaterholeManager.js';

const GROUP_SIZE = 4;
const GROUP_CENTER = { x: -400, z: 100 };
const SPREAD_RADIUS = 15;
const WAYPOINTS = [
  { x: -400, z: 100 },
  { x: -370, z: 60 },
  { x: -430, z: 40 },
];

function isActiveHour(hour) {
  return hour >= 6 && hour <= 20;
}

export class GiraffeGroup {
  constructor(scene) {
    this.members = Array.from({ length: GROUP_SIZE }, (_, i) => {
      const spawn = randomInRadius(GROUP_CENTER.x, GROUP_CENTER.z, SPREAD_RADIUS);
      return new GiraffeMember(`giraffe_${String(i + 1).padStart(2, '0')}`, scene, spawn, WAYPOINTS);
    });
    this.wasActive = true;
  }

  get position() {
    return this.members[0].mesh.position;
  }

  approachWaterhole(waterholePosition) {
    this.members.forEach((giraffe) => {
      const spot = randomInRadius(waterholePosition.x, waterholePosition.z, 20);
      giraffe.waypoints = [spot, ...WAYPOINTS];
      giraffe.waypointIndex = 0;
      giraffe.walkWaypoints();
    });
  }

  update(delta, context) {
    const hour = getGameHour();
    const active = isActiveHour(hour);
    if (active !== this.wasActive) {
      this.wasActive = active;
      this.members.forEach((g) => (active ? g.walkWaypoints() : g.settle()));
    }

    this.members.forEach((giraffe) => {
      giraffe.trustLevel = animalMemory.getTrust(giraffe.id);
      const dist = context.playerPosition
        ? distance2D(giraffe.mesh.position, context.playerPosition)
        : Infinity;
      animalMemory.onPlayerApproach(giraffe.id, dist, giraffe.getSafeApproachDistance());

      if (giraffe.state !== 'flee' && dist < giraffe.getSafeApproachDistance()) {
        giraffe.flee();
      } else if (giraffe.state === 'flee' && dist >= giraffe.getSafeApproachDistance() * 1.5) {
        giraffe.walkWaypoints();
      }

      giraffe.update(delta, context);

      if (
        giraffe.state === 'idle' &&
        hour >= 7 &&
        hour <= 9 &&
        distance2D(giraffe.mesh.position, WATERHOLE_POSITION) < 30
      ) {
        eventBus.emit('photo:momentActive', { species: 'giraffe', quality: 'good' });
      }
    });
  }

  dispose() {
    this.members.forEach((g) => g.dispose());
  }
}
