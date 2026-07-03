/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save } from '../utils/localStorage.js';

const FADE_DURATION_MS = 3000;
const QUOTE_DURATION_MS = 4000;
const NO_WRONG_ANSWER_DELAY_MS = 10000;
const SELECTION_PAUSE_MS = 2000;

const CAMERA_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="14" r="4"/></svg>';
const GROUND_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 16c3-3 5-2 7 0s4 3 7 0 4-3 6 0"/><path d="M2 20h20"/><path d="M12 4v8"/><path d="M9 7l3-3 3 3"/></svg>';
const HANDS_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="6" r="2.5"/><circle cx="17" cy="6" r="2.5"/><path d="M4 20c0-4 1.5-7 3-7s3 3 3 7"/><path d="M14 20c0-4 1.5-7 3-7s3 3 3 7"/><path d="M10 20c0-3 1-5 2-5s2 2 2 5"/></svg>';

const CARDS = [
  {
    ending: 'publish',
    icon: CAMERA_ICON,
    title: 'PUBLISH',
    subtitle: "Send Victor's evidence to his editor at National Geographic.",
    consequence: 'His name is cleared. The operation is exposed. The world knows what happened here.',
    button: 'Send the photographs',
  },
  {
    ending: 'bury',
    icon: GROUND_ICON,
    title: 'BURY IT',
    subtitle: 'Return the evidence to the ground where Victor hid it.',
    consequence: 'The land stays hidden. The animals stay undisturbed. Some truths belong to the earth.',
    button: 'Leave it where it rests',
  },
  {
    ending: 'return',
    icon: HANDS_ICON,
    title: 'RETURN THE LAND',
    subtitle: "Give Victor's coordinates and evidence to Amara's community.",
    consequence: 'The Maasai file for stewardship. The land returns to those who have always known it.',
    button: 'Give it to Amara',
  },
];

function buildCard(card) {
  const el = document.createElement('div');
  el.className = 'ending-card';
  el.dataset.ending = card.ending;
  el.innerHTML = `
    <div class="ending-card-icon">${card.icon}</div>
    <p class="ending-card-title">${card.title}</p>
    <p class="ending-card-subtitle">${card.subtitle}</p>
    <p class="ending-card-consequence">${card.consequence}</p>
    <button type="button" class="ending-card-button">${card.button}</button>
  `;
  return el;
}

function resolveSelection(overlay, chosen) {
  overlay.querySelectorAll('.ending-card').forEach((card) => {
    if (card.dataset.ending === chosen) card.classList.add('ending-card--selected');
    else card.classList.add('ending-card--faded');
  });

  setTimeout(() => {
    save('ending_chosen', chosen);
    overlay.remove();
    eventBus.emit('story:endingChosen', { ending: chosen });
    eventBus.emit('controls:unfreeze');
  }, SELECTION_PAUSE_MS);
}

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'ending-overlay';
  overlay.innerHTML = `
    <p class="ending-quote">
      "Whatever you found here — the decision is yours. Not mine. It was always yours."<br />
      <span class="ending-quote-attribution">— Victor Osei Mensah, Field Journal, 1993</span>
    </p>
    <div class="ending-cards"></div>
    <p class="ending-no-wrong-answer">There is no wrong answer.</p>
  `;
  document.body.appendChild(overlay);

  const cardsContainer = overlay.querySelector('.ending-cards');
  const noWrongAnswer = overlay.querySelector('.ending-no-wrong-answer');

  setTimeout(() => {
    overlay.querySelector('.ending-quote').classList.add('ending-quote--fading');
    CARDS.forEach((card) => cardsContainer.appendChild(buildCard(card)));
    cardsContainer.classList.add('ending-cards--visible');

    overlay.querySelectorAll('.ending-card-button').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        resolveSelection(overlay, event.target.closest('.ending-card').dataset.ending);
      });
    });

    setTimeout(() => noWrongAnswer.classList.add('ending-no-wrong-answer--visible'), NO_WRONG_ANSWER_DELAY_MS);
  }, QUOTE_DURATION_MS);

  return overlay;
}

function beginEndingSequence() {
  eventBus.emit('controls:freeze');
  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    canvas.style.transition = `filter ${FADE_DURATION_MS}ms ease`;
    canvas.style.filter = 'brightness(0.4)';
  }
  setTimeout(buildOverlay, FADE_DURATION_MS);
}

export function init() {
  eventBus.on('story:endingUnlocked', beginEndingSequence);
}
