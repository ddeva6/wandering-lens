/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

const KMH_TO_MS = 1 / 3.6;

export function kmhToMs(kmh) {
  return kmh * KMH_TO_MS;
}

export function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// Moves `mesh` toward `target` at kmh, rotating to face travel direction.
// Returns true once within arriveThreshold of the target.
export function moveToward(mesh, target, kmh, delta, arriveThreshold = 0.5) {
  const dx = target.x - mesh.position.x;
  const dz = target.z - mesh.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist < arriveThreshold) return true;

  const step = Math.min(dist, kmhToMs(kmh) * delta);
  mesh.position.x += (dx / dist) * step;
  mesh.position.z += (dz / dist) * step;
  mesh.rotation.y = Math.atan2(dx, dz);
  return false;
}

// Moves `mesh` directly away from `source` at kmh.
export function moveAway(mesh, source, kmh, delta) {
  const dx = mesh.position.x - source.x;
  const dz = mesh.position.z - source.z;
  const dist = Math.sqrt(dx * dx + dz * dz) || 1;
  const step = kmhToMs(kmh) * delta;
  mesh.position.x += (dx / dist) * step;
  mesh.position.z += (dz / dist) * step;
  mesh.rotation.y = Math.atan2(dx, dz);
}

// Same west/east/north/south quadrant split used to place every species'
// spawn zone (see AnimalManager species spawn constants) and reused by
// photoComparison.js / Victor's Challenge for zone matching.
export function getZone(x, z) {
  if (Math.abs(x) >= Math.abs(z)) return x >= 0 ? 'east' : 'west';
  return z >= 0 ? 'south' : 'north';
}

export function randomInRadius(centerX, centerZ, radius) {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * radius;
  return { x: centerX + Math.cos(angle) * r, z: centerZ + Math.sin(angle) * r };
}

export function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

// Interpolates between two '#rrggbb' hex colours, returned as 'rgb(r, g, b)'.
export function lerpColor(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return `rgb(${r}, ${g}, ${bl})`;
}
