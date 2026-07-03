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
import { createJeep } from './jeep/jeepModel.js';
import { applyDriving, getSpeed } from './jeep/jeepPhysics.js';
import { createControls } from './jeep/controls.js';
import { initEngineCut, getEngineState } from './jeep/engineCut.js';
import {
  isOnFoot,
  updateOnFootMode,
  updateWalk,
  getPlayerPosition,
  EYE_LEVEL,
} from './jeep/onFootMode.js';
import { createDashboard } from './jeep/dashboard.js';
import { createResources } from './mechanics/resources.js';
import { setGameHour } from './world/dayNight.js';
import { eventBus } from './utils/eventBus.js';
import { save, load } from './utils/localStorage.js';
import * as viewfinderUI from './ui/viewfinderUI.js';
import * as photoComparison from './mechanics/photo/photoComparison.js';
import { init as initShotSystem } from './mechanics/photo/shotSystem.js';

const CHASE_DISTANCE = 12;
const CHASE_HEIGHT = 5;

function updateChaseCamera(camera, jeep, look) {
  if (isOnFoot()) {
    const player = getPlayerPosition();
    const eyeY = player.y + EYE_LEVEL;
    camera.position.set(player.x, eyeY, player.z);
    camera.lookAt(
      player.x - Math.sin(look.yaw) * Math.cos(look.pitch),
      eyeY - Math.sin(look.pitch),
      player.z - Math.cos(look.yaw) * Math.cos(look.pitch)
    );
    return;
  }
  const yaw = jeep.rotation.y + look.yaw;
  const target = jeep.position;
  camera.position.set(
    target.x + Math.sin(yaw) * CHASE_DISTANCE,
    target.y + CHASE_HEIGHT + look.pitch * 8,
    target.z + Math.cos(yaw) * CHASE_DISTANCE
  );
  camera.lookAt(target.x, target.y + 1.5, target.z);
}

function start() {
  const canvas = document.getElementById('game-canvas');
  const renderer = createRenderer(canvas);
  const scene = createScene();
  const camera = createCamera();

  createSkybox(scene);
  const terrain = createTerrain(scene);
  const weather = createWeather(scene);
  const dayNight = createDayNightCycle(scene);
  createSoundManager();

  const loop = createLoop(renderer, scene, camera, terrain);
  const resources = createResources();
  const jeep = createJeep(scene);
  const controls = createControls(canvas);
  const dashboard = createDashboard(jeep.group);
  initEngineCut();

  if (load('photo_album', null) === null) save('photo_album', []);
  initShotSystem(resources);
  viewfinderUI.init();
  photoComparison.init();

  loop.add((delta) => {
    weather.update(delta);
    dayNight.update(delta, weather.getModifiers());
    setGameHour(dayNight.getHour());

    let metres = 0;
    if (isOnFoot()) {
      updateWalk(delta, controls.keys, controls.getLook().yaw);
      const player = getPlayerPosition();
      player.y = terrain.getHeightAt(player.x, player.z);
      eventBus.emit('jeep:positionUpdate', { position: player });
    } else {
      metres = applyDriving(delta, controls.keys, jeep.group);
      const ground = terrain.getHeightAt(jeep.group.position.x, jeep.group.position.z);
      jeep.group.position.y = ground + 1;
    }
    resources.update(delta, metres);
    updateOnFootMode(resources.get(), jeep.group);
    dashboard.update(delta);
    updateChaseCamera(camera, jeep.group, controls.getLook());
  });

  window.addEventListener('resize', () => {
    resizeCamera(camera);
    resizeRenderer(renderer);
  });

  loop.start();

  if (import.meta.env.DEV) {
    window.__WL = {
      jeep: jeep.group,
      getEngineState,
      getSpeed,
      resources,
      isOnFoot,
      animalManager: loop.animalManager,
    };
    console.log('[WL] Phase 5 running — jeep, animal AI, photo mechanic');
  }
}

start();
