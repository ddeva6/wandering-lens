/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';
import { lerp, lerpColor } from '../../utils/mathUtils.js';

const RADIUS_RATIO = 0.6;
const STROKE_WIDTH = 3;
const PULSE_THRESHOLD = 85;
const FLASH_THRESHOLD = 95;
const TOO_CLOSE_DISTANCE = 5;

let nearestDistance = Infinity;

// Fed once per frame by core/loop.js from AnimalManager.getNearestAnimalDistance()
// so this module never has to import the animal system directly.
export function setNearestDistance(distance) {
  nearestDistance = distance;
}

export function getNearestAnimalDistance() {
  return nearestDistance;
}

export function getDistanceScore() {
  const d = nearestDistance;
  let score;
  if (d > 100) score = 0;
  else if (d >= 50) score = lerp(10, 40, (100 - d) / 50);
  else if (d >= 20) score = lerp(40, 75, (50 - d) / 30);
  else if (d >= TOO_CLOSE_DISTANCE) score = lerp(75, 100, (20 - d) / 15);
  else score = 100;

  if (d < TOO_CLOSE_DISTANCE) eventBus.emit('crisis:tooClose', { distance: d });
  return score;
}

export function draw(ctx, width, height) {
  const score = getDistanceScore();
  if (score <= 0) return;

  const cx = width / 2;
  const cy = height / 2;
  let radius = (Math.min(width, height) / 2) * RADIUS_RATIO;
  if (score > PULSE_THRESHOLD) {
    radius += Math.sin(Date.now() * 0.002) * 3;
  }

  ctx.save();
  ctx.globalAlpha = score / 100;
  ctx.strokeStyle = lerpColor('#00ff88', '#ff3300', score / 100);
  ctx.lineWidth = STROKE_WIDTH;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (score > FLASH_THRESHOLD) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);
  }
}
