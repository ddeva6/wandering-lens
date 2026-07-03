/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl } from 'howler';
import * as viewfinder from '../mechanics/photo/viewfinder.js';
import { takeShot, isLegendaryShot } from '../mechanics/photo/shotSystem.js';
import { showLegendaryConfirm } from '../mechanics/photo/legendaryConfirm.js';

const HOLD_THRESHOLD_MS = 500;
const FLASH_DURATION_MS = 80;

const shutterSound = new Howl({
  src: [`${import.meta.env.BASE_URL}audio/shutter.mp3`],
  onloaderror: () => console.warn('[ASSET MISSING] shutter.mp3'),
});

function flashShutter() {
  const flash = document.createElement('div');
  flash.className = 'shutter-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), FLASH_DURATION_MS);
}

function finishShot(isLegendary) {
  const shot = takeShot(isLegendary);
  if (!shot) return;
  flashShutter();
  shutterSound.play();
}

function triggerShutter() {
  if (isLegendaryShot()) {
    showLegendaryConfirm(
      () => finishShot(true),
      () => finishShot(false)
    );
  } else {
    finishShot(false);
  }
}

function isDriveControlTarget(target) {
  return Boolean(target.closest?.('.joystick-zone') || target.closest?.('.swipe-zone'));
}

function initDesktop() {
  window.addEventListener('keydown', (event) => {
    if (event.code !== 'KeyE' || event.repeat) return;
    viewfinder.mount();
  });
  window.addEventListener('keyup', (event) => {
    if (event.code !== 'KeyE') return;
    viewfinder.unmount();
  });
  document.addEventListener('click', () => {
    if (viewfinder.isActive()) triggerShutter();
  });
}

// Touch input has no separate "shutter click" gesture, so a single hold
// toggles mount/unmount and a quick tap while mounted fires the shutter —
// the closest workable reading of "hold to mount, tap to shoot" on a
// single touch point.
function initMobile() {
  let holdTimer = null;
  let heldPastThreshold = false;

  window.addEventListener('touchstart', (event) => {
    if (isDriveControlTarget(event.target)) return;
    heldPastThreshold = false;
    holdTimer = setTimeout(() => {
      heldPastThreshold = true;
      if (viewfinder.isActive()) viewfinder.unmount();
      else viewfinder.mount();
    }, HOLD_THRESHOLD_MS);
  });

  window.addEventListener('touchend', (event) => {
    if (isDriveControlTarget(event.target)) return;
    clearTimeout(holdTimer);
    if (!heldPastThreshold && viewfinder.isActive()) {
      triggerShutter();
    }
  });
}

export function init() {
  initDesktop();
  initMobile();
}
