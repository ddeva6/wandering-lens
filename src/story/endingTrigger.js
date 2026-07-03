/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save, load } from '../utils/localStorage.js';

const DRAMATIC_PAUSE_MS = 30000;

let isaacRevealedThisSession = false;

function checkConditions() {
  if (load('ending_triggered', false)) return;

  const evidenceComplete = load('evidence', []).length === 6;
  const finalRecordingPlayed = load('played_recordings', []).includes('final_recording');
  const amaraAlly = load('amara_trust', 0) === 3;

  if (!evidenceComplete || !finalRecordingPlayed || !amaraAlly || !isaacRevealedThisSession) return;

  save('ending_triggered', true);
  eventBus.emit('ui:endingApproaching');
  setTimeout(() => eventBus.emit('story:endingUnlocked'), DRAMATIC_PAUSE_MS);
}

export function init() {
  eventBus.on('story:isaacRevealed', () => {
    isaacRevealedThisSession = true;
    checkConditions();
  });
  eventBus.on('story:allTrackersFound', checkConditions);
  eventBus.on('story:finalRecordingFound', checkConditions);
  eventBus.on('amara:trustChanged', checkConditions);
}
