/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

// Shared read access to the current in-game hour so animal AI modules don't
// each need a reference to the dayNightCycle instance created in main.js.
// main.js calls setGameHour() from the same update tick that drives
// dayNightCycle's own clock, so the two stay in sync.
let currentHour = 6.5;

export function setGameHour(hour) {
  currentHour = hour;
}

export function getGameHour() {
  return currentHour;
}
