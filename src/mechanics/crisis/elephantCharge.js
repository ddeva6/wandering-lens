/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';
import { animalMemory } from '../../animals/AnimalMemory.js';
import { getAnimalManager } from '../../animals/AnimalManager.js';

const COUNTDOWN_MS = 5000;
const TRUST_ORDER = ['spooked', 'neutral', 'familiar'];

function findElephant(id) {
  const am = getAnimalManager();
  return am?.elephantHerd?.members.find((e) => e.id === id) ?? am?.elephantHerd?.members[0];
}

function increaseTrust(currentLevel) {
  const index = TRUST_ORDER.indexOf(currentLevel);
  return TRUST_ORDER[Math.min(index + 1, TRUST_ORDER.length - 1)];
}

const SILHOUETTE_SVG = `
<svg class="crisis-elephant-svg" viewBox="0 0 200 140">
  <ellipse class="crisis-elephant-body" cx="100" cy="90" rx="60" ry="35" />
  <path class="crisis-elephant-ear crisis-elephant-ear--left" d="M55 60 Q20 50 25 90 Q45 85 60 75 Z" />
  <path class="crisis-elephant-ear crisis-elephant-ear--right" d="M145 60 Q180 50 175 90 Q155 85 140 75 Z" />
  <ellipse class="crisis-elephant-head" cx="100" cy="60" rx="30" ry="25" />
  <path class="crisis-elephant-trunk" d="M100 75 Q95 110 85 125" />
</svg>`;

function buildOverlay(kind) {
  const overlay = document.createElement('div');
  overlay.className = `crisis-overlay crisis-elephant-overlay crisis-elephant-overlay--${kind}`;
  overlay.innerHTML = `
    <p class="crisis-elephant-title">READ THE BODY LANGUAGE</p>
    ${SILHOUETTE_SVG}
    <div class="crisis-choice-cards">
      <button type="button" class="crisis-choice-card" data-choice="mock">MOCK CHARGE — Hold position</button>
      <button type="button" class="crisis-choice-card" data-choice="real">REAL CHARGE — Reverse immediately</button>
    </div>
    <svg class="crisis-countdown" viewBox="0 0 40 40">
      <circle class="crisis-countdown-track" cx="20" cy="20" r="17" />
      <circle class="crisis-countdown-arc" cx="20" cy="20" r="17" />
    </svg>
  `;
  overlay.addEventListener('click', (event) => event.stopPropagation());
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    const arc = overlay.querySelector('.crisis-countdown-arc');
    arc.style.transitionDuration = `${COUNTDOWN_MS}ms`;
    arc.classList.add('crisis-countdown-arc--depleting');
  });
  return overlay;
}

function resolveCorrect(overlay, elephant) {
  overlay.remove();
  eventBus.emit('controls:unfreeze');
  eventBus.emit('crisis:survived', { type: 'elephantCharge', correct: true });
  if (!elephant) return;
  if (elephant.chargeType === 'real') {
    elephant.chargeType = null;
    elephant.setState('idle');
  } else {
    elephant.setState('walk');
  }
  animalMemory.setTrust(elephant.id, increaseTrust(elephant.trustLevel));
}

function resolveWrong(overlay, elephant) {
  overlay.remove();
  eventBus.emit('camera:shake', { intensity: 1.5, duration: 2.0 });
  eventBus.emit('jeep:damage', { type: 'elephant', severity: 'major' });

  const flash = document.createElement('div');
  flash.className = 'crisis-warning-flash crisis-warning-flash--white';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);

  eventBus.emit('mission:fail', { reason: 'elephantCharge' });
  setTimeout(() => eventBus.emit('controls:unfreeze'), 3000);
}

function handleCharge(kind, payload) {
  const elephant = findElephant(payload?.id);
  eventBus.emit('controls:freeze');
  const overlay = buildOverlay(kind);

  let resolved = false;
  const timeout = setTimeout(() => {
    if (resolved) return;
    resolved = true;
    resolveWrong(overlay, elephant);
  }, COUNTDOWN_MS);

  function resolveChoice(choice) {
    if (resolved) return;
    resolved = true;
    clearTimeout(timeout);
    if (choice === kind) resolveCorrect(overlay, elephant);
    else resolveWrong(overlay, elephant);
  }

  overlay.querySelectorAll('.crisis-choice-card').forEach((card) => {
    card.addEventListener('click', () => resolveChoice(card.dataset.choice));
  });
}

export function init() {
  eventBus.on('crisis:elephantMockCharge', (payload) => handleCharge('mock', payload));
  eventBus.on('crisis:elephantRealCharge', (payload) => handleCharge('real', payload));
}
