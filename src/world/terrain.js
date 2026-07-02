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

// CPU-side copy of the displacement map so gameplay code (jeep, walking,
// animals) can query ground height at any world position. Bilinear sampling
// matches the GPU vertex displacement closely enough for placement.
const SAMPLE_SIZE = 256;

function createHeightSampler(image) {
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const data = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;

  const texel = (px, py) => {
    const cx = Math.min(SAMPLE_SIZE - 1, Math.max(0, px));
    const cy = Math.min(SAMPLE_SIZE - 1, Math.max(0, py));
    return data[(cy * SAMPLE_SIZE + cx) * 4] / 255;
  };

  return (x, z) => {
    // Plane UVs after rotateX(-PI/2): u = x/SIZE + 0.5, v = 0.5 - z/SIZE;
    // image row 0 is v = 1 (textures are flipY).
    const fx = (x / SIZE + 0.5) * (SAMPLE_SIZE - 1);
    const fy = (0.5 + z / SIZE) * (SAMPLE_SIZE - 1);
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const h =
      texel(x0, y0) * (1 - tx) * (1 - ty) +
      texel(x0 + 1, y0) * tx * (1 - ty) +
      texel(x0, y0 + 1) * (1 - tx) * ty +
      texel(x0 + 1, y0 + 1) * tx * ty;
    return h * DISPLACEMENT_SCALE;
  };
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
  let getHeightAt = createHeightSampler(heightmap.image);
  loadFileTexture(
    `${base}textures/terrain-displacement.png`,
    (texture) => {
      material.displacementMap.dispose();
      material.displacementMap = texture;
      material.needsUpdate = true;
      getHeightAt = createHeightSampler(texture.image);
    },
    'textures/terrain-displacement.png'
  );

  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  return {
    mesh,
    getHeightAt: (x, z) => getHeightAt(x, z),
    dispose() {
      scene.remove(mesh);
      geometry.dispose();
      material.map?.dispose();
      material.displacementMap?.dispose();
      material.dispose();
    },
  };
}
