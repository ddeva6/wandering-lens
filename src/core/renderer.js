/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import * as THREE from 'three';
import { camera } from './camera.js';

export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });

  if (isMobile) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.BasicShadowMap;
  } else {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  renderer.setSize(window.innerWidth, window.innerHeight);

  window.addEventListener('resize', () => {
    if (camera) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return renderer;
}

export function resizeRenderer(renderer) {
  renderer.setSize(window.innerWidth, window.innerHeight);
}
