/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';

// Shared read access to the current in-game hour so animal AI modules don't
// each need a reference to the dayNightCycle instance created in main.js.
// main.js calls setGameHour() from the same update tick that drives
// dayNightCycle's own clock, so the two stay in sync.
let currentHour = 6.5;
let lastIntegerHour = Math.floor(currentHour);

export function setGameHour(hour) {
  const previousHour = currentHour;
  currentHour = hour;

  const integerHour = Math.floor(hour);
  if (integerHour !== lastIntegerHour) {
    lastIntegerHour = integerHour;
    eventBus.emit('world:hourChange', { hour: integerHour });
  }

  // Midnight crossing: hour wraps from the high end of the day back to 0.
  if (hour < previousHour && previousHour > 12) {
    eventBus.emit('world:newDay');
  }
}

export function getGameHour() {
  return currentHour;
}
