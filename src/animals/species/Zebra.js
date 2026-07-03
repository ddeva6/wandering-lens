/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { ZebraMember } from './zebraMember.js';
import { animalMemory } from '../AnimalMemory.js';
import { eventBus } from '../../utils/eventBus.js';
import { getGameHour } from '../../world/dayNight.js';
import { distance2D, randomInRadius, kmhToMs } from '../../utils/mathUtils.js';

const HERD_SIZE = 20;
const HERD_CENTER = { x: 100, z: -300 };
const SPREAD_RADIUS = 60;

const SEPARATION_RADIUS = 8;
const ALIGNMENT_RADIUS = 25;
const COHESION_RADIUS = 40;
const SEPARATION_WEIGHT = 1.5;
const ALIGNMENT_WEIGHT = 1.0;
const COHESION_WEIGHT = 0.8;

const BOID_MAX_SPEED_KMH = 6;
const STAMPEDE_KMH = 55;
const STAMPEDE_TRIGGER_RANGE = 100;
const STAMPEDE_DURATION = 20;

function isActiveHour(hour) {
  return hour >= 6 && hour <= 19;
}

// One pass of separation/alignment/cohesion for a single boid against the
// rest of the herd. O(n) per zebra, O(n^2) per frame for a 20-strong herd.
function steer(zebra, herd) {
  let sepX = 0, sepZ = 0;
  let alignX = 0, alignZ = 0, alignCount = 0;
  let cohX = 0, cohZ = 0, cohCount = 0;

  herd.forEach((other) => {
    if (other === zebra) return;
    const d = distance2D(zebra.mesh.position, other.mesh.position);
    if (d < SEPARATION_RADIUS && d > 0) {
      sepX += (zebra.mesh.position.x - other.mesh.position.x) / d;
      sepZ += (zebra.mesh.position.z - other.mesh.position.z) / d;
    }
    if (d < ALIGNMENT_RADIUS) {
      alignX += other.velocity.x;
      alignZ += other.velocity.z;
      alignCount += 1;
    }
    if (d < COHESION_RADIUS) {
      cohX += other.mesh.position.x;
      cohZ += other.mesh.position.z;
      cohCount += 1;
    }
  });

  let steerX = sepX * SEPARATION_WEIGHT;
  let steerZ = sepZ * SEPARATION_WEIGHT;
  if (alignCount > 0) {
    steerX += (alignX / alignCount) * ALIGNMENT_WEIGHT;
    steerZ += (alignZ / alignCount) * ALIGNMENT_WEIGHT;
  }
  if (cohCount > 0) {
    const cx = cohX / cohCount - zebra.mesh.position.x;
    const cz = cohZ / cohCount - zebra.mesh.position.z;
    steerX += cx * COHESION_WEIGHT * 0.02;
    steerZ += cz * COHESION_WEIGHT * 0.02;
  }
  return { x: steerX, z: steerZ };
}

export class ZebraHerd {
  constructor(scene) {
    this.members = Array.from({ length: HERD_SIZE }, (_, i) => {
      const spawn = randomInRadius(HERD_CENTER.x, HERD_CENTER.z, SPREAD_RADIUS);
      return new ZebraMember(`zebra_${String(i + 1).padStart(2, '0')}`, scene, spawn);
    });
    this.wasActive = true;
    this.stampedeTimer = 0;
  }

  get position() {
    const n = this.members.length;
    const x = this.members.reduce((sum, z) => sum + z.mesh.position.x, 0) / n;
    const zPos = this.members.reduce((sum, z) => sum + z.mesh.position.z, 0) / n;
    return { x, z: zPos };
  }

  grazeNearWaterhole(waterholePosition) {
    this.members.forEach((zebra) => {
      const spot = randomInRadius(waterholePosition.x, waterholePosition.z, 40);
      zebra.mesh.position.set(spot.x, 0, spot.z);
      zebra.setState('graze');
    });
  }

  update(delta, context) {
    const hour = getGameHour();
    const active = isActiveHour(hour);
    if (active !== this.wasActive) this.wasActive = active;
    if (!active) {
      this.members.forEach((z) => (z.mesh.visible = false));
      return;
    }
    this.members.forEach((z) => (z.mesh.visible = true));

    const nearestPredator = (context.predators ?? [])
      .map((p) => ({ ...p, dist: distance2D(this.position, p.position) }))
      .sort((a, b) => a.dist - b.dist)[0];

    if (this.stampedeTimer > 0) {
      this.stampedeTimer -= delta;
      const awayX = this.position.x - nearestPredator.position.x;
      const awayZ = this.position.z - nearestPredator.position.z;
      const len = Math.hypot(awayX, awayZ) || 1;
      const speed = kmhToMs(STAMPEDE_KMH);
      this.members.forEach((zebra) => {
        zebra.velocity.x = (awayX / len) * speed;
        zebra.velocity.z = (awayZ / len) * speed;
        zebra.setState('flee');
        zebra.update(delta);
      });
      if (this.stampedeTimer <= 0) this.members.forEach((z) => z.setState('graze'));
      return;
    }

    if (nearestPredator && nearestPredator.dist < STAMPEDE_TRIGGER_RANGE) {
      this.stampedeTimer = STAMPEDE_DURATION;
      eventBus.emit('event:stampede', { predator: nearestPredator.type });
      return;
    }

    const maxSpeed = kmhToMs(BOID_MAX_SPEED_KMH);
    this.members.forEach((zebra) => {
      zebra.trustLevel = animalMemory.getTrust(zebra.id);
      if (context.playerPosition) {
        animalMemory.onPlayerApproach(
          zebra.id,
          distance2D(zebra.mesh.position, context.playerPosition),
          zebra.getSafeApproachDistance()
        );
      }

      const s = steer(zebra, this.members);
      zebra.velocity.x = Math.max(-maxSpeed, Math.min(maxSpeed, zebra.velocity.x + s.x * delta));
      zebra.velocity.z = Math.max(-maxSpeed, Math.min(maxSpeed, zebra.velocity.z + s.z * delta));
      zebra.setState(Math.hypot(zebra.velocity.x, zebra.velocity.z) > 0.3 ? 'walk' : 'graze');
      zebra.update(delta);
    });

    const grazing = this.members.every((z) => z.state === 'graze');
    if (grazing && hour >= 6 && hour <= 8 && (!nearestPredator || nearestPredator.dist >= 200)) {
      eventBus.emit('photo:momentActive', { species: 'zebra', quality: 'good' });
    }
  }

  dispose() {
    this.members.forEach((z) => z.dispose());
  }
}
