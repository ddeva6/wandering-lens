/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { createRenderer, resizeRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera, resizeCamera } from './core/camera.js';
import { createLoop } from './core/loop.js';
import { createTerrain } from './world/terrain.js';
import { createSkybox } from './world/skybox.js';
import { createDayNightCycle } from './world/dayNightCycle.js';
import { createWeather } from './world/weather.js';
import { createSoundManager } from './audio/soundManager.js';

function start() {
  const canvas = document.getElementById('game-canvas');
  const renderer = createRenderer(canvas);
  const scene = createScene();
  const camera = createCamera();
  const loop = createLoop(renderer, scene, camera);

  createSkybox(scene);
  createTerrain(scene);
  const weather = createWeather(scene);
  const dayNight = createDayNightCycle(scene);
  createSoundManager();

  camera.position.set(0, 45, 120);
  camera.lookAt(0, 20, -200);

  loop.add((delta) => {
    weather.update(delta);
    dayNight.update(delta, weather.getModifiers());
  });

  window.addEventListener('resize', () => {
    resizeCamera(camera);
    resizeRenderer(renderer);
  });

  loop.start();

  if (import.meta.env.DEV) {
    console.log('[WL] Phase 2 world running — terrain, skybox, day/night, weather, wind');
  }
}

start();
