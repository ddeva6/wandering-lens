/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';
import { victorAttempts } from '../../story/victorAttempts.js';

const AUTO_DISMISS_MS = 5000;

let playerPosition = { x: 0, z: 0 };
let dismissTimer = null;
let overlay = null;

// Same west/east/north/south quadrant split used to place every species'
// spawn zone — see AnimalManager species spawn constants.
function getZone(x, z) {
  if (Math.abs(x) >= Math.abs(z)) return x >= 0 ? 'east' : 'west';
  return z >= 0 ? 'south' : 'north';
}

function findMatch(species) {
  const zone = getZone(playerPosition.x, playerPosition.z);
  return victorAttempts.find((a) => a.species === species && a.zone === zone);
}

function dismiss() {
  if (!overlay) return;
  clearTimeout(dismissTimer);
  document.removeEventListener('keydown', dismiss);
  document.removeEventListener('touchstart', dismiss);
  overlay.remove();
  overlay = null;
}

function buildOverlay(attempt, shot) {
  overlay = document.createElement('div');
  overlay.className = 'photo-comparison-overlay';

  const left = document.createElement('div');
  left.className = 'photo-comparison-panel photo-comparison-victor';
  left.innerHTML = `
    <p class="photo-comparison-label">VICTOR — ${attempt.year}</p>
    <p class="photo-comparison-score photo-comparison-grain">${attempt.victorScore}</p>
    <p class="photo-comparison-note">${attempt.victorNote}</p>
  `;

  const divider = document.createElement('div');
  divider.className = 'photo-comparison-divider';
  divider.innerHTML = `
    <span>${attempt.year}</span>
    <span>NOW</span>
  `;

  const right = document.createElement('div');
  right.className = 'photo-comparison-panel photo-comparison-asha';
  right.innerHTML = `
    <p class="photo-comparison-label">ASHA — NOW</p>
    <p class="photo-comparison-score">${shot.score}</p>
    <p class="photo-comparison-note">${shot.species?.toUpperCase() ?? ''} — hour ${shot.gameHour.toFixed(1)}</p>
  `;

  const verdict = document.createElement('p');
  verdict.className = 'photo-comparison-verdict';
  if (shot.score > attempt.victorScore) {
    right.classList.add('photo-comparison-gold-border');
    verdict.textContent = 'You got closer than he ever did.';
  } else if (attempt.victorScore > shot.score) {
    verdict.textContent = 'He would have been proud of this one.';
  }

  overlay.append(left, divider, right, verdict);
  document.body.appendChild(overlay);

  dismissTimer = setTimeout(dismiss, AUTO_DISMISS_MS);
  document.addEventListener('keydown', dismiss);
  document.addEventListener('touchstart', dismiss);
}

export function init() {
  eventBus.on('jeep:positionUpdate', ({ position }) => {
    playerPosition = position;
  });

  eventBus.on('photo:legendary', (shot) => {
    if (!shot.species) return;
    const match = findMatch(shot.species);
    if (match) buildOverlay(match, shot);
  });
}
