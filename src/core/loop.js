/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Clock } from 'three';
import { AnimalManager } from '../animals/AnimalManager.js';
import * as viewfinder from '../mechanics/photo/viewfinder.js';
import { setNearestDistance } from '../mechanics/photo/distanceMeter.js';
import { resourceManager } from '../mechanics/survival/resourceManager.js';
import { getDistanceDrivenThisFrame } from '../jeep/jeepPhysics.js';

export function createLoop(renderer, scene, camera, terrain) {
  const clock = new Clock();
  const updatables = [];
  const animalManager = new AnimalManager(scene, terrain);
  let running = false;

  function tick() {
    if (!running) return;
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    for (const update of updatables) {
      update(delta, elapsed);
    }
    animalManager.update(delta);
    setNearestDistance(animalManager.getNearestAnimalDistance());
    resourceManager.update(delta, getDistanceDrivenThisFrame());
    if (viewfinder.isActive()) viewfinder.draw();

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  return {
    animalManager,
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
