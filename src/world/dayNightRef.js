/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

// Registered once by main.js so scripted sequences (e.g. the bury ending's
// forced nightfall) can reach the single dayNightCycle instance created in
// main.js's start() without threading it through every module individually.
let dayNightController = null;

export function setDayNightRef(controller) {
  dayNightController = controller;
}

export function getDayNightRef() {
  return dayNightController;
}
