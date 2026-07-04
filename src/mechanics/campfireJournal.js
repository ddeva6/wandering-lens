/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save, load } from '../utils/localStorage.js';
import { getGameHour } from '../world/dayNight.js';
import { distance2D } from '../utils/mathUtils.js';
import { copy, t } from '../story/copy.js';

const CAMP_POSITION = { x: 0, z: 0 };
const CAMP_RADIUS = 30;
const NIGHT_START = 20;
const NIGHT_END = 23;
const CHAR_LIMIT = 500;
const READBACK_DAY = 21;
const TYPEWRITER_MS_PER_CHAR = 30;

let playerPosition = { x: 0, z: 0 };
eventBus.on('jeep:positionUpdate', ({ position }) => {
  playerPosition = position;
});

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Reuses hyenaCamp.js's own localStorage flags rather than requiring a new
// wl_hyena_survived key: the fire was tended successfully tonight, or the
// crisis never triggered tonight at all (both count as "safe to write").
function hyenaResolvedTonight(night) {
  const survived = load('campfire_journal_unlocked', null) === night;
  const notTriggered = load('hyena_night', null) !== night;
  return survived || notTriggered;
}

function detectReaction(entryText) {
  const text = entryText.toLowerCase();
  if (/lonely|alone|scared|afraid/.test(text)) {
    return "I wasn't as alone as I thought I was on Day 1. The savanna was already watching over me. I just didn't know the language yet.";
  }
  if (/beautiful|amazing|wonder|incredible/.test(text)) {
    return "I felt it before I understood it. That feeling hasn't left. It just got bigger.";
  }
  if (/grandfather|victor|him|his/.test(text)) {
    return "I came here for him. I'm staying for me. I think that's what he wanted.";
  }
  if (/lost|confused|don't know|unsure/.test(text)) {
    return "I'm still lost. But now I know where I am. That's different.";
  }
  return 'A lot has changed. I have changed. The camera helped me see it.';
}

function typewrite(el, text) {
  let i = 0;
  const interval = setInterval(() => {
    i += 1;
    el.textContent = text.slice(0, i);
    if (i >= text.length) clearInterval(interval);
  }, TYPEWRITER_MS_PER_CHAR);
}

function showReadback(onDone) {
  const journal = load('player_journal', []);
  const dayOne = journal[0];
  if (!dayOne) {
    onDone();
    return;
  }

  // dayOne.text is player-typed content — build the DOM directly rather
  // than interpolating it into innerHTML, which would let markup in a
  // journal entry execute as HTML.
  const overlay = document.createElement('div');
  overlay.className = 'journal-readback-overlay';

  const leftPanel = document.createElement('div');
  leftPanel.className = 'journal-readback-panel';
  const leftLabel = document.createElement('p');
  leftLabel.className = 'journal-readback-label';
  leftLabel.textContent = 'DAY 1';
  const leftText = document.createElement('p');
  leftText.className = 'journal-readback-text';
  leftText.textContent = dayOne.text;
  leftPanel.append(leftLabel, leftText);

  const rightPanel = document.createElement('div');
  rightPanel.className = 'journal-readback-panel';
  const rightLabel = document.createElement('p');
  rightLabel.className = 'journal-readback-label';
  rightLabel.textContent = 'NOW';
  const reaction = document.createElement('p');
  reaction.className = 'journal-readback-reaction';
  rightPanel.append(rightLabel, reaction);

  overlay.append(leftPanel, rightPanel);
  document.body.appendChild(overlay);
  typewrite(reaction, detectReaction(dayOne.text));

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'journal-readback-close';
  closeBtn.textContent = 'Continue';
  closeBtn.addEventListener('click', () => {
    overlay.remove();
    onDone();
  });
  overlay.appendChild(closeBtn);
}

function showJournalInput() {
  const day = load('radio_day', 1);
  const profile = load('asha_profile', null);
  const title = t(copy.journal.title, profile).replace('{day}', day);
  const textareaLabel = t(copy.journal.textareaLabel, profile);
  const overlay = document.createElement('div');
  overlay.className = 'campfire-journal-overlay';
  overlay.innerHTML = `
    <div class="campfire-journal-paper">
      <p class="campfire-journal-title">${title}</p>
      <textarea class="campfire-journal-textarea" maxlength="${CHAR_LIMIT}" placeholder="What happened today..." aria-label="${textareaLabel}"></textarea>
      <p class="campfire-journal-counter">0 / ${CHAR_LIMIT}</p>
      <div class="campfire-journal-buttons">
        <button type="button" class="campfire-journal-close" aria-label="Close without saving">Close</button>
        <button type="button" class="campfire-journal-save" aria-label="Save journal entry">Save to journal</button>
      </div>
    </div>
  `;
  overlay.addEventListener('click', (event) => event.stopPropagation());
  document.body.appendChild(overlay);

  const textarea = overlay.querySelector('.campfire-journal-textarea');
  const counter = overlay.querySelector('.campfire-journal-counter');
  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length} / ${CHAR_LIMIT}`;
  });

  overlay.querySelector('.campfire-journal-close').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.campfire-journal-save').addEventListener('click', () => {
    const journal = load('player_journal', []);
    journal.push({ day, text: textarea.value, timestamp: Date.now() });
    save('player_journal', journal);
    overlay.remove();
  });
}

function startCampfireJournal() {
  const day = load('radio_day', 1);
  if (day === READBACK_DAY) {
    showReadback(showJournalInput);
  } else {
    showJournalInput();
  }
}

export function init() {
  let lastShownNight = null;
  eventBus.on('resource:update', () => {
    const hour = getGameHour();
    if (hour < NIGHT_START || hour >= NIGHT_END) return;
    if (distance2D(playerPosition, CAMP_POSITION) > CAMP_RADIUS) return;

    const night = todayKey();
    if (lastShownNight === night) return;
    if (!hyenaResolvedTonight(night)) return;

    lastShownNight = night;
    startCampfireJournal();
  });
}
