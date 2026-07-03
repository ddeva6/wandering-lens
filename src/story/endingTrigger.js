/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { load, save } from '../utils/localStorage.js';

let isaacRevealedSession = false;
let endingCheckInProgress = false;

function checkConditions() {
  if (endingCheckInProgress) return;
  if (load('wl_ending_triggered', false)) return;

  const evidence = load('wl_evidence', []);
  if (evidence.length < 6) return;

  const recordings = load('wl_played_recordings', []);
  if (!recordings.includes('final_recording')) return;

  const amaraTrust = load('wl_amara_trust', 0);
  if (amaraTrust < 3) return;

  if (!isaacRevealedSession) return;

  endingCheckInProgress = true;
  save('wl_ending_triggered', true);

  eventBus.emit('ui:endingApproaching');

  setTimeout(() => {
    eventBus.emit('story:endingUnlocked');
  }, 30000); // 30 seconds dramatic pause
}

export function init() {
  eventBus.on('story:allTrackersFound', checkConditions);
  eventBus.on('story:finalRecordingFound', checkConditions);
  eventBus.on('amara:trustChanged', checkConditions);

  eventBus.on('story:isaacRevealed', () => {
    isaacRevealedSession = true;
    checkConditions();
  });
}
