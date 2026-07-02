/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Color } from 'three';

// Phase 1 stub: only the sky colour changes with in-game time.
// One full in-game day (24 in-game minutes) passes in 4 real minutes.
const REAL_SECONDS_PER_CYCLE = 4 * 60;
const DAWN_START = 5 / 24;
const DAY_START = 8 / 24;
const DUSK_START = 17 / 24;
const NIGHT_START = 20 / 24;

const NIGHT = new Color(0x0a0e1a);
const DAWN = new Color(0xd98a4a);
const DAY = new Color(0x87ceeb);
const DUSK = new Color(0xc4552d);

export function createDayNightCycle(scene, startTimeOfDay = 6 / 24) {
  // timeOfDay: 0..1 where 0 is midnight and 0.5 is noon
  let timeOfDay = startTimeOfDay;
  const sky = new Color();

  function skyColourAt(t) {
    if (t < DAWN_START) return sky.copy(NIGHT);
    if (t < DAY_START) {
      return sky.lerpColors(NIGHT, DAY, (t - DAWN_START) / (DAY_START - DAWN_START)).lerp(DAWN, 0.3);
    }
    if (t < DUSK_START) return sky.copy(DAY);
    if (t < NIGHT_START) {
      return sky.lerpColors(DAY, NIGHT, (t - DUSK_START) / (NIGHT_START - DUSK_START)).lerp(DUSK, 0.3);
    }
    return sky.copy(NIGHT);
  }

  function update(delta) {
    timeOfDay = (timeOfDay + delta / REAL_SECONDS_PER_CYCLE) % 1;
    scene.background.copy(skyColourAt(timeOfDay));
  }

  return {
    update,
    getTimeOfDay: () => timeOfDay,
  };
}
