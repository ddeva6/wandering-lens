/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl } from 'howler';
import { save } from '../utils/localStorage.js';

const FADE_MS = 3000;
const FRAME_INTERVAL_MS = 400;
const FRAME_COUNT = 12;
const PHOTO_DEVELOP_MS = 4000;
const HOLD_MS = 10000;

function playShutterClick() {
  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/film_click.mp3`],
    onloaderror: () => console.warn('[ASSET MISSING] audio/film_click.mp3'),
  });
  sound.play();
}

function buildFilmStrip(overlay) {
  const strip = document.createElement('div');
  strip.className = 'finale-filmstrip';
  overlay.appendChild(strip);

  for (let i = 0; i < FRAME_COUNT; i += 1) {
    setTimeout(() => {
      const frame = document.createElement('div');
      frame.className = 'finale-frame';
      strip.appendChild(frame);
      playShutterClick();
    }, i * FRAME_INTERVAL_MS);
  }

  return FRAME_COUNT * FRAME_INTERVAL_MS;
}

function buildPhoto(overlay) {
  const photo = document.createElement('div');
  photo.className = 'finale-photo';
  photo.innerHTML = `
    <svg viewBox="0 0 300 200" class="finale-photo-svg">
      <rect width="300" height="200" fill="#e0d0a8" />
      <circle cx="230" cy="40" r="20" fill="#f5a94a" opacity="0.8" />
      <path d="M0 150 L60 120 L120 145 L180 110 L240 140 L300 120 L300 200 L0 200 Z" fill="#4a3a2a" />
      <rect x="90" y="90" width="10" height="60" fill="#1a1a1a" />
      <ellipse cx="95" cy="85" rx="14" ry="8" fill="#1a1a1a" />
      <path d="M60 130 Q90 100 130 130" stroke="#3a2a1a" stroke-width="6" fill="none" opacity="0.6" />
    </svg>
  `;
  overlay.appendChild(photo);
  requestAnimationFrame(() => photo.classList.add('finale-photo--developed'));
}

export function playFinale() {
  const overlay = document.createElement('div');
  overlay.className = 'finale-overlay';
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('finale-overlay--visible'));

  setTimeout(() => {
    const text = document.createElement('p');
    text.className = 'finale-text';
    text.textContent = "Victor's last roll of film. Developed for the first time.";
    overlay.appendChild(text);

    const stripDuration = buildFilmStrip(overlay);

    setTimeout(() => {
      buildPhoto(overlay);
      const caption = document.createElement('p');
      caption.className = 'finale-caption';
      caption.textContent = 'He was here. He saw what you saw. He left it for you to finish.';
      overlay.appendChild(caption);

      const signature = document.createElement('p');
      signature.className = 'finale-signature';
      signature.textContent = 'Victor Osei Mensah — 1948–1994';
      overlay.appendChild(signature);

      setTimeout(() => {
        overlay.remove();
        save('victors_challenge_complete', true);
      }, HOLD_MS);
    }, stripDuration + PHOTO_DEVELOP_MS);
  }, FADE_MS);
}
