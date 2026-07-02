/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Group, BoxGeometry, MeshStandardMaterial, Mesh } from 'three';
import { BaseAnimal } from '../BaseAnimal.js';
import { loadAnimalMesh } from '../loadAnimalMesh.js';
import { animalMemory } from '../AnimalMemory.js';
import { eventBus } from '../../utils/eventBus.js';
import { getGameHour } from '../../world/dayNight.js';
import { distance2D, kmhToMs } from '../../utils/mathUtils.js';
import { getSpeed, getVelocity } from '../../jeep/jeepPhysics.js';

const SPAWN = { x: 0, z: 400 };
const IDLE_SCAN_INTERVAL = 5;
const RACE_TRIGGER_RANGE = 50;
const RACE_TRIGGER_SPEED_KMH = 40;
const RACE_TRIGGER_DOT = 0.7;
const RACE_TOP_SPEED_KMH = 110;
const RACE_DURATION = 30;
const RACE_SLOW_QUALITY_SPEED = 80;

function isActiveHour(hour) {
  return hour >= 16 && hour <= 18.5;
}

export class Cheetah extends BaseAnimal {
  constructor(scene) {
    super('cheetah_01', scene);
    this.scanTimer = IDLE_SCAN_INTERVAL;
    this.raceTimer = 0;

    this.mesh = new Group();
    this.mesh.position.set(SPAWN.x, 0, SPAWN.z);
    const placeholder = new Mesh(
      new BoxGeometry(1.5, 0.9, 3),
      new MeshStandardMaterial({ color: 0xd9a441, roughness: 0.8 })
    );
    placeholder.position.y = 0.45;
    loadAnimalMesh(this.mesh, 'cheetah.glb', placeholder);
    scene.add(this.mesh);
  }

  getSafeApproachDistance() {
    return { neutral: 70, spooked: 120, familiar: 40 }[this.trustLevel] ?? 70;
  }

  update(delta, context) {
    const hour = getGameHour();
    const active = isActiveHour(hour);
    this.mesh.visible = active;
    if (!active) {
      if (this.state === 'race') this.setState('idle');
      return;
    }

    this.trustLevel = animalMemory.getTrust(this.id);
    if (context.playerPosition) {
      animalMemory.onPlayerApproach(
        this.id,
        distance2D(this.mesh.position, context.playerPosition),
        this.getSafeApproachDistance()
      );
    }

    if (this.state === 'race') {
      this.updateRace(delta, context);
      return;
    }

    if (this.tryStartRace(context)) return;

    // idle: scan left/right; walk: gentle patrol handled by simple drift
    this.scanTimer -= delta;
    if (this.scanTimer <= 0) {
      this.mesh.rotation.y += (Math.random() - 0.5) * (Math.PI / 3);
      this.scanTimer = IDLE_SCAN_INTERVAL;
      this.setState(Math.random() < 0.5 ? 'idle' : 'walk');
    }
    if (this.state === 'walk') {
      this.mesh.position.x += Math.sin(this.mesh.rotation.y) * kmhToMs(3) * delta;
      this.mesh.position.z += Math.cos(this.mesh.rotation.y) * kmhToMs(3) * delta;
    }
  }

  tryStartRace(context) {
    const jeepSpeed = getSpeed();
    if (!context.playerPosition || Math.abs(jeepSpeed) <= RACE_TRIGGER_SPEED_KMH) return false;
    const dist = distance2D(this.mesh.position, context.playerPosition);
    if (dist > RACE_TRIGGER_RANGE) return false;

    const toJeep = {
      x: context.playerPosition.x - this.mesh.position.x,
      z: context.playerPosition.z - this.mesh.position.z,
    };
    const toJeepLen = Math.hypot(toJeep.x, toJeep.z) || 1;
    const velocity = getVelocity();
    const velocityLen = Math.hypot(velocity.x, velocity.z) || 1;
    const dot = (toJeep.x * velocity.x + toJeep.z * velocity.z) / (toJeepLen * velocityLen);
    if (dot <= RACE_TRIGGER_DOT) return false;

    this.raceTimer = 0;
    this.setState('race');
    eventBus.emit('event:cheetahRace', { id: this.id });
    return true;
  }

  updateRace(delta, context) {
    this.raceTimer += delta;
    const jeepSpeed = Math.min(Math.abs(getSpeed()), RACE_TOP_SPEED_KMH);

    if (this.raceTimer >= RACE_DURATION) {
      this.setState(jeepSpeed > 5 ? 'walk' : 'idle');
      return;
    }

    if (context.playerPosition) {
      const dx = context.playerPosition.x - this.mesh.position.x;
      const dz = context.playerPosition.z - this.mesh.position.z;
      const dist = Math.hypot(dx, dz) || 1;
      this.mesh.rotation.y = Math.atan2(dx, dz);
      const step = kmhToMs(jeepSpeed) * delta;
      // Run alongside rather than colliding with the jeep.
      if (dist > 15) {
        this.mesh.position.x += (dx / dist) * step;
        this.mesh.position.z += (dz / dist) * step;
      } else {
        this.mesh.position.x += Math.cos(this.mesh.rotation.y) * step;
        this.mesh.position.z -= Math.sin(this.mesh.rotation.y) * step;
      }
    }

    if (jeepSpeed > RACE_SLOW_QUALITY_SPEED) {
      eventBus.emit('photo:momentActive', { species: 'cheetah', quality: 'legendary' });
    }
  }
}
