/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { copy } from '../story/copy.js';
import { prefersReducedMotion } from '../core/camera.js';

const FADE_MS = 1000;
const HOLD_MS = 2000;

function showZoneName(name) {
  const label = copy.zoneNames[name];
  if (!label) return;

  const el = document.createElement('p');
  el.className = 'zone-subtitle';
  el.textContent = label;
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('role', 'status');
  document.body.appendChild(el);

  if (prefersReducedMotion) {
    el.classList.add('zone-subtitle--visible');
    setTimeout(() => el.remove(), HOLD_MS);
    return;
  }

  requestAnimationFrame(() => el.classList.add('zone-subtitle--visible'));
  setTimeout(() => {
    el.classList.remove('zone-subtitle--visible');
    setTimeout(() => el.remove(), FADE_MS);
  }, FADE_MS + HOLD_MS);
}

export function init() {
  eventBus.on('zone:entered', ({ name }) => showZoneName(name));
}
