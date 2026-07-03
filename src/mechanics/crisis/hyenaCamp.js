/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl } from 'howler';
import { eventBus } from '../../utils/eventBus.js';
import { save, load } from '../../utils/localStorage.js';
import { getGameHour } from '../../world/dayNight.js';
import { distance2D } from '../../utils/mathUtils.js';
import { startCampfireGame } from './campfireGame.js';

const NIGHT_START = 21;
const NIGHT_END = 23;
const CAMP_POSITION = { x: 0, z: 0 };
const CAMP_RADIUS = 50;
const VOLUME_RAMP_S = 30;

let playerPosition = { x: 0, z: 0 };
eventBus.on('jeep:positionUpdate', ({ position }) => {
  playerPosition = position;
});

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function playHyenaAudio() {
  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/hyena.mp3`],
    loop: true,
    volume: 0,
    onloaderror: () => console.warn('[ASSET MISSING] audio/hyena.mp3'),
  });
  sound.play();
  sound.fade(0, 0.7, VOLUME_RAMP_S * 1000);
  return sound;
}

function showFailureText() {
  const el = document.createElement('p');
  el.className = 'fire-subtitle';
  el.textContent = 'You retreated to the jeep. The journal entries from tonight are lost.';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5500);
}

function startHyenaCamp() {
  eventBus.emit('crisis:hyenaStart');
  const sound = playHyenaAudio();

  startCampfireGame(
    () => {
      eventBus.emit('crisis:survived', { type: 'hyenaCamp' });
      sound.fade(sound.volume(), 0, 2000);
      setTimeout(() => sound.stop(), 2000);
      save('campfire_journal_unlocked', todayKey());
    },
    () => {
      sound.fade(sound.volume(), 0.9, 200);
      setTimeout(() => sound.fade(0.9, 0, 800), 300);
      setTimeout(() => sound.stop(), 1200);

      const blackout = document.createElement('div');
      blackout.className = 'hyena-blackout';
      document.body.appendChild(blackout);
      setTimeout(() => blackout.remove(), 900);

      eventBus.emit('crisis:hyenaFailed');
      eventBus.emit('mission:fail', { reason: 'hyenaCamp' });
      eventBus.emit('controls:freeze');
      setTimeout(() => eventBus.emit('controls:unfreeze'), 2000);
      showFailureText();
      eventBus.emit('story:journalUnlockCleared', { night: todayKey() });
    }
  );
}

export function init() {
  let lastCheckedNight = null;
  eventBus.on('resource:update', () => {
    const hour = getGameHour();
    if (hour < NIGHT_START || hour >= NIGHT_END) return;
    if (distance2D(playerPosition, CAMP_POSITION) > CAMP_RADIUS) return;

    const night = todayKey();
    if (lastCheckedNight === night || load('hyena_night', null) === night) return;
    lastCheckedNight = night;
    save('hyena_night', night);
    startHyenaCamp();
  });
}
