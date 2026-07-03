/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { save } from '../utils/localStorage.js';

// Split out of victorsChallenge.js (which was over the 200-line budget once
// this final-reward sequence was included) — the reward played once all 12
// Victor's Challenge entries are completed.
export function playFinalSequence() {
  const overlay = document.createElement('div');
  overlay.className = 'victor-challenge-final-overlay';

  const style = document.createElement('style');
  style.textContent = `
    .victor-challenge-final-overlay {
      position: fixed;
      inset: 0;
      z-index: 700;
      background: black;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: sans-serif;
      text-align: center;
      opacity: 0;
      transition: opacity 3s;
    }
    .victor-film-strip {
      display: flex;
      gap: 10px;
      margin: 40px 0;
    }
    .victor-negative {
      width: 60px;
      height: 40px;
      background: #ccc;
      filter: invert(1) sepia(1);
      opacity: 0;
    }
    .victor-photo {
      width: 400px;
      height: 260px;
      background: white;
      margin: 20px 0;
      display: none;
      animation: develop 10s forwards;
    }
    @keyframes develop {
      from { background: white; }
      to { background: #e6d5c3; border: 10px solid white; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    }
  `;
  document.head.appendChild(style);

  const text1 = document.createElement('div');
  text1.textContent = "Victor's last roll of film. Developed for the first time.";
  text1.style.marginBottom = '20px';
  overlay.appendChild(text1);

  const filmStrip = document.createElement('div');
  filmStrip.className = 'victor-film-strip';
  for (let i = 0; i < 12; i++) {
    const neg = document.createElement('div');
    neg.className = 'victor-negative';
    filmStrip.appendChild(neg);
  }
  overlay.appendChild(filmStrip);

  const finalPhoto = document.createElement('div');
  finalPhoto.className = 'victor-photo';
  finalPhoto.innerHTML = `<svg viewBox="0 0 400 260" width="100%" height="100%"><rect width="100%" height="100%" fill="none" /><path d="M100 200 Q200 100 300 200 Z" fill="#665040" opacity="0.6"/></svg>`; // Simplified representation
  overlay.appendChild(finalPhoto);

  const finalTexts = document.createElement('div');
  finalTexts.style.display = 'none';
  finalTexts.style.marginTop = '20px';
  finalTexts.innerHTML = `
    <p>He was here. He saw what you saw. He left it for you to finish.</p>
    <p style="font-family: 'Caveat', cursive; font-size: 24px; margin-top: 20px;">Victor Osei Mensah — 1948–1994</p>
  `;
  overlay.appendChild(finalTexts);

  document.body.appendChild(overlay);

  setTimeout(() => { overlay.style.opacity = '1'; }, 100);

  const negatives = filmStrip.querySelectorAll('.victor-negative');
  negatives.forEach((neg, index) => {
    setTimeout(() => {
      neg.style.opacity = '1';
      // mechanical click could go here
    }, 4000 + (index * 500));
  });

  setTimeout(() => {
    filmStrip.style.display = 'none';
    finalPhoto.style.display = 'block';

    setTimeout(() => {
      finalTexts.style.display = 'block';
      save('victors_challenge_complete', true);

      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          style.remove();
        }, 3000);
      }, 10000);
    }, 10000);

  }, 4000 + (12 * 500) + 1000);
}
