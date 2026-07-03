/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { getGameHour } from '../../world/dayNight.js';
import { lerpColor } from '../../utils/mathUtils.js';

const GOLDEN_WINDOWS = [
  { start: 6.5, end: 9 },
  { start: 16, end: 18.5 },
];

const RADIUS_RATIO = 0.88;
const STROKE_WIDTH = 4;
const GLOW_THRESHOLD = 90;

// Triangular ramp: rises 0→100 from window start to midpoint, then decays
// 100→0 from midpoint to window end.
function windowScore(hour, start, end) {
  if (hour < start || hour > end) return null;
  const mid = (start + end) / 2;
  if (hour <= mid) return ((hour - start) / (mid - start)) * 100;
  return ((end - hour) / (end - mid)) * 100;
}

export function getTimingScore() {
  const hour = getGameHour();
  for (const window of GOLDEN_WINDOWS) {
    const score = windowScore(hour, window.start, window.end);
    if (score !== null) return score;
  }
  return 0;
}

export function isGoldenHour() {
  const hour = getGameHour();
  return GOLDEN_WINDOWS.some((w) => hour >= w.start && hour <= w.end);
}

export function draw(ctx, width, height) {
  const value = getTimingScore();
  if (value <= 0) return;

  const cx = width / 2;
  const cy = height / 2;
  const radius = (Math.min(width, height) / 2) * RADIUS_RATIO;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (value / 100) * Math.PI * 2;

  ctx.save();
  ctx.strokeStyle = lerpColor('#ff6b00', '#ffd700', value / 100);
  ctx.lineWidth = STROKE_WIDTH;
  ctx.lineCap = 'round';
  if (value > GLOW_THRESHOLD) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffd700';
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();
}
