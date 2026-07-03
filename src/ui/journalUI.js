/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { load, save } from '../utils/localStorage.js';
import { victorAttempts } from '../story/victorAttempts.js';
import { journalEntries } from '../story/journalEntries.js';

let isActive = false;
let overlay = null;
let currentTab = 'journal'; // 'journal' or 'challenge'

function createOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'journal-ui-overlay';

  const tabs = document.createElement('div');
  tabs.className = 'journal-tabs';

  const journalTab = document.createElement('button');
  journalTab.className = 'journal-tab journal-tab--active';
  journalTab.textContent = "VICTOR'S JOURNAL";
  journalTab.addEventListener('click', () => switchTab('journal'));

  const challengeTab = document.createElement('button');
  challengeTab.className = 'journal-tab';
  challengeTab.textContent = "VICTOR'S CHALLENGE";
  challengeTab.addEventListener('click', () => {
    if (load('victors_challenge_unlocked', false)) {
      switchTab('challenge');
    }
  });

  tabs.appendChild(journalTab);
  tabs.appendChild(challengeTab);
  overlay.appendChild(tabs);

  const content = document.createElement('div');
  content.className = 'journal-content';
  overlay.appendChild(content);

  document.body.appendChild(overlay);
}

function renderChallengeContent(container) {
  const unlocked = load('victors_challenge_unlocked', false);
  if (!unlocked) {
    container.innerHTML = '<div style="text-align: center; margin-top: 100px; opacity: 0.5;">Locked</div>';
    return;
  }

  const progress = load('victors_challenge_progress', {});
  const completedCount = Object.keys(progress).length;

  let html = `<div class="challenge-progress">${completedCount} / 12</div>`;
  html += `<div class="challenge-grid">`;

  victorAttempts.forEach(entry => {
    const isCompleted = !!progress[entry.id];
    const data = progress[entry.id];

    html += `
      <div class="challenge-card ${isCompleted ? 'challenge-card--completed' : ''}">
        <div class="challenge-header">
          <span>${entry.year} — Zone: ${entry.zone.toUpperCase()}</span>
          <div class="challenge-species-dot" title="${entry.species}"></div>
        </div>
        <div class="challenge-note">${entry.victorNote}</div>
    `;

    if (isCompleted) {
      html += `
        <div class="challenge-scores">
          <div class="challenge-score-item">
            <span class="challenge-score-label">VICTOR</span>
            <span class="challenge-score-value">${data.victorScore}</span>
          </div>
          <div class="challenge-score-item">
            <span class="challenge-score-label">ASHA</span>
            <span class="challenge-score-value">${data.ashaScore}</span>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="challenge-incomplete">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
      `;
    }

    html += `</div>`;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function renderJournalContent(container) {
  const unlockedIds = load('journal_unlocked_ids', []);
  container.innerHTML = journalEntries
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

function handleJournalUnlock({ tier }) {
  const unlockedIds = load('journal_unlocked_ids', []);
  const next = journalEntries.find((entry) => entry.tier === tier && !unlockedIds.includes(entry.id));
  if (next) {
    unlockedIds.push(next.id);
    save('journal_unlocked_ids', unlockedIds);
    if (overlay && currentTab === 'journal') renderJournalContent(overlay.querySelector('.journal-content'));
  }
}

function switchTab(tab) {
  currentTab = tab;

  const tabs = overlay.querySelectorAll('.journal-tab');
  tabs[0].classList.toggle('journal-tab--active', tab === 'journal');
  tabs[1].classList.toggle('journal-tab--active', tab === 'challenge');

  const content = overlay.querySelector('.journal-content');
  if (tab === 'journal') {
    renderJournalContent(content);
  } else {
    renderChallengeContent(content);
  }
}

function toggleJournal() {
  isActive = !isActive;

  if (!overlay) {
    createOverlay();
  }

  const challengeTab = overlay.querySelectorAll('.journal-tab')[1];
  if (!load('victors_challenge_unlocked', false)) {
    challengeTab.classList.add('journal-tab--disabled');
  } else {
    challengeTab.classList.remove('journal-tab--disabled');
  }

  if (isActive) {
    switchTab(currentTab);
    overlay.classList.add('journal-ui-overlay--active');
    eventBus.emit('controls:freeze');
  } else {
    overlay.classList.remove('journal-ui-overlay--active');
    eventBus.emit('controls:unfreeze');
  }
}

export function init() {
  eventBus.on('journal:unlock', handleJournalUnlock);

  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyJ' && !event.repeat) {
      toggleJournal();
    }
  });
}
