/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { createRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera, updateChaseCamera, prefersReducedMotion } from './core/camera.js';
import { createLoop } from './core/loop.js';
import { createTerrain } from './world/terrain.js';
import { createSkybox } from './world/skybox.js';
import { createDayNightCycle } from './world/dayNightCycle.js';
import { createWeather } from './world/weather.js';
import { createSoundManager } from './audio/soundManager.js';
import { createJeep } from './jeep/jeepModel.js';
import { applyDriving, getSpeed, resetDistanceDrivenThisFrame, setJeepRef } from './jeep/jeepPhysics.js';
import { createControls } from './jeep/controls.js';
import { initEngineCut, getEngineState } from './jeep/engineCut.js';
import {
  isOnFoot,
  updateOnFootMode,
  updateWalk,
  getPlayerPosition,
} from './jeep/onFootMode.js';
import { createDashboard } from './jeep/dashboard.js';
import { resourceManager } from './mechanics/survival/resourceManager.js';
import * as dehydrationFX from './mechanics/survival/dehydrationFX.js';
import * as lionCharge from './mechanics/crisis/lionCharge.js';
import * as elephantCharge from './mechanics/crisis/elephantCharge.js';
import * as flashFlood from './mechanics/crisis/flashFlood.js';
import * as wildfire from './mechanics/crisis/wildfire.js';
import * as hyenaCamp from './mechanics/crisis/hyenaCamp.js';
import * as comebackManager from './mechanics/comeback/comebackManager.js';
import { setGameHour } from './world/dayNight.js';
import { eventBus } from './utils/eventBus.js';
import { initSaveKeys } from './utils/initSaveKeys.js';
import * as viewfinderUI from './ui/viewfinderUI.js';
import * as photoComparison from './mechanics/photo/photoComparison.js';
import { init as initShotSystem } from './mechanics/photo/shotSystem.js';
import * as voiceSystem from './story/voiceSystem.js';
import * as radioMama from './story/radioMama.js';
import * as campfireJournal from './mechanics/campfireJournal.js';
import * as isaacGifts from './mechanics/isaacGifts.js';
import { amara } from './characters/amara/AmaraCharacter.js';
import { isaac } from './characters/isaac/IsaacCharacter.js';
import { gpsTrackerReveal } from './mechanics/gpsTrackerReveal.js';
import * as endingTrigger from './story/endingTrigger.js';
import * as endingChoiceUI from './ui/endingChoiceUI.js';
import * as publishEnding from './story/endings/publishEnding.js';
import * as buryEnding from './story/endings/buryEnding.js';
import * as returnEnding from './story/endings/returnEnding.js';
import * as victorsChallenge from './story/victorsChallenge.js';
import * as journalUI from './ui/journalUI.js';
import { init as initLoadingScreen } from './ui/loadingScreen.js';
import * as zoneManager from './world/zoneManager.js';
import { scatterGroundCover } from './world/groundCover.js';
import * as zoneSubtitle from './ui/zoneSubtitle.js';
import * as customizationScreen from './ui/customizationScreen.js';
import { asha } from './characters/asha/AshaCharacter.js';

function start() {
  initLoadingScreen();
  if (prefersReducedMotion) {
    document.body.classList.add('prefers-reduced-motion');
  }
  const canvas = document.getElementById('game-canvas');
  const renderer = createRenderer(canvas);
  const scene = createScene();
  const camera = createCamera();

  createSkybox(scene);
  const terrain = createTerrain(scene);
  const weather = createWeather(scene);
  const dayNight = createDayNightCycle(scene);
  createSoundManager();

  zoneManager.init(scene, dayNight.hemiLight);
  scatterGroundCover(scene, terrain);
  asha.init(scene);

  const loop = createLoop(renderer, scene, camera, terrain);
  resourceManager.init();
  const jeep = createJeep(scene);
  const controls = createControls(canvas);
  const dashboard = createDashboard(jeep.group);
  initEngineCut();

  initSaveKeys();
  setJeepRef(jeep.group);

  initShotSystem(resourceManager);
  viewfinderUI.init();
  photoComparison.init();
  dehydrationFX.init();
  lionCharge.init();
  elephantCharge.init();
  flashFlood.init();
  wildfire.init();
  hyenaCamp.init();
  comebackManager.init();
  voiceSystem.init();
  radioMama.init();
  campfireJournal.init();
  isaacGifts.init();
  amara.init(scene, jeep.group);
  isaac.init(scene);
  gpsTrackerReveal.init();
  endingTrigger.init();
  endingChoiceUI.init();
  publishEnding.init();
  buryEnding.init();
  returnEnding.init();
  victorsChallenge.init();
  journalUI.init();
  zoneSubtitle.init();
  customizationScreen.init();

  eventBus.emit('game:start');

  loop.add((delta) => {
    weather.update(delta);
    dayNight.update(delta, weather.getModifiers());
    setGameHour(dayNight.getHour());

    let currentPosition;
    if (isOnFoot()) {
      resetDistanceDrivenThisFrame();
      updateWalk(delta, controls.keys, controls.getLook().yaw);
      const player = getPlayerPosition();
      player.y = terrain.getHeightAt(player.x, player.z);
      eventBus.emit('jeep:positionUpdate', { position: player });
      currentPosition = player;
      asha.setPosition(player.x, player.y, player.z);
    } else {
      applyDriving(delta, controls.keys, jeep.group);
      const ground = terrain.getHeightAt(jeep.group.position.x, jeep.group.position.z);
      jeep.group.position.y = ground + 1;
      currentPosition = jeep.group.position;
    }
    zoneManager.update(currentPosition, weather.getFogFar());
    updateOnFootMode(resourceManager.get(), jeep.group);
    dashboard.update(delta);
    updateChaseCamera(camera, jeep.group, controls.getLook());
  });

  loop.start();

  if (import.meta.env.DEV) {
    window.__WL = {
      jeep: jeep.group,
      getEngineState,
      getSpeed,
      resources: resourceManager,
      isOnFoot,
      animalManager: loop.animalManager,
      eventBus,
      amara,
      isaac,
      asha,
      scene,
      dayNight,
    };
    window.eventBus = eventBus;
    console.log('[WL] Phase 12 running — zone identity system, Asha customization');
  }
}

start();
