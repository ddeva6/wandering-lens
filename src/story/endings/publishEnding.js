/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl } from 'howler';
import {
  Group,
  BoxGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  Mesh,
  CanvasTexture,
} from 'three';
import { eventBus } from '../../utils/eventBus.js';
import { getEndingScene, showTypewriterText, crossfadeStills } from './endingUtils.js';

const AMARA_STATION_POSITION = { x: 520, z: 60 };
const MEDIA_JEEP_POSITIONS = [
  { x: -100, z: 500 },
  { x: 0, z: 520 },
  { x: 100, z: 505 },
];
const PHASE_A_LINE_1 =
  "You photograph the evidence. Victor's last journal entry. The coordinates. Isaac's name. You address it to Margaret Osei — Victor's original editor. The one who published his first photograph in 1974.";
const PHASE_A_LINE_2 = "You find a way to send it. You don't wait to see what happens.";
const STILL_COLORS = ['#d98a4a', '#87ceeb', '#c4552d'];

function spawnMediaJeeps(scene) {
  MEDIA_JEEP_POSITIONS.forEach((pos) => {
    const jeep = new Mesh(
      new BoxGeometry(2, 1.5, 4.2),
      new MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 })
    );
    jeep.position.set(pos.x, 0.75, pos.z);
    scene.add(jeep);
  });
}

function createSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2a3a2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f0f0e0';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OSEI-MENSAH', canvas.width / 2, 45);
  ctx.font = '24px sans-serif';
  ctx.fillText('CONSERVATION ZONE', canvas.width / 2, 90);
  return new CanvasTexture(canvas);
}

function spawnRangerStation(scene) {
  const group = new Group();
  group.position.set(AMARA_STATION_POSITION.x, 1.2, AMARA_STATION_POSITION.z);
  const sign = new Mesh(new PlaneGeometry(3, 0.8), new MeshBasicMaterial({ map: createSignTexture() }));
  group.add(sign);
  scene.add(group);
}

function playRadioMamaFinalCall() {
  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/radio_mama_final.mp3`],
    onloaderror: () => console.warn('[ASSET MISSING] audio/radio_mama_final.mp3'),
  });
  sound.play();
  showTypewriterText(
    "City child. Your grandfather would be loud today. He was never quiet when he was right. The name is on the maps now. It's permanent. Radio Mama out. For the last time.",
    { holdMs: 4000 }
  );
}

function showVictorSignature() {
  const el = document.createElement('div');
  el.className = 'ending-signature';
  el.innerHTML = `
    <p class="ending-signature-name">Victor Osei Mensah — 1948–1994</p>
    <p class="ending-signature-line">Photographer. The record is permanent.</p>
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('ending-signature--visible'));
}

function runPublishEnding() {
  eventBus.emit('controls:freeze');
  showTypewriterText(PHASE_A_LINE_1, { holdMs: 2000 });
  setTimeout(() => showTypewriterText(PHASE_A_LINE_2, { holdMs: 3000 }), 8000);

  setTimeout(() => crossfadeStills(STILL_COLORS, 5000), 20000);

  setTimeout(() => {
    const scene = getEndingScene();
    if (scene) {
      spawnMediaJeeps(scene);
      spawnRangerStation(scene);
    }
    playRadioMamaFinalCall();
    showVictorSignature();
    eventBus.emit('story:endingComplete', { ending: 'publish' });
    eventBus.emit('controls:unfreeze');
  }, 35000);
}

export function init() {
  eventBus.on('story:endingChosen', ({ ending }) => {
    if (ending === 'publish') runPublishEnding();
  });
}
