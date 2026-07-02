/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Clock } from 'three';

export function createLoop(renderer, scene, camera) {
  const clock = new Clock();
  const updatables = [];
  let running = false;

  function tick() {
    if (!running) return;
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    for (const update of updatables) {
      update(delta, elapsed);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  return {
    // update: (delta, elapsed) => void
    add(update) {
      updatables.push(update);
    },
    start() {
      if (running) return;
      running = true;
      clock.start();
      requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      clock.stop();
    },
  };
}
