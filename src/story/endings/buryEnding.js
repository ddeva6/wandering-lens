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
  overlay.className = 'bury-ending-overlay';

  const style = document.createElement('style');
  style.textContent = `
    .bury-ending-overlay {
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
    .bury-text {
      max-width: 600px;
      min-height: 120px;
    }
  `;
  document.head.appendChild(style);

  const textContainer = document.createElement('div');
  textContainer.className = 'bury-text';

  overlay.appendChild(textContainer);
  document.body.appendChild(overlay);

  // Phase A: The act
  // We trigger camera/jeep move in world, but since we can't easily manipulate here without refs,
  // we emit an event that main or comebackManager could pick up, OR we simulate the passage of time here.
  eventBus.emit('jeep:forceMove', { x: 80, y: -0.5, z: 180, duration: 2000 }); // simulated lowering

  setTimeout(() => { overlay.style.opacity = '1'; }, 1000);

  const text1 = "You put it back. Exactly where he left it. The coordinates will decay with the paper. The evidence will become the earth. Isaac will never know you found it.";

  let i = 0;
  function typeWriter1() {
    if (i < text1.length) {
      textContainer.textContent += text1.charAt(i);
      i++;
      setTimeout(typeWriter1, 40);
    }
  }

  setTimeout(typeWriter1, 2000);

  // Phase B: The elephant
  setTimeout(() => {
    textContainer.textContent = "";
    eventBus.emit('animal:forceElephantHerd', { target: { x: 80, z: 180 }, duration: 25000 });

    setTimeout(() => {
      textContainer.style.opacity = '1';
      textContainer.innerHTML = "They come here sometimes.<br>No one knows why. Victor wrote about it in 1979.<br>He never found an explanation that satisfied him.";
    }, 5000);
  }, 20000);

  // Phase C: Post-credits world
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      style.remove();
      setupPostCreditsWorld();
    }, 2000);
  }, 45000);
}

function setupPostCreditsWorld() {
  eventBus.emit('world:removeMediaJeepsAndMarkers');
  eventBus.emit('world:setAnimalVolume', { volume: 0.6 });
  eventBus.emit('world:forceNightfall');

  const victorFinalEcho = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/victor/victor_08_final.mp3`],
    volume: 0.3,
    onloaderror: () => console.warn('[ASSET MISSING] victor_08_final.mp3')
  });
  victorFinalEcho.play();

  setTimeout(() => {
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
    silenceText.textContent = "Some things are protected by being unknown.";
    document.body.appendChild(silenceText);

    setTimeout(() => {
      silenceText.style.opacity = '1';
    }, 1000);

    setTimeout(() => {
      silenceText.style.opacity = '0';
      setTimeout(() => silenceText.remove(), 2000);
    }, 9000);
  }, 15000);

  eventBus.emit('story:endingComplete', { ending: 'bury' });
}

export function init() {
  eventBus.on('story:endingChosen', ({ ending }) => {
    if (ending === 'bury') {
      runEndingSequence();
    }
  });
}
