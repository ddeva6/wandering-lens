/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save, load } from '../utils/localStorage.js';
import { journalEntries } from '../story/journalEntries.js';
import { challengeEntries } from '../story/victorsChallenge.js';

const SPECIES_COLOR = {
  elephant: '#8a8a8a',
  lion: '#c9a13b',
  cheetah: '#d9863d',
  giraffe: '#c9973d',
  zebra: '#2a2a2a',
};

let panel = null;
let activeTab = 'journal';

function handleJournalUnlock({ tier }) {
  const unlockedIds = load('journal_unlocked_ids', []);
  const next = journalEntries.find((entry) => entry.tier === tier && !unlockedIds.includes(entry.id));
  if (next) {
    unlockedIds.push(next.id);
    save('journal_unlocked_ids', unlockedIds);
    if (panel && activeTab === 'journal') renderJournalTab();
  }
}

function renderJournalTab() {
  const unlockedIds = load('journal_unlocked_ids', []);
  const list = panel.querySelector('.journal-entry-list');
  list.innerHTML = journalEntries
    .map((entry) => {
      if (!unlockedIds.includes(entry.id)) {
        return `<div class="journal-entry journal-entry--locked">
          <p class="journal-entry-year">${entry.year}</p>
          <p class="journal-entry-title">???</p>
        </div>`;
      }
      return `<div class="journal-entry">
        <p class="journal-entry-year">${entry.year}</p>
        <p class="journal-entry-title">${entry.title}</p>
        <p class="journal-entry-text">${entry.text}</p>
      </div>`;
    })
    .join('');
}

function renderChallengeTab() {
  const progress = load('victors_challenge_progress', {});
  const completedCount = Object.keys(progress).length;
  const grid = panel.querySelector('.challenge-grid');
  const counter = panel.querySelector('.challenge-progress-counter');
  counter.textContent = `${completedCount} / ${challengeEntries.length}`;

  grid.innerHTML = challengeEntries
    .map((entry) => {
      const done = progress[entry.id];
      const dot = `<span class="challenge-grid-dot" style="background:${SPECIES_COLOR[entry.species]}"></span>`;
      if (!done) {
        return `<div class="challenge-grid-card challenge-grid-card--incomplete">
          <p class="challenge-grid-silhouette">?</p>
          ${dot}
          <p class="challenge-grid-year">${entry.year}</p>
          <p class="challenge-grid-zone">${entry.zone}</p>
        </div>`;
      }
      return `<div class="challenge-grid-card challenge-grid-card--complete">
        ${dot}
        <p class="challenge-grid-year">${entry.year}</p>
        <p class="challenge-grid-zone">${entry.zone}</p>
        <p class="challenge-grid-note">${entry.victorNote}</p>
        <div class="challenge-grid-scores">
          <span>VICTOR ${done.victorScore}</span>
          <span>ASHA ${done.ashaScore}</span>
        </div>
      </div>`;
    })
    .join('');
}

function setTab(tab) {
  activeTab = tab;
  panel.querySelectorAll('.journal-tab').forEach((btn) => {
    btn.classList.toggle('journal-tab--active', btn.dataset.tab === tab);
  });
  panel.querySelector('.journal-tab-panel--journal').classList.toggle('journal-tab-panel--visible', tab === 'journal');
  panel.querySelector('.journal-tab-panel--challenge').classList.toggle('journal-tab-panel--visible', tab === 'challenge');
  if (tab === 'journal') renderJournalTab();
  else renderChallengeTab();
}

function buildPanel() {
  panel = document.createElement('div');
  panel.className = 'journal-panel';
  const unlocked = load('victors_challenge_unlocked', false);
  panel.innerHTML = `
    <div class="journal-tabs">
      <button type="button" class="journal-tab journal-tab--active" data-tab="journal">VICTOR'S JOURNAL</button>
      <button type="button" class="journal-tab ${unlocked ? '' : 'journal-tab--greyed'}" data-tab="challenge">
        VICTOR'S CHALLENGE
        <span class="challenge-progress-counter"></span>
      </button>
    </div>
    <div class="journal-tab-panel journal-tab-panel--journal journal-tab-panel--visible">
      <div class="journal-entry-list"></div>
    </div>
    <div class="journal-tab-panel journal-tab-panel--challenge">
      <div class="challenge-grid"></div>
    </div>
    <button type="button" class="journal-close">Close</button>
  `;
  document.body.appendChild(panel);

  panel.querySelectorAll('.journal-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === 'challenge' && !load('victors_challenge_unlocked', false)) return;
      setTab(btn.dataset.tab);
    });
  });
  panel.querySelector('.journal-close').addEventListener('click', closeJournal);

  renderJournalTab();
}

function openJournal() {
  if (!panel) buildPanel();
  panel.classList.add('journal-panel--visible');
  eventBus.emit('controls:freeze');
}

function closeJournal() {
  if (!panel) return;
  panel.classList.remove('journal-panel--visible');
  eventBus.emit('controls:unfreeze');
}

function toggleJournal() {
  if (panel?.classList.contains('journal-panel--visible')) closeJournal();
  else openJournal();
}

export function init() {
  eventBus.on('journal:unlock', handleJournalUnlock);

  window.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT') return;
    if (event.key.toLowerCase() === 'j') toggleJournal();
  });
}
