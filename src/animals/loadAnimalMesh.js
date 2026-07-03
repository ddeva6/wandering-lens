/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { loadingManager } from '../core/loadingManager.js';

const loader = new GLTFLoader(loadingManager);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

console.info(
  '[MODELS] DRACOLoader configured. Run npm run compress-models when real .glb files are added to public/models/'
);

// Attaches `placeholderMesh` to `group` immediately, then swaps it for the
// real model once modelFile loads. Never blocks scene startup on a missing
// asset — logs [ASSET MISSING] and keeps the placeholder if the load fails.
export function loadAnimalMesh(group, modelFile, placeholderMesh) {
  group.add(placeholderMesh);

  const baseName = modelFile.replace('.glb', '');
  const dracoPath = `${import.meta.env.BASE_URL}models/${baseName}.draco.glb`;
  const regularPath = `${import.meta.env.BASE_URL}models/${modelFile}`;

  loader.load(
    dracoPath,
    (gltf) => {
      group.remove(placeholderMesh);
      placeholderMesh.geometry?.dispose();
      if (placeholderMesh.material) {
        if (Array.isArray(placeholderMesh.material)) {
          placeholderMesh.material.forEach((m) => m.dispose());
        } else {
          placeholderMesh.material.dispose();
        }
      }
      group.add(gltf.scene);
    },
    undefined,
    () => {
      // Fallback to regular GLB
      loader.load(
        regularPath,
        (gltf) => {
          group.remove(placeholderMesh);
          placeholderMesh.geometry?.dispose();
          if (placeholderMesh.material) {
            if (Array.isArray(placeholderMesh.material)) {
              placeholderMesh.material.forEach((m) => m.dispose());
            } else {
              placeholderMesh.material.dispose();
            }
          }
          group.add(gltf.scene);
        },
        undefined,
        () => {
          console.warn(`[ASSET MISSING] ${modelFile} — using placeholder`);
        }
      );
    }
  );

  return placeholderMesh;
}
