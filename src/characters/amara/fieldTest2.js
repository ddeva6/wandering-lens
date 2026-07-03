/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howl, Howler } from 'howler';

const SPECIES = [
  'lion_eagle',
  'lilac_breasted_roller',
  'secretary_bird',
  'african_fish_eagle',
  'grey_crowned_crane',
  'marabou_stork',
  'yellow_billed_hornbill',
  'kori_bustard',
];
const SPECIES_COLOR = {
  lion_eagle: '#c98a3a',
  lilac_breasted_roller: '#7a5ac9',
  secretary_bird: '#4a4a4a',
  african_fish_eagle: '#d8d8d8',
  grey_crowned_crane: '#8a8a8a',
  marabou_stork: '#5a5a5a',
  yellow_billed_hornbill: '#e0c040',
  kori_bustard: '#a89468',
};

const ROUND_COUNT = 5;
const PASS_THRESHOLD = 4;
const ROUND_SECONDS = 8;

function speciesLabel(species) {
  return species
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function pickRound(used) {
  const remaining = SPECIES.filter((s) => !used.includes(s));
  const correct = remaining[Math.floor(Math.random() * remaining.length)];
  const decoyPool = SPECIES.filter((s) => s !== correct);
  const decoys = [];
  while (decoys.length < 3) {
    const candidate = decoyPool[Math.floor(Math.random() * decoyPool.length)];
    if (!decoys.includes(candidate)) decoys.push(candidate);
  }
  const options = [correct, ...decoys].sort(() => Math.random() - 0.5);
  return { correct, options };
}

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'birdtest-overlay';
  overlay.innerHTML = `
    <div class="birdtest-card">
      <div class="birdtest-waveform"></div>
      <p class="birdtest-name">???</p>
    </div>
    <div class="birdtest-timer-track"><div class="birdtest-timer-fill"></div></div>
    <div class="birdtest-options"></div>
    <p class="birdtest-score">Round 1 / ${ROUND_COUNT} — Score: 0</p>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function playClip(species, onEnded) {
  const sound = new Howl({
    src: [`${import.meta.env.BASE_URL}audio/birds/${species}.mp3`],
    onloaderror: () => console.warn(`[ASSET MISSING] audio/birds/${species}.mp3`),
    onend: onEnded,
  });
  sound.play();
  return sound;
}

export function start(onSuccess, onFail) {
  const overlay = buildOverlay();
  const originalVolume = Howler.volume();
  Howler.volume(originalVolume * 0.2);

  const used = [];
  let round = 0;
  let score = 0;

  function nextRound() {
    if (round >= ROUND_COUNT) {
      finish();
      return;
    }
    round += 1;
    const { correct, options } = pickRound(used);
    used.push(correct);

    const waveform = overlay.querySelector('.birdtest-waveform');
    waveform.style.background = SPECIES_COLOR[correct];
    waveform.classList.add('birdtest-waveform--playing');
    overlay.querySelector('.birdtest-name').textContent = '???';
    overlay.querySelector('.birdtest-score').textContent =
      `Round ${round} / ${ROUND_COUNT} — Score: ${score}`;

    playClip(correct, () => waveform.classList.remove('birdtest-waveform--playing'));

    const optionsEl = overlay.querySelector('.birdtest-options');
    optionsEl.innerHTML = '';
    options.forEach((species) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'birdtest-option';
      btn.textContent = speciesLabel(species);
      btn.addEventListener('click', () => resolveRound(species, correct));
      optionsEl.appendChild(btn);
    });

    const fill = overlay.querySelector('.birdtest-timer-fill');
    fill.style.transition = 'none';
    fill.style.transform = 'scaleX(1)';
    requestAnimationFrame(() => {
      fill.style.transition = `transform ${ROUND_SECONDS}s linear`;
      fill.style.transform = 'scaleX(0)';
    });
    roundTimeout = setTimeout(() => resolveRound(null, correct), ROUND_SECONDS * 1000);
  }

  let roundTimeout = null;
  function resolveRound(chosen, correct) {
    clearTimeout(roundTimeout);
    overlay.querySelectorAll('.birdtest-option').forEach((btn) => (btn.disabled = true));
    overlay.querySelector('.birdtest-name').textContent = speciesLabel(correct);

    const flash = document.createElement('div');
    const isCorrect = chosen === correct;
    if (isCorrect) score += 1;
    flash.className = `birdtest-flash ${isCorrect ? 'birdtest-flash--good' : 'birdtest-flash--bad'}`;
    overlay.appendChild(flash);
    setTimeout(() => flash.remove(), 500);

    setTimeout(nextRound, 1200);
  }

  function finish() {
    Howler.volume(originalVolume);
    overlay.remove();
    if (score >= PASS_THRESHOLD) onSuccess();
    else onFail();
  }

  nextRound();
}
