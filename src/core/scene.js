/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Scene, Color } from 'three';

export function createScene() {
  const scene = new Scene();
  scene.background = new Color(0x000000);
  return scene;
}
