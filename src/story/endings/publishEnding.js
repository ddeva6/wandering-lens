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
  overlay.className = 'publish-ending-overlay';

  const style = document.createElement('style');
  style.textContent = `
    .publish-ending-overlay {
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
    }
    .publish-hands {
      width: 120px;
      height: 120px;
      margin-bottom: 40px;
      opacity: 0;
      transition: opacity 2s;
    }
    .publish-text {
      max-width: 600px;
      min-height: 120px;
    }
    .publish-time-fade {
      position: fixed;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 5s ease-in-out;
      z-index: 501;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  const handsIcon = document.createElement('div');
  handsIcon.className = 'publish-hands';
  handsIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;

  const textContainer = document.createElement('div');
  textContainer.className = 'publish-text';

  overlay.appendChild(handsIcon);
  overlay.appendChild(textContainer);
  document.body.appendChild(overlay);

  setTimeout(() => { handsIcon.style.opacity = '1'; }, 1000);

  const text1 = "You photograph the evidence. Victor's last journal entry. The coordinates. Isaac's name. You address it to Margaret Osei — Victor's original editor. The one who published his first photograph in 1974.";
  const text2 = "You find a way to send it. You don't wait to see what happens.";

  let i = 0;
  function typeWriter1() {
    if (i < text1.length) {
      textContainer.textContent += text1.charAt(i);
      i++;
      setTimeout(typeWriter1, 40);
    }
  }

  setTimeout(typeWriter1, 2000);

  setTimeout(() => {
    textContainer.textContent = "";
    i = 0;
    function typeWriter2() {
      if (i < text2.length) {
        textContainer.textContent += text2.charAt(i);
        i++;
        setTimeout(typeWriter2, 50);
      }
    }
    typeWriter2();
  }, 10000);

  setTimeout(() => {
    handsIcon.style.opacity = '0';
    textContainer.style.opacity = '0';

    const timeFade = document.createElement('div');
    timeFade.className = 'publish-time-fade';
    document.body.appendChild(timeFade);

    timeFade.style.backgroundColor = '#d98a4a'; // Dawn
    timeFade.style.opacity = '1';

    setTimeout(() => {
      timeFade.style.backgroundColor = '#87ceeb'; // Noon
    }, 5000);

    setTimeout(() => {
      timeFade.style.backgroundColor = '#c4552d'; // Dusk
    }, 10000);

    setTimeout(() => {
      timeFade.style.opacity = '0';
      overlay.style.opacity = '0';
      setTimeout(() => {
        timeFade.remove();
        overlay.remove();
        style.remove();
        setupPostCreditsWorld();
      }, 2000);
    }, 15000);

  }, 20000);
}

function setupPostCreditsWorld() {
  eventBus.emit('world:spawnMediaJeeps');
  eventBus.emit('world:spawnStationSign');

  const radioFinal = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/radio_mama_final.mp3`],
    onloaderror: () => console.warn('[ASSET MISSING] radio_mama_final.mp3')
  });
  radioFinal.play();

  eventBus.emit('ui:subtitle', {
    text: "City child. Your grandfather would be loud today. He was never quiet when he was right. The name is on the maps now. It's permanent. Radio Mama out. For the last time.",
    duration: 10000,
    speaker: 'Radio Mama'
  });

  const victorText = document.createElement('div');
  victorText.style.position = 'fixed';
  victorText.style.bottom = '40px';
  victorText.style.width = '100%';
  victorText.style.textAlign = 'center';
  victorText.style.fontFamily = "'Caveat', cursive";
  victorText.style.fontSize = '24px';
  victorText.style.color = 'white';
  victorText.style.zIndex = '600';
  victorText.style.opacity = '0';
  victorText.style.transition = 'opacity 2s';
  victorText.innerHTML = `Victor Osei Mensah — 1948–1994<br><span style="font-size: 18px; font-family: sans-serif;">Photographer. The record is permanent.</span>`;
  document.body.appendChild(victorText);

  setTimeout(() => {
    victorText.style.opacity = '1';
  }, 2000);

  setTimeout(() => {
    victorText.style.opacity = '0';
    setTimeout(() => victorText.remove(), 2000);
  }, 12000);

  eventBus.emit('story:endingComplete', { ending: 'publish' });
}

export function init() {
  eventBus.on('story:endingChosen', ({ ending }) => {
    if (ending === 'publish') {
      runEndingSequence();
    }
  });
}
