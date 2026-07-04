/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save, load } from '../utils/localStorage.js';
import { copy } from '../story/copy.js';
import { prefersReducedMotion } from '../core/camera.js';
import { asha } from '../characters/asha/AshaCharacter.js';

const MAX_NAME_LENGTH = 12;
const FADE_MS = 1000;

const SKIN_TONES = ['#8d5524', '#a0663a', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac'];
const HAIR_OPTIONS = [
  { id: 'short_crop', label: 'Short crop' },
  { id: 'braids', label: 'Braids' },
  { id: 'twists', label: 'Twists' },
  { id: 'afro', label: 'Afro' },
  { id: 'bun', label: 'Bun' },
  { id: 'locs', label: 'Locs' },
  { id: 'headwrap', label: 'Headwrap' },
  { id: 'buzz', label: 'Buzz cut' },
];
const PRONOUNS = ['she', 'he', 'they'];

function buildRadioGroup(container, selector, attr) {
  const options = Array.from(container.querySelectorAll(selector));
  options.forEach((el) => {
    el.addEventListener('click', () => {
      options.forEach((o) => {
        o.classList.remove(`${selector.slice(1)}--selected`);
        o.setAttribute('aria-checked', 'false');
      });
      el.classList.add(`${selector.slice(1)}--selected`);
      el.setAttribute('aria-checked', 'true');
    });
  });
  return () => options.find((o) => o.getAttribute('aria-checked') === 'true')?.dataset[attr];
}

function buildScreen() {
  const overlay = document.createElement('div');
  overlay.className = 'customization-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', copy.customization.title);

  overlay.innerHTML = `
    <div class="customization-card">
      <h2 class="customization-title">${copy.customization.title}</h2>

      <label class="customization-label" for="customization-name">${copy.customization.nameLabel}</label>
      <input id="customization-name" class="customization-name-input" type="text" maxlength="${MAX_NAME_LENGTH}" value="Asha" aria-label="${copy.customization.nameLabel}" />

      <p class="customization-label">${copy.customization.skinToneLabel}</p>
      <div class="customization-swatches" role="radiogroup" aria-label="${copy.customization.skinToneLabel}">
        ${SKIN_TONES.map((hex, i) => `
          <button type="button" class="customization-swatch${i === 2 ? ' customization-swatch--selected' : ''}"
            style="background:${hex}" data-hex="${hex}" role="radio" aria-checked="${i === 2}"
            aria-label="Skin tone ${i + 1}"></button>
        `).join('')}
      </div>

      <p class="customization-label">${copy.customization.hairLabel}</p>
      <div class="customization-hair-grid" role="radiogroup" aria-label="${copy.customization.hairLabel}">
        ${HAIR_OPTIONS.map((hair, i) => `
          <button type="button" class="customization-hair-option${i === 0 ? ' customization-hair-option--selected' : ''}"
            data-id="${hair.id}" role="radio" aria-checked="${i === 0}">${hair.label}</button>
        `).join('')}
      </div>

      <p class="customization-label">${copy.customization.pronounsLabel}</p>
      <div class="customization-pronouns" role="radiogroup" aria-label="${copy.customization.pronounsLabel}">
        ${PRONOUNS.map((pronoun, i) => `
          <button type="button" class="customization-pronoun-option${i === 0 ? ' customization-pronoun-option--selected' : ''}"
            data-pronoun="${pronoun}" role="radio" aria-checked="${i === 0}">${pronoun}</button>
        `).join('')}
      </div>

      <button type="button" class="customization-begin-button">${copy.customization.beginButton}</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('customization-overlay--visible'));

  const getSkinTone = buildRadioGroup(overlay, '.customization-swatch', 'hex');
  const getHair = buildRadioGroup(overlay, '.customization-hair-option', 'id');
  const getPronoun = buildRadioGroup(overlay, '.customization-pronoun-option', 'pronoun');
  const nameInput = overlay.querySelector('#customization-name');

  overlay.querySelector('.customization-begin-button').addEventListener('click', () => {
    const profile = {
      name: nameInput.value.trim().slice(0, MAX_NAME_LENGTH) || 'Asha',
      skinTone: getSkinTone() || SKIN_TONES[2],
      hair: getHair() || HAIR_OPTIONS[0].id,
      pronouns: getPronoun() || PRONOUNS[0],
    };
    save('asha_profile', profile);
    asha.setSkinTone(profile.skinTone);

    const finish = () => {
      overlay.remove();
      eventBus.emit('game:profileReady');
    };

    if (prefersReducedMotion) {
      finish();
    } else {
      overlay.classList.remove('customization-overlay--visible');
      setTimeout(finish, FADE_MS);
    }
  });
}

export function init() {
  // THREE's LoadingManager can fire onLoad more than once per session if a
  // later lazy asset load starts after the initial batch finished, which
  // would re-emit 'game:loaded' — guard so the screen can't be built twice.
  let handled = false;
  eventBus.on('game:loaded', () => {
    if (handled) return;
    handled = true;

    const existing = load('asha_profile', null);
    if (existing) {
      asha.setSkinTone(existing.skinTone);
      eventBus.emit('game:profileReady');
    } else {
      buildScreen();
    }
  });
}
