/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { load } from '../utils/localStorage.js';
import { DROPS } from './isaacGifts.js';

const TRIGGER_DELAY_MS = 3000;
const ANNOTATION_STEP_MS = 1000;
const PAUSE_AFTER_MAP_MS = 2000;
const GESTURE_TYPE_MS = 1500;
const TYPEWRITER_MS_PER_CHAR = 25;

const MAP_BOUNDS = { minX: -500, maxX: 650, minZ: -350, maxZ: 450 };
const VIEW_W = 400;
const VIEW_H = 300;

const DOT_ANNOTATIONS = {
  1: 'He knew you arrived.',
  2: 'He knew you found the waterhole.',
  3: 'He knew you crossed the valley.',
  4: 'He knew you were near his routes.',
  5: 'He knew you found the camp.',
  6: 'He knows what you know.',
};

const GESTURE_PAIRS = [
  ['He gave you fuel.', 'He mapped your position.'],
  ['He warned you away from the east.', "That's where Victor's evidence is buried."],
  ['He said Victor would be proud.', 'He knows Victor is gone because of him.'],
];

// Real-time breadcrumb sample of the player's route, kept self-contained
// here rather than adding a route recorder to jeep/onFoot modules just for
// this one map.
const routePoints = [];
const ROUTE_SAMPLE_MS = 2000;
const ROUTE_MAX_POINTS = 200;

function project(x, z) {
  const px = ((x - MAP_BOUNDS.minX) / (MAP_BOUNDS.maxX - MAP_BOUNDS.minX)) * VIEW_W;
  const py = ((z - MAP_BOUNDS.minZ) / (MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ)) * VIEW_H;
  return { x: px, y: py };
}

function buildMapSvg() {
  const evidenceOrder = load('evidence', []);
  const dots = evidenceOrder
    .map((id) => DROPS.find((d) => d.id === id))
    .filter(Boolean)
    .map((drop) => ({ ...project(drop.position.x, drop.position.z), id: drop.id }));

  const dotLine = dots.map((d) => `${d.x},${d.y}`).join(' ');
  const routeLine = routePoints.map((p) => `${p.x},${p.y}`).join(' ');
  const circles = dots
    .map((d) => `<circle cx="${d.x}" cy="${d.y}" r="4" fill="#ff3300" data-drop="${d.id}" />`)
    .join('');

  return `
    <svg class="gps-reveal-map" viewBox="0 0 ${VIEW_W} ${VIEW_H}">
      <polyline points="${routeLine}" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5" />
      <polyline points="${dotLine}" fill="none" stroke="#ff3300" stroke-width="1" stroke-dasharray="4 4" />
      ${circles}
    </svg>
  `;
}

function typewrite(el, text, onDone) {
  let i = 0;
  const interval = setInterval(() => {
    i += 1;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      clearInterval(interval);
      onDone?.();
    }
  }, TYPEWRITER_MS_PER_CHAR);
}

function runAnnotations(overlay, onDone) {
  const evidenceOrder = load('evidence', []);
  const list = overlay.querySelector('.gps-reveal-annotations');
  let i = 0;

  function next() {
    if (i >= evidenceOrder.length) {
      setTimeout(onDone, PAUSE_AFTER_MAP_MS);
      return;
    }
    const dropId = evidenceOrder[i];
    const line = document.createElement('p');
    line.className = 'gps-reveal-annotation';
    line.textContent = DOT_ANNOTATIONS[dropId] ?? '';
    list.appendChild(line);
    i += 1;
    setTimeout(next, ANNOTATION_STEP_MS);
  }
  next();
}

function runGestures(overlay, onDone) {
  const container = overlay.querySelector('.gps-reveal-gestures');
  let i = 0;

  function next() {
    if (i >= GESTURE_PAIRS.length) {
      onDone();
      return;
    }
    const [kind, truth] = GESTURE_PAIRS[i];
    i += 1;
    const kindLine = document.createElement('p');
    kindLine.className = 'gps-reveal-gesture-kind';
    container.appendChild(kindLine);
    typewrite(kindLine, kind, () => {
      const truthLine = document.createElement('p');
      truthLine.className = 'gps-reveal-gesture-truth';
      container.appendChild(truthLine);
      typewrite(truthLine, truth, () => setTimeout(next, GESTURE_TYPE_MS));
    });
  }
  next();
}

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'gps-reveal-overlay';
  overlay.innerHTML = `
    <p class="gps-reveal-title">SIX TRACKING DEVICES</p>
    <p class="gps-reveal-subtitle">Isaac Mwangi. Every stop. Every zone.</p>
    ${buildMapSvg()}
    <div class="gps-reveal-annotations"></div>
    <div class="gps-reveal-gestures"></div>
    <button type="button" class="gps-reveal-dismiss" style="display:none">I understand.</button>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function trigger() {
  const overlay = buildOverlay();
  runAnnotations(overlay, () => {
    runGestures(overlay, () => {
      const dismiss = overlay.querySelector('.gps-reveal-dismiss');
      dismiss.style.display = 'block';
      dismiss.addEventListener('click', () => {
        overlay.remove();
        eventBus.emit('story:isaacRevealed');
      });
    });
  });
}

let lastSampleAt = 0;

export const gpsTrackerReveal = {
  init() {
    eventBus.on('jeep:positionUpdate', ({ position }) => {
      const now = Date.now();
      if (now - lastSampleAt < ROUTE_SAMPLE_MS) return;
      lastSampleAt = now;
      routePoints.push(project(position.x, position.z));
      if (routePoints.length > ROUTE_MAX_POINTS) routePoints.shift();
    });

    eventBus.on('story:allTrackersFound', () => {
      setTimeout(trigger, TRIGGER_DELAY_MS);
    });
  },
};
