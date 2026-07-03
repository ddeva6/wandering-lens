/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

const SURVIVE_DURATION_MS = 120000;
const MISS_LIMIT = 3;
const TARGET_WINDOW_MS = 3000;
const SPAWN_MIN_MS = 2000;
const SPAWN_MAX_MS = 4000;
const SPAWN_RADIUS = 200;

import { prefersReducedMotion } from '../../core/camera.js';

// The firewood-clicking rhythm game itself — trigger detection, audio and
// narrative side-effects live in hyenaCamp.js, which calls this.
export function startCampfireGame(onSurvive, onFail) {
  const overlay = document.createElement('div');
  overlay.className = 'campfire-overlay';
  overlay.innerHTML = `
    <div class="campfire-fire">
      <div class="campfire-flame campfire-flame--1"></div>
      <div class="campfire-flame campfire-flame--2"></div>
      <div class="campfire-flame campfire-flame--3"></div>
    </div>
    <p class="campfire-text">Keep the fire burning</p>
    <div class="campfire-misses">
      <span class="campfire-miss"></span>
      <span class="campfire-miss"></span>
      <span class="campfire-miss"></span>
    </div>
  `;
  document.body.appendChild(overlay);

  if (prefersReducedMotion) {
    overlay.querySelectorAll('.campfire-flame').forEach((flame) => {
      flame.style.animation = 'none';
      flame.style.webkitAnimation = 'none';
    });
  }

  let misses = 0;
  let spawnTimer = null;
  let endTimer = null;
  let ended = false;

  function end(success) {
    if (ended) return;
    ended = true;
    clearTimeout(spawnTimer);
    clearTimeout(endTimer);
    overlay.querySelectorAll('.campfire-target').forEach((t) => t.remove());
    if (success) {
      overlay.querySelector('.campfire-fire').classList.add('campfire-fire--intense');
      setTimeout(() => overlay.remove(), 1200);
      onSurvive();
    } else {
      overlay.classList.add('campfire-overlay--dying');
      setTimeout(() => overlay.remove(), 1500);
      onFail();
    }
  }

  function registerMiss() {
    if (ended) return;
    overlay.querySelectorAll('.campfire-miss')[misses]?.classList.add('campfire-miss--active');
    misses += 1;
    if (misses >= MISS_LIMIT) end(false);
  }

  function spawnTarget() {
    if (ended) return;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * SPAWN_RADIUS;
    const target = document.createElement('button');
    target.type = 'button';
    target.className = 'campfire-target';
    target.style.left = `calc(50% + ${Math.cos(angle) * radius}px)`;
    target.style.top = `calc(50% + ${Math.sin(angle) * radius}px)`;
    overlay.appendChild(target);

    const fadeTimeout = setTimeout(() => {
      target.remove();
      registerMiss();
    }, TARGET_WINDOW_MS);

    target.addEventListener('click', (event) => {
      event.stopPropagation();
      clearTimeout(fadeTimeout);
      target.remove();
    });

    spawnTimer = setTimeout(spawnTarget, SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS));
  }

  spawnTarget();
  endTimer = setTimeout(() => end(true), SURVIVE_DURATION_MS);

  return { stop: () => end(false) };
}
