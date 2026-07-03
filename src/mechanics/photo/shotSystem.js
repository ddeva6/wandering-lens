/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { save, load } from '../../utils/localStorage.js';
import { eventBus } from '../../utils/eventBus.js';
import { getGameHour } from '../../world/dayNight.js';
import { getTimingScore } from './timingMeter.js';
import { victorAttempts } from '../../story/victorAttempts.js';
import { getPlayerPosition } from '../../jeep/onFootMode.js';
import { getZone } from '../../utils/mathUtils.js';
import { getDistanceScore } from './distanceMeter.js';
import { getMomentScore, getActiveMoment } from './momentDetector.js';

const TIMING_WEIGHT = 0.35;
const DISTANCE_WEIGHT = 0.4;
const MOMENT_WEIGHT = 0.25;
const LEGENDARY_THRESHOLD = 80;
const STANDARD_COST = 1;
const LEGENDARY_COST = 3;

// Set once by main.js with resourceManager (mechanics/survival/resourceManager.js)
// — sharing its single in-memory object, rather than shotSystem doing its
// own independent localStorage round trip, avoids resourceManager's
// periodic autosave clobbering a shot's film deduction.
let resourcesController = null;

export function init(controller) {
  resourcesController = controller;
}

export function calculateScore() {
  const timing = getTimingScore() * TIMING_WEIGHT;
  const distance = getDistanceScore() * DISTANCE_WEIGHT;
  const moment = getMomentScore() * MOMENT_WEIGHT;
  return Math.round(timing + distance + moment);
}

export function isLegendaryShot() {
  return (
    getTimingScore() >= LEGENDARY_THRESHOLD &&
    getDistanceScore() >= LEGENDARY_THRESHOLD &&
    getMomentScore() >= LEGENDARY_THRESHOLD
  );
}

function unlockTier(score) {
  if (score >= 90) return 'legendary';
  if (score >= 70) return 'perfect';
  if (score >= 45) return 'good';
  return 'basic';
}

export function takeShot(isLegendary = false) {
  const resources = resourcesController.get();
  if (resources.film <= 0) {
    eventBus.emit('photo:noFilm');
    return null;
  }

  const cost = isLegendary ? LEGENDARY_COST : STANDARD_COST;
  if (resources.film < cost) {
    eventBus.emit('photo:insufficientFilm');
    return null;
  }

  resources.film -= cost;
  save('resources', resources);

  const score = calculateScore();
  const activeMoment = getActiveMoment();
  const shot = {
    id: Date.now(),
    score,
    isLegendary,
    species: activeMoment?.species ?? null,
    gameHour: getGameHour(),
    timing: getTimingScore(),
    distance: getDistanceScore(),
    moment: getMomentScore(),
    timestamp: Date.now(),
  };

  const album = load('photo_album', []);
  album.push(shot);
  save('photo_album', album);

  eventBus.emit('photo:taken', shot);
  if (isLegendary) {
    eventBus.emit('photo:legendary', shot);

    // Check against Victor's challenge. shot.species is only ever set when
    // an active photo:momentActive fired for that species (see the species
    // classes under src/animals/species/), so a species+zone match already
    // implies the requiredMoment happened — there's no separate moment-type
    // field on activeMoment to compare against.
    if (load('victors_challenge_active', false)) {
      const pos = getPlayerPosition();
      const zone = getZone(pos.x, pos.z);
      const progress = load('victors_challenge_progress', {});

      const match = victorAttempts.find(entry =>
        entry.species === shot.species &&
        entry.zone === zone &&
        !progress[entry.id] &&
        Math.random() < (entry.rarity || 0.15)
      );

      if (match) {
        eventBus.emit('challenge:shotMatched', { entry: match, shot });
      }
    }
  }

  eventBus.emit('journal:unlock', { tier: unlockTier(score), species: shot.species, score });

  return shot;
}
