/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Group, BoxGeometry, MeshStandardMaterial, Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createJeep(scene) {
  const group = new Group();
  group.position.set(0, 1, 0);
  scene.add(group);

  const placeholderGeometry = new BoxGeometry(4, 2, 2);
  const placeholderMaterial = new MeshStandardMaterial({
    color: 0x33383d,
    roughness: 0.8,
    metalness: 0.2,
  });
  const placeholder = new Mesh(placeholderGeometry, placeholderMaterial);
  group.add(placeholder);

  new GLTFLoader().load(
    `${import.meta.env.BASE_URL}models/jeep.glb`,
    (gltf) => {
      group.remove(placeholder);
      placeholderGeometry.dispose();
      placeholderMaterial.dispose();
      group.add(gltf.scene);
    },
    undefined,
    () => {
      console.warn('[ASSET MISSING] jeep.glb — using placeholder');
    }
  );

  return {
    group,
    dispose() {
      scene.remove(group);
      group.traverse((child) => {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material?.dispose();
      });
    },
  };
}
