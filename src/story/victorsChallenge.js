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
import { playFinale } from './victorsChallengeFinale.js';

const UNLOCK_SUBTITLE = 'Twelve shots he attempted and never got. Described in his journal. Find them.';
const FOUND_DISMISS_MS = 6000;
const FINALE_DELAY_MS = FOUND_DISMISS_MS + 800;

// Deterministic 0.05–0.15 spread per entry (id 1-12) so the rarity roll is
// stable across reloads instead of re-randomising every session.
export const challengeEntries = victorAttempts.map((entry) => ({
  ...entry,
  rarity: 0.05 + (entry.id % 6) * 0.02,
}));

function showUnlockOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'challenge-unlock-overlay';
  overlay.innerHTML = `
    <h2 class="challenge-unlock-title">Victor's Challenge</h2>
    <p class="challenge-unlock-subtitle">${UNLOCK_SUBTITLE}</p>
    <button type="button" class="challenge-unlock-button">Accept</button>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('challenge-unlock-overlay--visible'));

  overlay.querySelector('.challenge-unlock-button').addEventListener('click', () => {
    save('victors_challenge_active', true);
    overlay.classList.remove('challenge-unlock-overlay--visible');
    setTimeout(() => overlay.remove(), 600);
  });
}

function unlockIfNeeded() {
  if (load('victors_challenge_unlocked', false)) return;
  save('victors_challenge_unlocked', true);
  showUnlockOverlay();
}

function buildFoundOverlay(entry, shot, completedCount) {
  const overlay = document.createElement('div');
  overlay.className = 'challenge-found-overlay';
  overlay.innerHTML = `
    <p class="challenge-found-title">VICTOR'S ATTEMPT — FOUND</p>
    <div class="challenge-found-panels">
      <div class="challenge-found-panel">
        <p class="challenge-found-label">VICTOR — ${entry.year}</p>
        <p class="challenge-found-score">${entry.victorScore}</p>
        <p class="challenge-found-note">${entry.victorNote}</p>
      </div>
      <div class="challenge-found-panel challenge-found-panel--asha">
        <p class="challenge-found-label">ASHA — NOW</p>
        <p class="challenge-found-score">${shot.score}</p>
      </div>
    </div>
    <p class="challenge-found-count">${completedCount} / ${challengeEntries.length}</p>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('challenge-found-overlay--visible'));

  setTimeout(() => {
    overlay.classList.remove('challenge-found-overlay--visible');
    setTimeout(() => overlay.remove(), 600);
  }, FOUND_DISMISS_MS);
}

function handleShotMatched({ entry, shot }) {
  const progress = load('victors_challenge_progress', {});
  if (progress[entry.id]) return;

  progress[entry.id] = { ashaScore: shot.score, victorScore: entry.victorScore, completedAt: Date.now() };
  save('victors_challenge_progress', progress);

  const completedCount = Object.keys(progress).length;
  buildFoundOverlay(entry, shot, completedCount);
  eventBus.emit('challenge:progressUpdated', progress);

  if (completedCount >= challengeEntries.length) {
    eventBus.emit('challenge:complete');
    save('victors_challenge_active', false);
    setTimeout(() => playFinale(), FINALE_DELAY_MS);
  }
}

export function init() {
  eventBus.on('story:endingComplete', unlockIfNeeded);
  eventBus.on('challenge:shotMatched', handleShotMatched);
}
