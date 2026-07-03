/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl } from 'howler';
import { eventBus } from '../utils/eventBus.js';
import { save, load } from '../utils/localStorage.js';
import { distance2D } from '../utils/mathUtils.js';
import { copy } from './copy.js';

const CHECKIN_HOUR = 18;
const MORNING_HOUR = 6;
const CAMP_POSITION = { x: 0, z: 0 };
const OUT_OF_RANGE_M = 500;
const FADE_OUT_MS = 500;
const WORDS_PER_SECOND = 2.5;

let playerPosition = { x: 0, z: 0 };
eventBus.on('jeep:positionUpdate', ({ position }) => {
  playerPosition = position;
});

const DAY_KEYS = ['checkin_1', 'checkin_2', 'checkin_3', 'checkin_4'];

function checkinForDay(day) {
  if (day >= 1 && day <= DAY_KEYS.length) return copy.radioMama[DAY_KEYS[day - 1]];
  return copy.radioMama.checkin_silence;
}

function showSubtitle(text, durationMs) {
  const el = document.createElement('p');
  el.className = 'victor-subtitle radio-mama-subtitle';
  el.textContent = text;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('victor-subtitle--visible'));
  setTimeout(() => {
    el.classList.remove('victor-subtitle--visible');
    setTimeout(() => el.remove(), FADE_OUT_MS);
  }, durationMs);
}

function playCheckinAudio(day) {
  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/radio_mama_${day}.mp3`],
    onloaderror: () => console.warn(`[ASSET MISSING] audio/radio_mama_${day}.mp3`),
  });
  sound.play();
}

function runCheckin() {
  const day = load('radio_day', 1);
  const checkin = checkinForDay(day);

  if (checkin === copy.radioMama.checkin_silence) {
    eventBus.emit('story:radioMamaSilent');
    eventBus.emit('story:act3Start');
    return;
  }

  if (distance2D(playerPosition, CAMP_POSITION) > OUT_OF_RANGE_M) {
    const missed = load('missed_checkins', []);
    missed.push(day);
    save('missed_checkins', missed);
    save('pending_missed_notification', true);
    return;
  }

  playCheckinAudio(day);
  const wordCount = checkin.text.trim().split(/\s+/).length;
  showSubtitle(checkin.text, (wordCount / WORDS_PER_SECOND) * 1000);
}

export function init() {
  eventBus.on('world:hourChange', ({ hour }) => {
    if (hour === CHECKIN_HOUR) runCheckin();

    if (hour === MORNING_HOUR && load('pending_missed_notification', false)) {
      save('pending_missed_notification', false);
      showSubtitle(copy.subtitles.radioMamaMissed, 4000);
    }
  });

  eventBus.on('world:newDay', () => {
    const day = load('radio_day', 1);
    save('radio_day', day + 1);
  });
}
