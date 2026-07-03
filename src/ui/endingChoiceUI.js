/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save } from '../utils/localStorage.js';
import { prefersReducedMotion } from '../core/camera.js';

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
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', `${card.title}. ${card.subtitle} Consequence: ${card.consequence}`);
  el.innerHTML = `
    <div class="ending-card-icon">${card.icon}</div>
    <p class="ending-card-title">${card.title}</p>
    <p class="ending-card-subtitle">${card.subtitle}</p>
    <p class="ending-card-consequence">${card.consequence}</p>
    <button type="button" class="ending-card-button" tabindex="-1">${card.button}</button>
  `;
  return el;
}

function resolveSelection(overlay, chosen) {
  overlay.querySelectorAll('.ending-card').forEach((card) => {
    if (card.dataset.ending === chosen) card.classList.add('ending-card--selected');
    else card.classList.add('ending-card--faded');
  });

  const delay = prefersReducedMotion ? 0 : SELECTION_PAUSE_MS;
  setTimeout(() => {
    save('ending_chosen', chosen);
    overlay.remove();
    eventBus.emit('story:endingChosen', { ending: chosen });
    eventBus.emit('controls:unfreeze');
  }, delay);
}

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'ending-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
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

  const quoteDuration = prefersReducedMotion ? 0 : QUOTE_DURATION_MS;
  setTimeout(() => {
    overlay.querySelector('.ending-quote').classList.add('ending-quote--fading');
    CARDS.forEach((card) => cardsContainer.appendChild(buildCard(card)));
    cardsContainer.classList.add('ending-cards--visible');

    const endingCards = overlay.querySelectorAll('.ending-card');
    endingCards.forEach((card) => {
      const select = () => resolveSelection(overlay, card.dataset.ending);
      card.addEventListener('click', select);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });

    // Focus trap and keyboard navigation
    if (endingCards.length > 0) endingCards[0].focus();

    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const firstFocusable = endingCards[0];
        const lastFocusable = endingCards[endingCards.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });

    const wrongAnswerDelay = prefersReducedMotion ? 0 : NO_WRONG_ANSWER_DELAY_MS;
    setTimeout(() => noWrongAnswer.classList.add('ending-no-wrong-answer--visible'), wrongAnswerDelay);
  }, quoteDuration);

  return overlay;
}

function beginEndingSequence() {
  eventBus.emit('controls:freeze');
  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    if (prefersReducedMotion) {
      canvas.style.transition = 'none';
    } else {
      canvas.style.transition = `filter ${FADE_DURATION_MS}ms ease`;
    }
    canvas.style.filter = 'brightness(0.4)';
  }
  const fadeDuration = prefersReducedMotion ? 0 : FADE_DURATION_MS;
  setTimeout(buildOverlay, fadeDuration);
}

export function init() {
  eventBus.on('story:endingUnlocked', beginEndingSequence);
}
