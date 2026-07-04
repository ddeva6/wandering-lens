/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { InstancedMesh, ConeGeometry, IcosahedronGeometry, MeshStandardMaterial, Object3D } from 'three';
import { isMobile } from '../core/renderer.js';
import { getZoneDensityAt } from './zoneManager.js';

const INSTANCE_COUNT = isMobile ? 150 : 300;
const TERRAIN_HALF_SIZE = 1000; // world/terrain.js's SIZE (2000) / 2
const MAX_ATTEMPTS = 12;

// Per-zone density multiplier, keyed by zone name; 'default' covers any
// point outside every identity zone (plain savanna baseline).
const GRASS_DENSITY = { default: 0.5, camp: 0.6, waterhole: 1, eastern: 0.3, plateau: 0.4, burnt: 0.05 };
const ROCK_DENSITY = { default: 0.3, camp: 0.3, waterhole: 0.1, eastern: 0.8, plateau: 0.5, burnt: 0.2 };

function densityAt(x, z, table) {
  const zoneWeights = getZoneDensityAt(x, z);
  const activeWeight = Object.values(zoneWeights).reduce((sum, w) => sum + w, 0);
  const remaining = Math.max(0, 1 - activeWeight);
  let density = table.default * remaining;
  Object.entries(zoneWeights).forEach(([name, weight]) => {
    density += (table[name] ?? table.default) * weight;
  });
  return density;
}

function randomPoint() {
  return {
    x: (Math.random() * 2 - 1) * TERRAIN_HALF_SIZE,
    z: (Math.random() * 2 - 1) * TERRAIN_HALF_SIZE,
  };
}

function placeInstances(mesh, terrain, densityTable, scaleRange) {
  const dummy = new Object3D();
  for (let i = 0; i < INSTANCE_COUNT; i += 1) {
    let point = randomPoint();
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      if (Math.random() < densityAt(point.x, point.z, densityTable)) break;
      point = randomPoint();
    }

    const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
    dummy.position.set(point.x, terrain.getHeightAt(point.x, point.z), point.z);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

export function scatterGroundCover(scene, terrain) {
  const grassGeometry = new ConeGeometry(0.15, 0.6, 4);
  const grassMaterial = new MeshStandardMaterial({ color: 0x4a6b2a, roughness: 1 });
  const grassMesh = new InstancedMesh(grassGeometry, grassMaterial, INSTANCE_COUNT);
  grassMesh.position.y = 0.3;

  const rockGeometry = new IcosahedronGeometry(0.4, 0);
  const rockMaterial = new MeshStandardMaterial({ color: 0x8a7a68, roughness: 0.9 });
  const rockMesh = new InstancedMesh(rockGeometry, rockMaterial, INSTANCE_COUNT);

  placeInstances(grassMesh, terrain, GRASS_DENSITY, [0.7, 1.3]);
  placeInstances(rockMesh, terrain, ROCK_DENSITY, [0.5, 1.6]);

  scene.add(grassMesh, rockMesh);

  return {
    dispose() {
      scene.remove(grassMesh, rockMesh);
      grassGeometry.dispose();
      grassMaterial.dispose();
      rockGeometry.dispose();
      rockMaterial.dispose();
    },
  };
}
