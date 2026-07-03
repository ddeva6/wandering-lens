/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { getAnimalManager } from '../../animals/AnimalManager.js';
import { prefersReducedMotion } from '../../core/camera.js';

const TYPEWRITER_MS_PER_CHAR = 30;

export function getEndingScene() {
  return getAnimalManager()?.scene ?? null;
}

// Types `text` into a centred subtitle-style line, holding for holdMs after
// it finishes before fading out. Returns the total on-screen duration (ms).
// With prefers-reduced-motion, the full line appears immediately instead of
// animating character by character, and the fade-out is instant.
export function showTypewriterText(text, { holdMs = 3000, className = 'ending-typewriter' } = {}) {
  const el = document.createElement('p');
  el.className = className;
  document.body.appendChild(el);

  // className may carry extra modifier classes space-separated (e.g. the
  // return ending's 'ending-typewriter amara-voice'), so the --fading
  // suffix is only ever appended to the first (base) class.
  const baseClass = className.split(' ')[0];

  if (prefersReducedMotion) {
    el.textContent = text;
    setTimeout(() => {
      el.classList.add(`${baseClass}--fading`);
      el.remove();
    }, holdMs);
    return holdMs;
  }

  let i = 0;
  const interval = setInterval(() => {
    i += 1;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      clearInterval(interval);
      setTimeout(() => {
        el.classList.add(`${baseClass}--fading`);
        setTimeout(() => el.remove(), 1000);
      }, holdMs);
    }
  }, TYPEWRITER_MS_PER_CHAR);

  return text.length * TYPEWRITER_MS_PER_CHAR + holdMs + 1000;
}

// Simple fade-in/hold/fade-out line, no typewriter — used for the closing
// single-line beats each ending ends on. With prefers-reduced-motion, skips
// straight to the fully-visible state instead of transitioning opacity.
export function showFadeLine(text, { holdMs = 8000, className = 'ending-fade-line' } = {}) {
  const el = document.createElement('p');
  el.className = className;
  el.textContent = text;
  document.body.appendChild(el);

  if (prefersReducedMotion) {
    el.classList.add(`${className}--visible`);
    setTimeout(() => el.remove(), holdMs);
    return;
  }

  requestAnimationFrame(() => el.classList.add(`${className}--visible`));

  setTimeout(() => {
    el.classList.remove(`${className}--visible`);
    setTimeout(() => el.remove(), 1000);
  }, holdMs);
}

// Cross-fades a full-screen colour wash through a sequence of stills
// (used for publishEnding's dawn/noon/dusk passage-of-time beat). With
// prefers-reduced-motion, each still simply appears at full opacity in
// sequence instead of transitioning.
export function crossfadeStills(colors, msEach) {
  const container = document.createElement('div');
  container.className = 'ending-stills';
  document.body.appendChild(container);

  colors.forEach((color, i) => {
    const still = document.createElement('div');
    still.className = 'ending-still';
    still.style.background = color;
    if (!prefersReducedMotion) still.style.transitionDuration = `${msEach}ms`;
    container.appendChild(still);
    setTimeout(() => still.classList.add('ending-still--visible'), i * msEach);
  });

  setTimeout(() => container.remove(), colors.length * msEach + msEach);
  return colors.length * msEach;
}

export function fadeCanvasBrightness(target, durationMs) {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  if (prefersReducedMotion) {
    canvas.style.filter = `brightness(${target})`;
    return;
  }
  canvas.style.transition = `filter ${durationMs}ms ease`;
  canvas.style.filter = `brightness(${target})`;
}
