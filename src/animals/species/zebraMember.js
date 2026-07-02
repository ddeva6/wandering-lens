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

const GRAZE_SWAY_SPEED = 0.8;

// Movement for a zebra is driven externally by ZebraHerd's boid steering
// (or the stampede override) which sets this.velocity {x,z} in m/s each
// frame; update() just integrates position from that velocity.
export class ZebraMember extends BaseAnimal {
  constructor(id, scene, spawnPos) {
    super(id, scene);
    this.velocity = { x: 0, z: 0 };
    this.grazePhase = Math.random() * Math.PI * 2;

    this.mesh = new Group();
    this.mesh.position.set(spawnPos.x, 0, spawnPos.z);
    const placeholder = new Mesh(
      new BoxGeometry(2, 1.5, 3),
      new MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.8 })
    );
    placeholder.position.y = 0.75;
    loadAnimalMesh(this.mesh, 'zebra.glb', placeholder);
    scene.add(this.mesh);
  }

  getSafeApproachDistance() {
    return { neutral: 35, spooked: 70, familiar: 15 }[this.trustLevel] ?? 35;
  }

  update(delta) {
    this.mesh.position.x += this.velocity.x * delta;
    this.mesh.position.z += this.velocity.z * delta;

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > 0.1) {
      this.mesh.rotation.y = Math.atan2(this.velocity.x, this.velocity.z);
    }

    if (this.state === 'graze') {
      this.grazePhase += delta * GRAZE_SWAY_SPEED;
      this.mesh.rotation.x = Math.sin(this.grazePhase) * 0.05 + 0.05;
    } else {
      this.mesh.rotation.x = 0;
    }
  }
}
