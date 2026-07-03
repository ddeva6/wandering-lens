/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl, Howler } from 'howler';
import { eventBus } from '../../utils/eventBus.js';
import { moveToward } from '../../utils/mathUtils.js';
import { getAnimalManager } from '../../animals/AnimalManager.js';
import { getJeepRef } from '../../jeep/jeepPhysics.js';
import { getEndingScene, showTypewriterText, showFadeLine } from './endingUtils.js';

const VICTOR_CAMP_POSITION = { x: 80, z: 180 };
const DRIVE_KMH = 25;
const KNEEL_DURATION_S = 2;
const KNEEL_DEPTH = 0.5;
const TICK_MS = 100;

const PHASE_A_TEXT =
  "You put it back. Exactly where he left it. The coordinates will decay with the paper. The evidence will become the earth. Isaac will never know you found it.";
const PHASE_B_TEXT =
  'They come here sometimes. No one knows why. Victor wrote about it in 1979. He never found an explanation that satisfied him.';
const FINAL_LINE = 'Some things are protected by being unknown.';

function driveToCampThenKneel(onDone) {
  const jeep = getJeepRef();
  if (!jeep) {
    onDone();
    return;
  }
  const baseY = jeep.position.y;
  const driveInterval = setInterval(() => {
    const arrived = moveToward(jeep, VICTOR_CAMP_POSITION, DRIVE_KMH, TICK_MS / 1000, 2);
    if (arrived) {
      clearInterval(driveInterval);
      let kneelElapsed = 0;
      const kneelInterval = setInterval(() => {
        kneelElapsed += TICK_MS / 1000;
        const t = Math.min(1, kneelElapsed / KNEEL_DURATION_S);
        jeep.position.y = baseY - KNEEL_DEPTH * t;
        if (t >= 1) {
          clearInterval(kneelInterval);
          onDone();
        }
      }, TICK_MS);
    }
  }, TICK_MS);
}

function walkHerdToCamp(onDone) {
  const animalManager = getAnimalManager();
  const herd = animalManager?.elephantHerd;
  if (!herd) {
    onDone();
    return;
  }
  herd.members.forEach((member, i) => {
    const angle = (i / herd.members.length) * Math.PI * 2;
    member.walkTo({
      x: VICTOR_CAMP_POSITION.x + Math.cos(angle) * 12,
      z: VICTOR_CAMP_POSITION.z + Math.sin(angle) * 12,
    });
  });
  setTimeout(onDone, 25000);
}

function playDistantFinalRecording() {
  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/victor/victor_08_final.mp3`],
    volume: 0.15,
    onloaderror: () => console.warn('[ASSET MISSING] audio/victor/victor_08_final.mp3 (echo replay)'),
  });
  sound.play();
}

function runBuryEnding() {
  eventBus.emit('controls:freeze');

  driveToCampThenKneel(() => {
    showTypewriterText(PHASE_A_TEXT, { holdMs: 2000 });

    walkHerdToCamp(() => {
      showTypewriterText(PHASE_B_TEXT, { holdMs: 3000 });

      setTimeout(() => {
        const scene = getEndingScene();
        // No dedicated animal-sound bus exists to target specifically, so
        // the overall mix is brought down as the closest available proxy
        // for "the scene is quieter" ambient sound.
        Howler.volume(Howler.volume() * 0.6);
        if (scene?.background?.isColor) {
          scene.background.set(0x0a0e1a);
        }

        playDistantFinalRecording();

        setTimeout(() => {
          showFadeLine(FINAL_LINE, { holdMs: 8000 });
          eventBus.emit('story:endingComplete', { ending: 'bury' });
          eventBus.emit('controls:unfreeze');
        }, 6000);
      }, 2000);
    });
  });
}

export function init() {
  eventBus.on('story:endingChosen', ({ ending }) => {
    if (ending === 'bury') runBuryEnding();
  });
}
