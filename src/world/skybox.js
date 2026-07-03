/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import {
  TextureLoader,
  EquirectangularReflectionMapping,
  SRGBColorSpace,
  Color,
} from 'three';
import { loadingManager } from '../core/loadingManager.js';

// Loads an equirectangular skybox from public/textures/skybox.jpg.
// While the file is missing, scene.background stays a Color and the
// day/night cycle drives the sky tint instead.
export function createSkybox(scene) {
  let texture = null;
  const url = `${import.meta.env.BASE_URL}textures/skybox.jpg`;

  new TextureLoader(loadingManager).load(
    url,
    (loaded) => {
      loaded.mapping = EquirectangularReflectionMapping;
      loaded.colorSpace = SRGBColorSpace;
      texture = loaded;
      scene.background = texture;
      scene.environment = texture;
    },
    undefined,
    () => {
      console.warn('[ASSET MISSING] textures/skybox.jpg — using day/night sky colour');
    }
  );

  return {
    isTextured: () => texture !== null,
    dispose() {
      if (!texture) return;
      if (scene.background === texture) scene.background = new Color(0x000000);
      if (scene.environment === texture) scene.environment = null;
      texture.dispose();
      texture = null;
    },
  };
}
