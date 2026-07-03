/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { load } from '../../utils/localStorage.js';
import { DEFAULT_RESOURCES } from '../survival/resourceManager.js';
import * as timingMeter from './timingMeter.js';
import * as distanceMeter from './distanceMeter.js';
import * as momentDetector from './momentDetector.js';

let canvas = null;
let ctx = null;
let active = false;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function mount() {
  if (active) return;
  canvas = document.createElement('canvas');
  canvas.className = 'viewfinder-canvas';
  ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  active = true;
}

export function unmount() {
  if (!active) return;
  window.removeEventListener('resize', resizeCanvas);
  canvas.remove();
  canvas = null;
  ctx = null;
  active = false;
}

export function isActive() {
  return active;
}

function drawVignette(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.hypot(cx, cy);
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawCrosshair(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy);
  ctx.lineTo(cx + 10, cy);
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx, cy + 10);
  ctx.stroke();
}

function drawCircularFrame(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.85 * 0.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFilmCounter(width, height) {
  const film = Math.max(0, Math.round(load('resources', DEFAULT_RESOURCES).film));
  ctx.fillStyle = '#ffffff';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`FILM: ${film}`, width - 16, height - 16);
}

// Called by the main render loop once per frame while isActive() is true —
// a single shared render loop rather than a second independent rAF.
export function draw() {
  if (!active || !ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  drawVignette(width, height);
  drawCrosshair(width, height);
  drawCircularFrame(width, height);
  timingMeter.draw(ctx, width, height);
  distanceMeter.draw(ctx, width, height);
  momentDetector.draw(ctx, width, height);
  drawFilmCounter(width, height);
}
