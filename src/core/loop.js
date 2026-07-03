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
import { getTimeScale } from '../story/voiceSystem.js';
import { amara } from '../characters/amara/AmaraCharacter.js';
import { isaac } from '../characters/isaac/IsaacCharacter.js';
import { updateFrustum, frustum, prefersReducedMotion } from './camera.js';
import { updateCrates } from '../mechanics/isaacGifts.js';
import { updateComebackObjects } from '../mechanics/comeback/comebackManager.js';

export function createLoop(renderer, scene, camera, terrain) {
  const clock = new Clock();
  const updatables = [];
  const animalManager = new AnimalManager(scene, terrain, camera);
  let running = false;

  function tick() {
    if (!running) return;
    const realDelta = clock.getDelta();
    const delta = realDelta * getTimeScale();
    const elapsed = clock.getElapsedTime();

    updateFrustum(camera);
    updateCrates(frustum);
    updateComebackObjects(frustum);

    for (const update of updatables) {
      update(delta, elapsed);
    }
    animalManager.update(delta);
    setNearestDistance(animalManager.getNearestAnimalDistance());
    resourceManager.update(realDelta, getDistanceDrivenThisFrame());
    amara.update(delta);
    isaac.update(delta);
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
