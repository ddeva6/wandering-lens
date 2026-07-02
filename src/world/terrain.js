/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import {
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  TextureLoader,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';
import {
  createGrassTexture,
  createHeightmapTexture,
} from '../utils/proceduralTexture.js';

const SIZE = 2000;
const SEGMENTS = 256;
const DISPLACEMENT_SCALE = 40;
const GRASS_REPEAT = 32;

function loadFileTexture(url, onLoad, missingLabel) {
  new TextureLoader().load(url, onLoad, undefined, () => {
    console.warn(`[ASSET MISSING] ${missingLabel} — using procedural placeholder`);
  });
}

export function createTerrain(scene) {
  const geometry = new PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  geometry.rotateX(-Math.PI / 2);

  const grass = createGrassTexture();
  grass.repeat.set(GRASS_REPEAT, GRASS_REPEAT);
  const heightmap = createHeightmapTexture();

  const material = new MeshStandardMaterial({
    map: grass,
    displacementMap: heightmap,
    displacementScale: DISPLACEMENT_SCALE,
    roughness: 1,
    metalness: 0,
  });

  const base = import.meta.env.BASE_URL;
  loadFileTexture(
    `${base}textures/grass.jpg`,
    (texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(GRASS_REPEAT, GRASS_REPEAT);
      texture.colorSpace = SRGBColorSpace;
      material.map.dispose();
      material.map = texture;
      material.needsUpdate = true;
    },
    'textures/grass.jpg'
  );
  loadFileTexture(
    `${base}textures/terrain-displacement.png`,
    (texture) => {
      material.displacementMap.dispose();
      material.displacementMap = texture;
      material.needsUpdate = true;
    },
    'textures/terrain-displacement.png'
  );

  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  return {
    mesh,
    dispose() {
      scene.remove(mesh);
      geometry.dispose();
      material.map?.dispose();
      material.displacementMap?.dispose();
      material.dispose();
    },
  };
}
