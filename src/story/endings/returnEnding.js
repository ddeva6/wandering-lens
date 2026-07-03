/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';
import { Howl } from 'howler';

function runEndingSequence() {
  const overlay = document.createElement('div');
  overlay.className = 'return-ending-overlay';

  const style = document.createElement('style');
  style.textContent = `
    .return-ending-overlay {
      position: fixed;
      inset: 0;
      z-index: 500;
      background: black;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: monospace;
      font-size: 16px;
      line-height: 1.6;
      text-align: center;
      padding: 40px;
      opacity: 0;
      transition: opacity 2s;
    }
    .return-text {
      max-width: 600px;
      min-height: 120px;
    }
  `;
  document.head.appendChild(style);

  const textContainer = document.createElement('div');
  textContainer.className = 'return-text';

  overlay.appendChild(textContainer);
  document.body.appendChild(overlay);

  setTimeout(() => { overlay.style.opacity = '1'; }, 1000);

  // Phase A: The act
  setTimeout(() => {
    eventBus.emit('ui:subtitle', {
      text: "My grandmother waited thirty years for someone to bring this back. She died waiting. I'll carry it for her.",
      duration: 8000,
      speaker: 'Amara'
    });
    eventBus.emit('story:giveJournalToAmara');
  }, 5000);

  // Phase B: The community
  setTimeout(() => {
    eventBus.emit('world:spawnMaasaiCommunity');

    textContainer.innerHTML = "The legal process will take years.<br>The land does not wait for legal processes.<br>They begin immediately.";

    const fireAudio = new Howl({
      src: [`${import.meta.env.BASE_URL}audio/fire_crackling.mp3`],
      loop: true,
      onloaderror: () => eventBus.emit('audio:ambientFire')
    });
    fireAudio.play();

  }, 20000);

  // Phase C: Asha leaves
  setTimeout(() => {
    eventBus.emit('jeep:driveAwayEast');
    textContainer.style.opacity = '0';

    const radioFinal = new Howl({
      src: [`${import.meta.env.BASE_URL}audio/radio_mama_final_return.mp3`],
      onloaderror: () => console.warn('[ASSET MISSING] radio_mama_final_return.mp3')
    });
    radioFinal.play();

    eventBus.emit('ui:subtitle', {
      text: "City child. You found what your grandfather was looking for. It wasn't in the film. It was in the people. Safe travels. Radio Mama out. For the last time.",
      duration: 10000,
      speaker: 'Radio Mama'
    });
  }, 40000);

  // Phase D: Post-credits world
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      style.remove();
      setupPostCreditsWorld();
    }, 2000);
  }, 60000);
}

function setupPostCreditsWorld() {
  const silenceText = document.createElement('div');
  silenceText.style.position = 'fixed';
  silenceText.style.inset = '0';
  silenceText.style.display = 'flex';
  silenceText.style.alignItems = 'center';
  silenceText.style.justifyContent = 'center';
  silenceText.style.color = 'white';
  silenceText.style.fontFamily = 'sans-serif';
  silenceText.style.fontSize = '18px';
  silenceText.style.zIndex = '600';
  silenceText.style.opacity = '0';
  silenceText.style.transition = 'opacity 2s';
  silenceText.textContent = "The land remembers who has always known it.";
  document.body.appendChild(silenceText);

  setTimeout(() => {
    silenceText.style.opacity = '1';
  }, 1000);

  setTimeout(() => {
    silenceText.style.opacity = '0';
    setTimeout(() => silenceText.remove(), 2000);
  }, 9000);

  eventBus.emit('story:endingComplete', { ending: 'return' });
}

export function init() {
  eventBus.on('story:endingChosen', ({ ending }) => {
    if (ending === 'return') {
      runEndingSequence();
    }
  });
}
