/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { save, load } from './localStorage.js';

// One-time default seeding for every wl_ key that a module reads via
// load(key, default) before anything has ever written to it. Centralised
// here (rather than scattered through main.js's start()) so the list stays
// under the file's 200-line budget as new systems add their own keys.
export function initSaveKeys() {
  if (load('photo_album', null) === null) save('photo_album', []);
  if (load('played_recordings', null) === null) save('played_recordings', []);
  if (load('radio_day', null) === null) save('radio_day', 1);
  if (load('missed_checkins', null) === null) save('missed_checkins', []);
  if (load('player_journal', null) === null) save('player_journal', []);
  if (load('evidence', null) === null) save('evidence', []);
  if (load('amara_trust', null) === null) save('amara_trust', 0);
  if (load('amara_tests', null) === null) {
    save('amara_tests', { test1: false, test2: false, test3: false });
  }
  if (load('ending_triggered', null) === null) save('ending_triggered', false);
  if (load('ending_chosen', null) === null) save('ending_chosen', null);
  if (load('victors_challenge_unlocked', null) === null) save('victors_challenge_unlocked', false);
  if (load('victors_challenge_active', null) === null) save('victors_challenge_active', false);
  if (load('victors_challenge_progress', null) === null) save('victors_challenge_progress', {});
  if (load('victors_challenge_complete', null) === null) save('victors_challenge_complete', false);
}
