/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

const WORDS_PER_SECOND = 2.5;
const FADE_OUT_MS = 500;
const MIN_DURATION_MS = 2500;

// Shared subtitle presentation for Amara/Isaac dialogue lines, reusing the
// same bottom-band styling voiceSystem.js established for Victor's lines.
export function showDialogueLine(line, speakerLabel) {
  const el = document.createElement('p');
  el.className = 'victor-subtitle character-dialogue';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('role', 'status');
  el.textContent = speakerLabel ? `${speakerLabel}: ${line.text}` : line.text;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('victor-subtitle--visible'));

  const wordCount = line.text.trim().split(/\s+/).length;
  const durationMs = Math.max(MIN_DURATION_MS, (wordCount / WORDS_PER_SECOND) * 1000);

  setTimeout(() => {
    el.classList.remove('victor-subtitle--visible');
    setTimeout(() => el.remove(), FADE_OUT_MS);
  }, durationMs);

  return durationMs;
}

// Shows a sequence of lines back to back, one after another.
export function showDialogueSequence(lines, speakerLabel) {
  let delay = 0;
  lines.forEach((line) => {
    setTimeout(() => showDialogueLine(line, speakerLabel), delay);
    const wordCount = line.text.trim().split(/\s+/).length;
    delay += Math.max(MIN_DURATION_MS, (wordCount / WORDS_PER_SECOND) * 1000) + 300;
  });
  return delay;
}
