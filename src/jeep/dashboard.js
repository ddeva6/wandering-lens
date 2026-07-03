/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import {
  CanvasTexture,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  SRGBColorSpace,
} from 'three';
import { load } from '../utils/localStorage.js';
import { DEFAULT_RESOURCES } from '../mechanics/survival/resourceManager.js';

const REFRESH_SECONDS = 1;
const CANVAS_W = 256;
const CANVAS_H = 128;

const BARS = [
  { key: 'fuel', max: 100 }, // colour computed green→red from value
  { key: 'battery', max: 100, color: '#3b82f6' },
  { key: 'water', max: 100, color: '#22d3ee' },
  { key: 'film', max: 36, color: '#f59e0b' },
];

function fuelColor(ratio) {
  const hue = Math.round(ratio * 120); // 120 = green, 0 = red
  return `hsl(${hue}, 85%, 45%)`;
}

// Dashboard lives on a plane attached to the jeep — a 3D object in the
// scene, not a HUD overlay.
export function createDashboard(jeepGroup) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const geometry = new PlaneGeometry(1.4, 0.7);
  const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
  const panel = new Mesh(geometry, material);
  panel.position.set(0, 1.15, 0.55);
  panel.rotation.x = -0.5;
  jeepGroup.add(panel);

  function draw(resources) {
    ctx.fillStyle = '#14181c';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const barHeight = 14;
    const gap = (CANVAS_H - BARS.length * barHeight) / (BARS.length + 1);
    BARS.forEach((bar, i) => {
      const y = gap + i * (barHeight + gap);
      const ratio = Math.min(1, Math.max(0, (resources[bar.key] ?? 0) / bar.max));
      ctx.fillStyle = '#2a3138';
      ctx.fillRect(16, y, CANVAS_W - 32, barHeight);
      ctx.fillStyle = bar.color ?? fuelColor(ratio);
      ctx.fillRect(16, y, (CANVAS_W - 32) * ratio, barHeight);
    });
    texture.needsUpdate = true;
  }

  draw(load('resources', DEFAULT_RESOURCES));
  let timer = 0;

  return {
    panel,
    update(delta) {
      timer += delta;
      if (timer < REFRESH_SECONDS) return;
      timer = 0;
      draw(load('resources', DEFAULT_RESOURCES));
    },
    dispose() {
      jeepGroup.remove(panel);
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}
