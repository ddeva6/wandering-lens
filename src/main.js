import { createRenderer, resizeRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera, resizeCamera } from './core/camera.js';
import { createLoop } from './core/loop.js';
import { createDayNightCycle } from './world/dayNightCycle.js';

function start() {
  const canvas = document.getElementById('game-canvas');
  const renderer = createRenderer(canvas);
  const scene = createScene();
  const camera = createCamera();
  const loop = createLoop(renderer, scene, camera);
  const dayNight = createDayNightCycle(scene);

  loop.add((delta) => dayNight.update(delta));

  window.addEventListener('resize', () => {
    resizeCamera(camera);
    resizeRenderer(renderer);
  });

  loop.start();

  if (import.meta.env.DEV) {
    console.log('[WL] Phase 1 scaffold running — empty scene with day/night sky stub');
  }
}

start();
