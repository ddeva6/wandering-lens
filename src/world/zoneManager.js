/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Color } from 'three';
import { eventBus } from '../utils/eventBus.js';
import { load } from '../utils/localStorage.js';
import { smoothstep, lerp } from '../utils/mathUtils.js';

// Circles of visual/atmospheric identity — distinct from mathUtils.js's
// getZone() quadrant split (used for Victor's Challenge matching), which is
// an unrelated, coarser east/west/north/south classification.
const ZONES = [
  {
    name: 'camp',
    center: { x: 0, z: 0 },
    radius: 150,
    fogColor: 0xd9b98a,
    fogFar: 1250, // ~= 1 / 0.0008
    ambientTint: 0xffe8b8,
  },
  {
    name: 'waterhole',
    center: { x: 50, z: 80 },
    radius: 120,
    fogColor: 0xb8ccae,
    fogFar: 1429, // ~= 1 / 0.0007
    ambientTint: 0xc8e8c0,
  },
  {
    name: 'eastern',
    center: { x: 580, z: 20 },
    radius: 250,
    fogColor: 0xc98d6b,
    fogFar: 833, // ~= 1 / 0.0012
    ambientTint: 0xe8b898,
  },
  {
    name: 'plateau',
    center: { x: 0, z: -300 },
    radius: 200,
    fogColor: 0xa8c4d9,
    fogFar: 2500, // ~= 1 / 0.0004
    ambientTint: 0xc8dcf0,
  },
  {
    name: 'burnt',
    center: { x: 80, z: 180 },
    radius: 180,
    fogColor: 0x8a8578,
    fogFar: 667, // ~= 1 / 0.0015
    ambientTint: 0xa8a49c,
    requiresComeback: 'wildfire',
  },
];

const CLEAR_WEATHER_FAR = 1800; // world/weather.js's SETTINGS.clear.fogFar — the baseline this scales against
const ENTER_THRESHOLD = 0.6;

const scratch = new Color();
const scratchZoneColor = new Color();
const scratchTintFactor = new Color();
let baseHemiColor = null;
let hemiLightRef = null;
let sceneRef = null;

const enteredState = new Map();

function activeZones() {
  const comeback = load('comeback', {});
  return ZONES.filter((zone) => !zone.requiresComeback || comeback[zone.requiresComeback] === true);
}

// Returns { zone, weight }[] for every currently-active zone, weight in
// [0, 1], full inside radius * 0.6, feathering to 0 by radius.
function rawWeights(x, z) {
  return activeZones().map((zone) => {
    const dist = Math.hypot(x - zone.center.x, z - zone.center.z);
    const innerEdge = zone.radius * 0.6;
    const weight = 1 - smoothstep(innerEdge, zone.radius, dist);
    return { zone, weight };
  });
}

function emitEnterEvents(weights) {
  weights.forEach(({ zone, weight }) => {
    const wasEntered = enteredState.get(zone.name) || false;
    if (weight >= ENTER_THRESHOLD && !wasEntered) {
      enteredState.set(zone.name, true);
      eventBus.emit('zone:entered', { name: zone.name });
    } else if (weight < ENTER_THRESHOLD && wasEntered) {
      enteredState.set(zone.name, false);
    }
  });
}

export function init(scene, hemiLight) {
  sceneRef = scene;
  hemiLightRef = hemiLight;
  baseHemiColor = hemiLight.color.clone();
}

// Called after weather.update()/dayNight.update() each frame so it can
// blend on top of whatever base fog colour and hemisphere intensity those
// already set this frame, rather than fighting them for control.
// weatherFogFar is weather.js's own clean eased value (not scene.fog.far,
// which this function itself writes to — reading that back next frame
// would compound its own previous output toward zero instead of
// converging on a stable blend).
export function update(playerPosition, weatherFogFar) {
  if (!sceneRef || !hemiLightRef) return;

  const weights = rawWeights(playerPosition.x, playerPosition.z);
  emitEnterEvents(weights);

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const blendAmount = Math.min(1, totalWeight);
  if (blendAmount <= 0.001) return;

  // Normalise just the active zones' contributions so overlapping zones
  // blend between each other rather than each pulling toward black/zero.
  scratchZoneColor.setRGB(0, 0, 0);
  scratchTintFactor.setRGB(0, 0, 0);
  let blendedFar = 0;
  weights.forEach(({ zone, weight }) => {
    if (weight <= 0) return;
    const share = weight / totalWeight;
    scratchZoneColor.add(scratch.set(zone.fogColor).multiplyScalar(share));
    scratchTintFactor.add(scratch.set(zone.ambientTint).multiplyScalar(share));
    blendedFar += zone.fogFar * share;
  });

  if (sceneRef.fog && !sceneRef.fog.wildfireOverride) {
    sceneRef.fog.color.lerp(scratchZoneColor, blendAmount);
    // Combine with weather's own far-plane target rather than replacing it
    // — a storm inside the burnt zone should be worse than either alone.
    const combinedFar = weatherFogFar * (blendedFar / CLEAR_WEATHER_FAR);
    sceneRef.fog.far = lerp(weatherFogFar, combinedFar, blendAmount);
  }

  const tint = new Color(0xffffff).lerp(scratchTintFactor, blendAmount);
  hemiLightRef.color.copy(baseHemiColor).multiply(tint);
}

export function getZoneDensityAt(x, z) {
  const weights = rawWeights(x, z);
  return weights.reduce((acc, { zone, weight }) => {
    acc[zone.name] = weight;
    return acc;
  }, {});
}

export { ZONES };
