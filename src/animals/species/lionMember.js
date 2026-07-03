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
import { eventBus } from '../../utils/eventBus.js';
import { moveToward } from '../../utils/mathUtils.js';

const PRIDE_CENTER = { x: 300, z: 200 };
const PROWL_RADIUS = 100;
const PROWL_KMH = 4;
const STALK_KMH = 8;
const CHARGE_KMH = 50;
const FOOT_CHARGE_RANGE = 40;
const BREATHE_INTERVAL = 3;

// rest/prowl/stalk share BaseAnimal's 'idle'/'walk' states — the `role`
// and `stalking`/`resting` flags carry the lion-specific behaviour.
export class LionMember extends BaseAnimal {
  constructor(id, scene, role, spawnPos) {
    super(id, scene, { role });
    this.role = role; // 'male' | 'female' | 'cub'
    this.breatheTimer = BREATHE_INTERVAL;
    this.prowlAngle = Math.random() * Math.PI * 2;
    this.resting = false;
    this.stalking = false;

    this.mesh = new Group();
    this.mesh.position.set(spawnPos.x, 0, spawnPos.z);
    const scale = role === 'cub' ? 0.5 : 1;
    const placeholder = new Mesh(
      new BoxGeometry(2.5 * scale, 1.2 * scale, 4 * scale),
      new MeshStandardMaterial({ color: 0xc08a3e, roughness: 0.85 })
    );
    placeholder.position.y = (1.2 * scale) / 2;
    loadAnimalMesh(this.mesh, 'lion.glb', placeholder);
    scene.add(this.mesh);
  }

  getSafeApproachDistance() {
    return { neutral: 60, spooked: 100, familiar: 35 }[this.trustLevel] ?? 60;
  }

  update(delta, context) {
    if (this.state === 'charge') {
      moveToward(this.mesh, context.playerPosition, CHARGE_KMH, delta, 1);
      return;
    }

    if (this.state === 'walk' && this.stalking) {
      moveToward(this.mesh, context.playerPosition, STALK_KMH, delta, FOOT_CHARGE_RANGE * 0.5);
      return;
    }

    if (this.state === 'walk' && !this.resting) {
      this.prowlAngle += delta * 0.05;
      const target = {
        x: PRIDE_CENTER.x + Math.cos(this.prowlAngle) * PROWL_RADIUS,
        z: PRIDE_CENTER.z + Math.sin(this.prowlAngle) * PROWL_RADIUS,
      };
      moveToward(this.mesh, target, PROWL_KMH, delta, 2);
      return;
    }

    // rest / idle: breathing scale animation
    this.breatheTimer -= delta;
    const breathe = 1 + Math.sin((BREATHE_INTERVAL - this.breatheTimer) * Math.PI) * 0.05;
    this.mesh.scale.y = breathe;
    if (this.breatheTimer <= 0) this.breatheTimer = BREATHE_INTERVAL;
  }

  startCharge() {
    this.stalking = false;
    this.setState('charge');
    eventBus.emit('crisis:lionCharge', { id: this.id });
  }

  startStalk() {
    this.stalking = true;
    this.resting = false;
    this.setState('walk');
  }

  startProwl() {
    this.stalking = false;
    this.resting = false;
    this.setState('walk');
  }

  startRest(position) {
    this.stalking = false;
    this.resting = true;
    if (position) this.mesh.position.set(position.x, 0, position.z);
    this.setState('idle');
  }
}
