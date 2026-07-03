/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';
import { save, load } from '../../utils/localStorage.js';
import { isOnFoot, getPlayerPosition } from '../../jeep/onFootMode.js';
import { animalMemory } from '../../animals/AnimalMemory.js';
import { getAnimalManager } from '../../animals/AnimalManager.js';
import { resourceManager } from '../survival/resourceManager.js';

const COUNTDOWN_MS = 3000;
const PASS_DISTANCE = 2;

function findLion(id) {
  const am = getAnimalManager();
  return am?.lionPride?.members.find((l) => l.id === id) ?? am?.lionPride?.members[0];
}

function showWarningFlash() {
  const flash = document.createElement('div');
  flash.className = 'crisis-warning-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 400);
}

function passLionByPlayer(lion) {
  if (!lion) return;
  const player = getPlayerPosition();
  lion.mesh.position.set(player.x + PASS_DISTANCE, lion.mesh.position.y, player.z);
}

function resolveStayStill(overlay, lion) {
  overlay.remove();
  eventBus.emit('controls:unfreeze');
  passLionByPlayer(lion);
  if (lion) animalMemory.setTrust(lion.id, 'familiar');
  eventBus.emit('crisis:survived', { type: 'lionCharge', choice: 'still' });

  const comeback = load('comeback', {});
  comeback.lionSurvived = true;
  save('comeback', comeback);

  setTimeout(() => {
    eventBus.emit('story:journalUnlock', { id: 'lion_encounter', trigger: 'lionSurvived' });
  }, 3000);
}

function resolveRun(overlay, lion) {
  overlay.remove();
  const player = getPlayerPosition();
  if (lion) lion.mesh.position.set(player.x, lion.mesh.position.y, player.z);
  eventBus.emit('camera:shake', { intensity: 1.0, duration: 1.5 });
  eventBus.emit('mission:fail', { reason: 'lionCharge' });
  setTimeout(() => eventBus.emit('controls:unfreeze'), 2000);
  resourceManager.adjust('fuel', -20);
  resourceManager.adjust('water', -15);
}

function buildOverlay(lion) {
  const overlay = document.createElement('div');
  overlay.className = 'crisis-overlay';
  overlay.innerHTML = `
    <div class="crisis-lion-band">LION CHARGING</div>
    <div class="crisis-choice-cards">
      <button type="button" class="crisis-choice-card" data-choice="still">STAY STILL</button>
      <button type="button" class="crisis-choice-card" data-choice="run">RUN</button>
      <button type="button" class="crisis-choice-card" data-choice="noise">MAKE NOISE</button>
    </div>
    <svg class="crisis-countdown" viewBox="0 0 40 40">
      <circle class="crisis-countdown-track" cx="20" cy="20" r="17" />
      <circle class="crisis-countdown-arc" cx="20" cy="20" r="17" />
    </svg>
  `;
  overlay.addEventListener('click', (event) => event.stopPropagation());
  document.body.appendChild(overlay);

  let resolved = false;
  const timeout = setTimeout(() => resolveChoice('run'), COUNTDOWN_MS);
  // Force a reflow so the arc animation starts from full, then depletes.
  requestAnimationFrame(() => {
    overlay.querySelector('.crisis-countdown-arc').classList.add('crisis-countdown-arc--depleting');
  });

  function resolveChoice(choice) {
    if (resolved) return;
    resolved = true;
    clearTimeout(timeout);

    if (choice === 'still') {
      resolveStayStill(overlay, lion);
    } else if (choice === 'run') {
      resolveRun(overlay, lion);
    } else {
      const suspense = document.createElement('p');
      suspense.className = 'crisis-suspense';
      suspense.textContent = '...';
      overlay.appendChild(suspense);
      setTimeout(() => {
        if (Math.random() > 0.5) resolveStayStill(overlay, lion);
        else resolveRun(overlay, lion);
      }, 1000);
    }
  }

  overlay.querySelectorAll('.crisis-choice-card').forEach((card) => {
    card.addEventListener('click', () => resolveChoice(card.dataset.choice));
  });
}

function handleCharge(payload) {
  const lion = findLion(payload?.id);

  if (!isOnFoot()) {
    showWarningFlash();
    eventBus.emit('jeep:damage', { type: 'collision', severity: 'minor' });
    return;
  }

  eventBus.emit('controls:freeze');
  buildOverlay(lion);
}

export function init() {
  eventBus.on('crisis:lionCharge', handleCharge);
}
