/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';

const MOMENT_WINDOW_MS = 4000;
const RING_LOOP_MS = 1000;
const RING_MIN_RADIUS = 8;
const RING_MAX_RADIUS = 24;

const QUALITY_SCORE = { good: 50, perfect: 75, legendary: 100 };

let activeMoment = null;

eventBus.on('photo:momentActive', ({ species, quality }) => {
  activeMoment = { species, quality, timestamp: Date.now() };
});

function currentMoment() {
  if (!activeMoment) return null;
  if (Date.now() - activeMoment.timestamp > MOMENT_WINDOW_MS) {
    activeMoment = null;
    return null;
  }
  return activeMoment;
}

export function hasActiveMoment() {
  return currentMoment() !== null;
}

export function getActiveMoment() {
  return currentMoment();
}

export function getMomentScore() {
  const moment = currentMoment();
  if (!moment) return 0;
  return QUALITY_SCORE[moment.quality] ?? 0;
}

function drawRing(ctx, cx, cy, elapsedInLoop, colour) {
  const t = elapsedInLoop / RING_LOOP_MS;
  const radius = RING_MIN_RADIUS + (RING_MAX_RADIUS - RING_MIN_RADIUS) * t;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = 1 - t;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function draw(ctx, width, height) {
  const moment = currentMoment();
  const score = getMomentScore();
  if (score <= 0 || !moment) return;

  const cx = width / 2;
  const cy = height / 2;
  const isLegendary = moment.quality === 'legendary';
  const elapsed = (Date.now() - moment.timestamp) % RING_LOOP_MS;

  ctx.save();
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(cx, cy, RING_MIN_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  drawRing(ctx, cx, cy, elapsed, isLegendary ? '#ffd700' : '#ffffff');
  if (isLegendary) {
    drawRing(ctx, cx, cy, (elapsed + RING_LOOP_MS / 2) % RING_LOOP_MS, '#ffd700');
  }

  ctx.fillStyle = isLegendary ? '#ffd700' : '#ffffff';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.letterSpacing = '0.1em';
  ctx.fillText(moment.species.toUpperCase(), cx, cy + 18);
  ctx.restore();
}
