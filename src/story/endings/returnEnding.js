/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl } from 'howler';
import { CylinderGeometry, MeshStandardMaterial, Mesh, PointLight, BoxGeometry } from 'three';
import { eventBus } from '../../utils/eventBus.js';
import { moveToward, randomInRadius, lerp } from '../../utils/mathUtils.js';
import { amara } from '../../characters/amara/AmaraCharacter.js';
import { getJeepRef } from '../../jeep/jeepPhysics.js';
import { holdCameraOn } from '../../core/camera.js';
import { getEndingScene, showFadeLine, showTypewriterText } from './endingUtils.js';

const MAASAI_COUNT = 6;
const GATHER_RADIUS = 8;
const FIRE_INTENSITY = 2;
const FIRE_DISTANCE = 15;
const JOURNAL_MOVE_S = 3;
const TICK_MS = 100;

const AMARA_LINE = "My grandmother waited thirty years for someone to bring this back. She died waiting. I'll carry it for her.";
const PHASE_B_TEXT = 'The legal process will take years. The land does not wait for legal processes. They begin immediately.';
const RADIO_MAMA_FINAL = 'City child. You found what your grandfather was looking for. It wasn\'t in the film. It was in the people. Safe travels. Radio Mama out. For the last time.';
const FINAL_LINE = 'The land remembers who has always known it.';

function moveJournalToAmara(fromPos, onDone) {
  const book = new Mesh(new BoxGeometry(0.25, 0.05, 0.35), new MeshStandardMaterial({ color: 0x6b4a2a }));
  book.position.set(fromPos.x, 1, fromPos.z);
  getEndingScene()?.add(book);

  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += TICK_MS / 1000;
    const t = Math.min(1, elapsed / JOURNAL_MOVE_S);
    book.position.x = lerp(fromPos.x, amara.mesh.position.x, t);
    book.position.z = lerp(fromPos.z, amara.mesh.position.z, t);
    if (t >= 1) {
      clearInterval(interval);
      onDone();
    }
  }, TICK_MS);
}

function spawnGathering(scene) {
  const centre = amara.mesh.position;
  for (let i = 0; i < MAASAI_COUNT; i += 1) {
    const spot = randomInRadius(centre.x, centre.z, GATHER_RADIUS);
    const figure = new Mesh(
      new CylinderGeometry(0.35, 0.4, 1.7, 8),
      new MeshStandardMaterial({ color: 0xb03a2a, roughness: 0.9 })
    );
    figure.position.set(spot.x, 0.85, spot.z);
    scene.add(figure);
  }

  const fire = new PointLight(0xff6b00, FIRE_INTENSITY, FIRE_DISTANCE);
  fire.position.set(centre.x, 0.5, centre.z);
  scene.add(fire);
  const flicker = setInterval(() => {
    fire.intensity = Math.sin(Date.now() * 0.01) * 0.5 + 1.5;
  }, TICK_MS);

  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/fire_crackling.mp3`],
    loop: true,
    onloaderror: () => console.warn('[ASSET MISSING] audio/fire_crackling.mp3'),
  });
  sound.play();

  return () => clearInterval(flicker);
}

function driveAwayEast(onDone) {
  const jeep = getJeepRef();
  const groupPos = { ...amara.mesh.position };
  if (!jeep) {
    onDone();
    return;
  }
  const sunrisePoint = { x: groupPos.x + 400, z: groupPos.z + 100 };
  holdCameraOn(
    { x: groupPos.x, y: 15, z: groupPos.z + 40 },
    { x: groupPos.x, y: 0, z: groupPos.z },
    20000
  );

  const interval = setInterval(() => {
    const arrived = moveToward(jeep, sunrisePoint, 40, TICK_MS / 1000, 3);
    if (arrived) {
      clearInterval(interval);
      onDone();
    }
  }, TICK_MS);
}

function runReturnEnding() {
  eventBus.emit('controls:freeze');
  const jeep = getJeepRef();
  const startPos = jeep ? { x: jeep.position.x, z: jeep.position.z } : { x: 0, z: 0 };

  setTimeout(() => {
    showTypewriterText(AMARA_LINE, { holdMs: 2000, className: 'ending-typewriter amara-voice' });
    moveJournalToAmara(startPos, () => {
      setTimeout(() => {
        // The fire (and its flicker interval) is meant to burn indefinitely
        // in the post-credits world, so its cleanup handle is intentionally
        // never called.
        const scene = getEndingScene();
        if (scene) spawnGathering(scene);
        showTypewriterText(PHASE_B_TEXT, { holdMs: 2000 });

        setTimeout(() => {
          driveAwayEast(() => {
            const sound = new Howl({
              src: [`${import.meta.env.BASE_URL}audio/radio_mama_final.mp3`],
              onloaderror: () => console.warn('[ASSET MISSING] audio/radio_mama_final.mp3'),
            });
            sound.play();
            showTypewriterText(RADIO_MAMA_FINAL, { holdMs: 3000 });

            setTimeout(() => {
              showFadeLine(FINAL_LINE, { holdMs: 8000 });
              eventBus.emit('story:endingComplete', { ending: 'return' });
              eventBus.emit('controls:unfreeze');
            }, 4000);
          });
        }, 20000);
      }, 3000);
    });
  }, 5000);
}

export function init() {
  eventBus.on('story:endingChosen', ({ ending }) => {
    if (ending === 'return') runReturnEnding();
  });
}
