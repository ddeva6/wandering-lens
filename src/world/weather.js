/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Fog } from 'three';
import { eventBus } from '../utils/eventBus.js';
import { isMobile } from '../core/renderer.js';

// Weather stub: three states that tint the sky, dim the sun and pull the
// fog in. Visual effects (rain, lightning) come in a later phase.
export const WEATHER_STATES = {
  CLEAR: 'clear',
  OVERCAST: 'overcast',
  STORM: 'storm',
};

const SETTINGS = {
  [WEATHER_STATES.CLEAR]: { fogFar: 1800, lightFactor: 1, skyTint: 1 },
  [WEATHER_STATES.OVERCAST]: { fogFar: 1000, lightFactor: 0.55, skyTint: 0.65 },
  [WEATHER_STATES.STORM]: { fogFar: 450, lightFactor: 0.3, skyTint: 0.4 },
};

// Weighted pool the next state is drawn from — clear skies dominate.
const POOL = [
  WEATHER_STATES.CLEAR,
  WEATHER_STATES.CLEAR,
  WEATHER_STATES.CLEAR,
  WEATHER_STATES.OVERCAST,
  WEATHER_STATES.OVERCAST,
  WEATHER_STATES.STORM,
];

const MIN_DURATION = 60;
const MAX_DURATION = 150;
const LERP_RATE = 0.5;

function nextDuration() {
  return MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);
}

export function createWeather(scene) {
  let state = WEATHER_STATES.CLEAR;
  let timer = nextDuration();
  const modifiers = { lightFactor: 1, skyTint: 1 };
  // Tracked independently of scene.fog.far so zoneManager.js can blend its
  // own contribution into scene.fog.far without corrupting the value this
  // easing converges toward next frame.
  let currentFogFar = SETTINGS[state].fogFar;

  scene.fog = new Fog(0x87ceeb, 50, currentFogFar);

  let playerPosition = { x: 0, z: 0 };
  let lastFogPos = { x: -Infinity, z: -Infinity };

  eventBus.on('jeep:positionUpdate', ({ position }) => {
    playerPosition = position;
  });

  function update(delta) {
    timer -= delta;
    if (timer <= 0) {
      timer = nextDuration();
      const next = POOL[Math.floor(Math.random() * POOL.length)];
      if (next !== state) {
        state = next;
        eventBus.emit('weather:changed', state);
        if (import.meta.env.DEV) console.log(`[WEATHER] → ${state}`);
      }
    }

    // Ease the visuals toward the active state so changes roll in.
    const target = SETTINGS[state];
    const k = 1 - Math.exp(-delta * LERP_RATE);
    modifiers.lightFactor += (target.lightFactor - modifiers.lightFactor) * k;
    modifiers.skyTint += (target.skyTint - modifiers.skyTint) * k;
    // Wildfire crisis events take temporary direct control of fog.far for
    // the "visibility cut to ~15m" effect — skip our own easing until they
    // hand control back, or every render frame would fight their override.
    if (!scene.fog.wildfireOverride) {
      let shouldUpdateFog = true;
      if (isMobile) {
        const dist = Math.hypot(playerPosition.x - lastFogPos.x, playerPosition.z - lastFogPos.z);
        if (dist <= 5) {
          shouldUpdateFog = false;
        } else {
          lastFogPos = { x: playerPosition.x, z: playerPosition.z };
        }
      }
      if (shouldUpdateFog) {
        currentFogFar += (target.fogFar - currentFogFar) * k;
        scene.fog.far = currentFogFar;
      }
    }
  }

  return {
    update,
    getState: () => state,
    getModifiers: () => modifiers,
    getFogFar: () => currentFogFar,
    dispose() {
      scene.fog = null;
    },
  };
}
