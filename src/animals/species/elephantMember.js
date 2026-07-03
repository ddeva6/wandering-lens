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
import { moveToward, distance2D } from '../../utils/mathUtils.js';

const WALK_KMH = 6;
const MOCK_CHARGE_KMH = 15;
const REAL_CHARGE_KMH = 25;
const REAL_CHARGE_STOP_DISTANCE = 5;
const SWAY_MIN = 8;
const SWAY_MAX = 12;
const DRINK_SECONDS = 4;
const DRINK_SINK = 0.5;

// mock_charge/real_charge share BaseAnimal's 'charge' state — chargeType
// on the instance distinguishes the two for movement speed and events.
export class ElephantMember extends BaseAnimal {
  constructor(id, scene, isCalf, spawnPos) {
    super(id, scene, { isCalf });
    this.isCalf = isCalf;
    this.chargeType = null;
    this.swayTimer = SWAY_MIN + Math.random() * (SWAY_MAX - SWAY_MIN);
    this.drinkTimer = 0;
    this.baseY = 0;

    this.mesh = new Group();
    this.mesh.position.set(spawnPos.x, 0, spawnPos.z);
    const scale = isCalf ? 0.6 : 1;
    const placeholder = new Mesh(
      new BoxGeometry(4 * scale, 3 * scale, 7 * scale),
      new MeshStandardMaterial({ color: 0x4a4a48, roughness: 0.9 })
    );
    placeholder.position.y = (3 * scale) / 2;
    loadAnimalMesh(this.mesh, 'elephant.glb', placeholder);
    scene.add(this.mesh);
  }

  getSafeApproachDistance() {
    return { neutral: 50, spooked: 90, familiar: 25 }[this.trustLevel] ?? 50;
  }

  startCharge(type) {
    this.chargeType = type;
    this.setState('charge');
    eventBus.emit(
      type === 'real' ? 'crisis:elephantRealCharge' : 'crisis:elephantMockCharge',
      { id: this.id }
    );
  }

  walkTo(target) {
    this.target = target;
    this.setState('walk');
  }

  drinkAt(position) {
    this.mesh.position.x = position.x;
    this.mesh.position.z = position.z;
    this.baseY = this.mesh.position.y;
    this.drinkTimer = 0;
    this.setState('drink');
  }

  update(delta, context) {
    const { playerPosition } = context;

    if (this.state === 'charge') {
      const kmh = this.chargeType === 'real' ? REAL_CHARGE_KMH : MOCK_CHARGE_KMH;
      const stopAt =
        this.chargeType === 'real' ? REAL_CHARGE_STOP_DISTANCE : this.getSafeApproachDistance();
      const dist = distance2D(this.mesh.position, playerPosition);
      if (dist <= stopAt) {
        this.chargeType = null;
        this.setState('idle');
      } else {
        moveToward(this.mesh, playerPosition, kmh, delta, stopAt);
      }
      return;
    }

    if (this.state === 'drink') {
      this.drinkTimer += delta;
      this.mesh.position.y = this.baseY - Math.min(1, this.drinkTimer / 0.5) * DRINK_SINK;
      if (this.drinkTimer >= DRINK_SECONDS) {
        this.setState('idle');
        this.mesh.position.y = this.baseY;
      }
      return;
    }

    if (this.state === 'walk' && this.target) {
      if (moveToward(this.mesh, this.target, WALK_KMH, delta)) {
        this.setState('idle');
        this.target = null;
      }
      return;
    }

    // idle: slow head sway
    this.swayTimer -= delta;
    if (this.swayTimer <= 0) {
      this.mesh.rotation.z = (Math.random() - 0.5) * 0.08;
      this.swayTimer = SWAY_MIN + Math.random() * (SWAY_MAX - SWAY_MIN);
    }
  }
}
