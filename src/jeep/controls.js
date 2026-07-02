/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import nipplejs from 'nipplejs';

const MOUSE_SENSITIVITY = 0.002;
const SWIPE_SENSITIVITY = 0.005;
const PITCH_MIN = -0.4;
const PITCH_MAX = 1.1;
const JOYSTICK_THRESHOLD = 0.3;

const KEY_MAP = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

function clampPitch(value) {
  return Math.min(PITCH_MAX, Math.max(PITCH_MIN, value));
}

export function createControls(canvas) {
  const keys = { forward: false, backward: false, left: false, right: false };
  const look = { yaw: 0, pitch: 0.15 };

  // --- Desktop: WASD + pointer-lock mouse look -------------------------
  window.addEventListener('keydown', (event) => {
    const action = KEY_MAP[event.code];
    if (action) keys[action] = true;
  });
  window.addEventListener('keyup', (event) => {
    const action = KEY_MAP[event.code];
    if (action) keys[action] = false;
  });

  canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
  });
  document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement !== canvas) return;
    look.yaw -= event.movementX * MOUSE_SENSITIVITY;
    look.pitch = clampPitch(look.pitch + event.movementY * MOUSE_SENSITIVITY);
  });

  // --- Mobile: nipplejs joystick + swipe look ---------------------------
  // Zones are created lazily on the first touch so they never intercept
  // mouse clicks — both input paths coexist in the same build.
  window.addEventListener('touchstart', initTouchZones, { once: true });

  function initTouchZones() {
    const joystickZone = document.createElement('div');
    joystickZone.className = 'joystick-zone';
    const swipeZone = document.createElement('div');
    swipeZone.className = 'swipe-zone';
    document.body.append(joystickZone, swipeZone);

    const joystick = nipplejs.create({
      zone: joystickZone,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'white',
      size: 110,
    });
    joystick.on('move', (event, data) => {
      const { x, y } = data.vector;
      keys.forward = y > JOYSTICK_THRESHOLD;
      keys.backward = y < -JOYSTICK_THRESHOLD;
      keys.left = x < -JOYSTICK_THRESHOLD;
      keys.right = x > JOYSTICK_THRESHOLD;
    });
    joystick.on('end', () => {
      keys.forward = keys.backward = keys.left = keys.right = false;
    });

    let lastTouch = null;
    swipeZone.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0];
      lastTouch = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
    });
    swipeZone.addEventListener('touchmove', (event) => {
      if (!lastTouch) return;
      for (const touch of event.changedTouches) {
        if (touch.identifier !== lastTouch.id) continue;
        look.yaw -= (touch.clientX - lastTouch.x) * SWIPE_SENSITIVITY;
        look.pitch = clampPitch(look.pitch + (touch.clientY - lastTouch.y) * SWIPE_SENSITIVITY);
        lastTouch.x = touch.clientX;
        lastTouch.y = touch.clientY;
      }
    });
    swipeZone.addEventListener('touchend', () => {
      lastTouch = null;
    });
  }

  return {
    keys,
    getLook: () => look,
  };
}
