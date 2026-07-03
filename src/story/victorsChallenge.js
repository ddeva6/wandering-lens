/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save, load } from '../utils/localStorage.js';
import { playFinalSequence } from './victorsChallengeFinale.js';

function triggerUnlockSequence() {
  if (load('victors_challenge_unlocked', false)) return;
  save('victors_challenge_unlocked', true);

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
    save('victors_challenge_active', true);
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
  const progress = load('victors_challenge_progress', {});
  const completedCount = Object.keys(progress).length;
  if (completedCount >= 12 && !load('victors_challenge_complete', false)) {
    eventBus.emit('challenge:complete');
  }
}

export function init() {
  eventBus.on('story:endingComplete', triggerUnlockSequence);

  eventBus.on('challenge:shotMatched', ({ entry, shot }) => {
    const progress = load('victors_challenge_progress', {});
    if (!progress[entry.id]) {
      progress[entry.id] = {
        ashaScore: shot.score,
        victorScore: entry.victorScore,
        completedAt: Date.now()
      };
      save('victors_challenge_progress', progress);

      showMatchOverlay(entry, shot);
      checkCompletion();
    }
  });

  eventBus.on('challenge:complete', playFinalSequence);
}
