/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl } from 'howler';
import { eventBus } from '../utils/eventBus.js';

// Ambient wind layer. Howler auto-unlocks audio on the first user gesture,
// so play() here is safely queued until the browser allows it.
const WIND_VOLUME = {
  clear: 0.3,
  overcast: 0.5,
  storm: 0.85,
};
const FADE_MS = 2000;

export function createSoundManager() {
  const wind = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/wind.mp3`],
    loop: true,
    volume: WIND_VOLUME.clear,
    html5: false,
    onloaderror: () => {
      console.warn('[ASSET MISSING] audio/wind.mp3 — wind layer disabled');
    },
  });
  wind.play();

  const unsubscribe = eventBus.on('weather:changed', (state) => {
    const target = WIND_VOLUME[state] ?? WIND_VOLUME.clear;
    wind.fade(wind.volume(), target, FADE_MS);
  });

  return {
    wind,
    dispose() {
      unsubscribe();
      wind.unload();
    },
  };
}
