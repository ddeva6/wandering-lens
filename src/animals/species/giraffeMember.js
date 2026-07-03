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
import { moveToward, moveAway } from '../../utils/mathUtils.js';

const WALK_KMH = 4;
const FLEE_KMH = 20;
const SWAY_SPEED = 0.6;

export class GiraffeMember extends BaseAnimal {
  constructor(id, scene, spawnPos, waypoints) {
    super(id, scene);
    this.waypoints = waypoints;
    this.waypointIndex = 0;
    this.swayPhase = Math.random() * Math.PI * 2;

    this.mesh = new Group();
    this.mesh.position.set(spawnPos.x, 0, spawnPos.z);

    const body = new Mesh(
      new BoxGeometry(2, 5, 3),
      new MeshStandardMaterial({ color: 0xe0c477, roughness: 0.85 })
    );
    body.position.y = 2.5;
    const neck = new Mesh(
      new BoxGeometry(0.6, 3, 0.6),
      new MeshStandardMaterial({ color: 0xe0c477, roughness: 0.85 })
    );
    neck.position.y = 5;
    const placeholder = new Group();
    placeholder.add(body, neck);

    loadAnimalMesh(this.mesh, 'giraffe.glb', placeholder);
    scene.add(this.mesh);
  }

  getSafeApproachDistance() {
    return { neutral: 45, spooked: 80, familiar: 20 }[this.trustLevel] ?? 45;
  }

  update(delta, context) {
    if (this.state === 'flee' && context.playerPosition) {
      moveAway(this.mesh, context.playerPosition, FLEE_KMH, delta);
      return;
    }

    if (this.state === 'walk') {
      const target = this.waypoints[this.waypointIndex];
      if (moveToward(this.mesh, target, WALK_KMH, delta, 2)) {
        this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
      }
      return;
    }

    // idle: neck sway
    this.swayPhase += delta * SWAY_SPEED;
    this.mesh.rotation.z = Math.sin(this.swayPhase) * 0.03;
  }

  walkWaypoints() {
    this.setState('walk');
  }

  flee() {
    this.setState('flee');
  }

  settle() {
    this.setState('idle');
  }
}
