/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Color, DirectionalLight, HemisphereLight } from 'three';
import { isMobile } from '../core/renderer.js';
import { eventBus } from '../utils/eventBus.js';

// Full day/night cycle: one in-game day passes in 4 real minutes.
const REAL_SECONDS_PER_CYCLE = 4 * 60;
const SUN_DISTANCE = 800;

const DAWN_START = 5 / 24;
const DAY_START = 8 / 24;
const DUSK_START = 17 / 24;
const NIGHT_START = 20 / 24;

const NIGHT = new Color(0x0a0e1a);
const DAWN = new Color(0xd98a4a);
const DAY = new Color(0x87ceeb);
const DUSK = new Color(0xc4552d);

export function createDayNightCycle(scene, startTimeOfDay = 6.5 / 24) {
  // timeOfDay: 0..1 where 0 is midnight and 0.5 is noon
  let timeOfDay = startTimeOfDay;
  const sky = new Color();

  const sun = new DirectionalLight(0xfff2dd, 2);
  const hemi = new HemisphereLight(0x87ceeb, 0x4a3b28, 0.5);
  scene.add(sun, hemi);

  let playerPosition = { x: 0, z: 0 };
  let lastFogPos = { x: -Infinity, z: -Infinity };

  eventBus.on('jeep:positionUpdate', ({ position }) => {
    playerPosition = position;
  });

  function skyColourAt(t) {
    if (t < DAWN_START) return sky.copy(NIGHT);
    if (t < DAY_START) {
      return sky.lerpColors(NIGHT, DAY, (t - DAWN_START) / (DAY_START - DAWN_START)).lerp(DAWN, 0.3);
    }
    if (t < DUSK_START) return sky.copy(DAY);
    if (t < NIGHT_START) {
      return sky.lerpColors(DAY, NIGHT, (t - DUSK_START) / (NIGHT_START - DUSK_START)).lerp(DUSK, 0.3);
    }
    return sky.copy(NIGHT);
  }

  function update(delta, modifiers = { lightFactor: 1, skyTint: 1 }) {
    timeOfDay = (timeOfDay + delta / REAL_SECONDS_PER_CYCLE) % 1;

    // Sun rises at 06:00 (t = 0.25) and peaks at noon (t = 0.5).
    const angle = (timeOfDay - 0.25) * Math.PI * 2;
    sun.position.set(
      Math.cos(angle) * SUN_DISTANCE,
      Math.sin(angle) * SUN_DISTANCE,
      SUN_DISTANCE * 0.3
    );
    const elevation = Math.max(Math.sin(angle), 0);
    sun.intensity = elevation * 2.5 * modifiers.lightFactor;
    hemi.intensity = (0.08 + elevation * 0.5) * modifiers.lightFactor;

    skyColourAt(timeOfDay).multiplyScalar(modifiers.skyTint);
    if (scene.background instanceof Color) scene.background.copy(sky);

    let shouldUpdateFog = true;
    if (isMobile) {
      const dist = Math.hypot(playerPosition.x - lastFogPos.x, playerPosition.z - lastFogPos.z);
      if (dist <= 5) {
        shouldUpdateFog = false;
      } else {
        lastFogPos = { x: playerPosition.x, z: playerPosition.z };
      }
    }
    if (shouldUpdateFog && scene.fog) scene.fog.color.copy(sky);
  }

  return {
    update,
    getTimeOfDay: () => timeOfDay,
    getHour: () => timeOfDay * 24,
    dispose() {
      scene.remove(sun, hemi);
      sun.dispose();
      hemi.dispose();
    },
  };
}
