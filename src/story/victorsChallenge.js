/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save, load } from '../utils/localStorage.js';
import { victorAttempts } from './victorAttempts.js';

function triggerUnlockSequence() {
  if (load('wl_victors_challenge_unlocked', false)) return;
  save('wl_victors_challenge_unlocked', true);

  const overlay = document.createElement('div');
  overlay.className = 'victor-challenge-unlock-overlay';

  const style = document.createElement('style');
  style.textContent = `
    .victor-challenge-unlock-overlay {
      position: fixed;
      inset: 0;
      z-index: 600;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: sans-serif;
      text-align: center;
      padding: 40px;
    }
    .victor-challenge-unlock-overlay h2 {
      font-size: 24px;
      letter-spacing: 0.1em;
      margin-bottom: 16px;
    }
    .victor-challenge-unlock-overlay p {
      font-size: 16px;
      color: #cccccc;
      max-width: 400px;
      line-height: 1.5;
      margin-bottom: 32px;
    }
    .victor-challenge-unlock-overlay button {
      padding: 12px 24px;
      font-size: 14px;
      background: #ffd700;
      color: black;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);

  overlay.innerHTML = `
    <h2>Victor's Challenge</h2>
    <p>Twelve shots he attempted and never got. Described in his journal. Find them.</p>
    <button>Accept</button>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('button').addEventListener('click', () => {
    save('wl_victors_challenge_active', true);
    overlay.remove();
    style.remove();
  });
}

function showMatchOverlay(entry, shot) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '600';
  overlay.style.background = 'rgba(0,0,0,0.8)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.color = 'white';
  overlay.style.fontFamily = 'sans-serif';
  overlay.style.fontSize = '24px';
  overlay.style.letterSpacing = '0.1em';

  overlay.textContent = "VICTOR'S ATTEMPT — FOUND";
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    eventBus.emit('ui:showPhotoComparison', { shot, entry });
  }, 3000);
}

function checkCompletion() {
  const progress = load('wl_victors_challenge_progress', {});
  const completedCount = Object.keys(progress).length;
  if (completedCount >= 12 && !load('wl_victors_challenge_complete', false)) {
    eventBus.emit('challenge:complete');
  }
}

function playFinalSequence() {
  const overlay = document.createElement('div');
  overlay.className = 'victor-challenge-final-overlay';

  const style = document.createElement('style');
  style.textContent = `
    .victor-challenge-final-overlay {
      position: fixed;
      inset: 0;
      z-index: 700;
      background: black;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: sans-serif;
      text-align: center;
      opacity: 0;
      transition: opacity 3s;
    }
    .victor-film-strip {
      display: flex;
      gap: 10px;
      margin: 40px 0;
    }
    .victor-negative {
      width: 60px;
      height: 40px;
      background: #ccc;
      filter: invert(1) sepia(1);
      opacity: 0;
    }
    .victor-photo {
      width: 400px;
      height: 260px;
      background: white;
      margin: 20px 0;
      display: none;
      animation: develop 10s forwards;
    }
    @keyframes develop {
      from { background: white; }
      to { background: #e6d5c3; border: 10px solid white; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    }
  `;
  document.head.appendChild(style);

  const text1 = document.createElement('div');
  text1.textContent = "Victor's last roll of film. Developed for the first time.";
  text1.style.marginBottom = '20px';
  overlay.appendChild(text1);

  const filmStrip = document.createElement('div');
  filmStrip.className = 'victor-film-strip';
  for(let i=0; i<12; i++) {
    const neg = document.createElement('div');
    neg.className = 'victor-negative';
    filmStrip.appendChild(neg);
  }
  overlay.appendChild(filmStrip);

  const finalPhoto = document.createElement('div');
  finalPhoto.className = 'victor-photo';
  finalPhoto.innerHTML = `<svg viewBox="0 0 400 260" width="100%" height="100%"><rect width="100%" height="100%" fill="none" /><path d="M100 200 Q200 100 300 200 Z" fill="#665040" opacity="0.6"/></svg>`; // Simplified representation
  overlay.appendChild(finalPhoto);

  const finalTexts = document.createElement('div');
  finalTexts.style.display = 'none';
  finalTexts.style.marginTop = '20px';
  finalTexts.innerHTML = `
    <p>He was here. He saw what you saw. He left it for you to finish.</p>
    <p style="font-family: 'Caveat', cursive; font-size: 24px; margin-top: 20px;">Victor Osei Mensah — 1948–1994</p>
  `;
  overlay.appendChild(finalTexts);

  document.body.appendChild(overlay);

  setTimeout(() => { overlay.style.opacity = '1'; }, 100);

  const negatives = filmStrip.querySelectorAll('.victor-negative');
  negatives.forEach((neg, index) => {
    setTimeout(() => {
      neg.style.opacity = '1';
      // mechanical click could go here
    }, 4000 + (index * 500));
  });

  setTimeout(() => {
    filmStrip.style.display = 'none';
    finalPhoto.style.display = 'block';

    setTimeout(() => {
      finalTexts.style.display = 'block';
      save('wl_victors_challenge_complete', true);

      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          style.remove();
        }, 3000);
      }, 10000);
    }, 10000);

  }, 4000 + (12 * 500) + 1000);
}

export function init() {
  eventBus.on('story:endingComplete', triggerUnlockSequence);

  eventBus.on('challenge:shotMatched', ({ entry, shot }) => {
    const progress = load('wl_victors_challenge_progress', {});
    if (!progress[entry.id]) {
      progress[entry.id] = {
        ashaScore: shot.score,
        victorScore: entry.victorScore,
        completedAt: Date.now()
      };
      save('wl_victors_challenge_progress', progress);

      showMatchOverlay(entry, shot);
      checkCompletion();
    }
  });

  eventBus.on('challenge:complete', playFinalSequence);
}
