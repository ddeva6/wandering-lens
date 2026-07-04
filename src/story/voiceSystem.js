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
import { getEngineState } from '../jeep/engineCut.js';
import { getAnimalManager } from '../animals/AnimalManager.js';
import { distance2D } from '../utils/mathUtils.js';
import { copy } from './copy.js';

const GIRAFFE_TRIGGER_RANGE = 40;
const DAWN_HOUR = 6;

const FADE_IN_S = 0.3;
const HOLD_EXTRA_MS = 200;
const FADE_OUT_S = 0.5;
const WORDS_PER_SECOND = 2.5;
const FINAL_RECORDING_FILE = 'victor_08_final.mp3';
const FINAL_SLOW_FACTOR = 0.3;
const FINAL_DESATURATE_PERCENT = 30;
const FINAL_RESTORE_S = 8;

function showSubtitle(text, durationMs) {
  const el = document.createElement('p');
  el.className = 'victor-subtitle';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('role', 'status');
  el.textContent = text;
  el.style.transitionDuration = `${FADE_IN_S}s`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('victor-subtitle--visible'));

  setTimeout(() => {
    el.style.transitionDuration = `${FADE_OUT_S}s`;
    el.classList.remove('victor-subtitle--visible');
    setTimeout(() => el.remove(), FADE_OUT_S * 1000);
  }, durationMs);
}

// Read by core/loop.js each frame to scale delta during the final
// recording's slow-motion beat.
let timeScale = 1;
export function getTimeScale() {
  return timeScale;
}

function applyFinalRecordingEffect() {
  const canvas = document.getElementById('game-canvas');
  document.body.classList.add('victor-final-slowmo');
  if (canvas) canvas.style.filter = `saturate(${FINAL_DESATURATE_PERCENT}%)`;
  timeScale = FINAL_SLOW_FACTOR;

  return () => {
    const start = Date.now();
    const restoreInterval = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / (FINAL_RESTORE_S * 1000));
      timeScale = FINAL_SLOW_FACTOR + (1 - FINAL_SLOW_FACTOR) * t;
      if (canvas) canvas.style.filter = `saturate(${FINAL_DESATURATE_PERCENT + (100 - FINAL_DESATURATE_PERCENT) * t}%)`;
      if (t >= 1) {
        clearInterval(restoreInterval);
        document.body.classList.remove('victor-final-slowmo');
        if (canvas) canvas.style.filter = '';
      }
    }, 100);
  };
}

function playRecording(recording) {
  const played = load('played_recordings', []);
  if (played.includes(recording.id)) return;

  const isFinal = recording.audioFile === FINAL_RECORDING_FILE;
  const restoreFinalEffect = isFinal ? applyFinalRecordingEffect() : null;

  const wordCount = recording.text.trim().split(/\s+/).length;
  const fallbackDurationMs = (wordCount / WORDS_PER_SECOND) * 1000;

  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/victor/${recording.audioFile}`],
    onloaderror: () => {
      console.warn(`[ASSET MISSING] audio/victor/${recording.audioFile}`);
      showSubtitle(recording.text, fallbackDurationMs);
      if (restoreFinalEffect) setTimeout(restoreFinalEffect, fallbackDurationMs);
    },
    onend: () => {
      if (restoreFinalEffect) restoreFinalEffect();
    },
  });

  sound.once('load', () => {
    const durationMs = sound.duration() * 1000 + HOLD_EXTRA_MS;
    showSubtitle(recording.text, durationMs);
    sound.play();
  });

  played.push(recording.id);
  save('played_recordings', played);
}

let playerPosition = { x: 0, z: 0 };
let hasSeenDawn = false;

export function init() {
  Object.values(copy.victorRecordings).forEach((recording) => {
    const trigger = recording.trigger === 'game:start' ? 'game:profileReady' : recording.trigger;
    eventBus.on(trigger, () => playRecording(recording));
  });

  eventBus.on('jeep:positionUpdate', ({ position }) => {
    playerPosition = position;
  });

  // animal:giraffeNear and game:firstDawn have no existing emitter
  // elsewhere in the codebase — self-contained here rather than touching
  // the animal/day-night modules for a single-use story trigger.
  eventBus.on('resource:update', () => {
    const giraffeGroup = getAnimalManager()?.giraffeGroup;
    if (
      giraffeGroup &&
      !getEngineState() &&
      distance2D(playerPosition, giraffeGroup.position) <= GIRAFFE_TRIGGER_RANGE
    ) {
      eventBus.emit('animal:giraffeNear');
    }
  });

  eventBus.on('world:hourChange', ({ hour }) => {
    if (!hasSeenDawn && hour === DAWN_HOUR) {
      hasSeenDawn = true;
      eventBus.emit('game:firstDawn');
    }
  });
}
