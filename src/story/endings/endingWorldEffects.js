/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Howler } from 'howler';
import { Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { eventBus } from '../../utils/eventBus.js';
import { moveToward, lerp } from '../../utils/mathUtils.js';
import { getJeepRef } from '../../jeep/jeepPhysics.js';
import { getDayNightRef } from '../../world/dayNightRef.js';
import { getAnimalManager } from '../../animals/AnimalManager.js';
import { amara } from '../../characters/amara/AmaraCharacter.js';
import { holdCameraOn } from '../../core/camera.js';

const TICK_MS = 100;
const DRIVE_KMH = 25;
const NIGHT_TIME_OF_DAY = 21 / 24;
const HERD_GATHER_RADIUS = 15;

// The real handlers behind the ending cutscenes' world-affecting events —
// split out from worldEndingVisuals.js (which just spawns scenery) so
// neither file grows past the 200-line budget.
export function init() {
  // buryEnding.js's Phase A: drive to Victor's camp, then kneel by lowering
  // the jeep mesh on Y. Payload reuses {x,z} as the drive target and
  // {y,duration} as the kneel offset/timing applied once arrived.
  eventBus.on('jeep:forceMove', ({ x, y, z, duration }) => {
    const jeep = getJeepRef();
    if (!jeep) return;

    const driveInterval = setInterval(() => {
      const arrived = moveToward(jeep, { x, z }, DRIVE_KMH, TICK_MS / 1000, 1);
      if (arrived) {
        clearInterval(driveInterval);
        const startY = jeep.position.y;
        const targetY = startY + y;
        let elapsed = 0;
        const kneelInterval = setInterval(() => {
          elapsed += TICK_MS;
          jeep.position.y = lerp(startY, targetY, elapsed / duration);
          if (elapsed >= duration) clearInterval(kneelInterval);
        }, TICK_MS);
      }
    }, TICK_MS);
  });

  // buryEnding.js's Phase B: herd walks to loosely circle the camp. Each
  // member's own per-frame update() already walks it toward whatever
  // target walkTo() set, so this just needs to set that target once.
  eventBus.on('animal:forceElephantHerd', ({ target }) => {
    const herd = getAnimalManager()?.elephantHerd;
    if (!herd) return;
    herd.members.forEach((member, i) => {
      const angle = (i / herd.members.length) * Math.PI * 2;
      member.walkTo({
        x: target.x + Math.cos(angle) * HERD_GATHER_RADIUS,
        z: target.z + Math.sin(angle) * HERD_GATHER_RADIUS,
      });
    });
  });

  eventBus.on('world:forceNightfall', () => {
    getDayNightRef()?.setTimeOfDay(NIGHT_TIME_OF_DAY);
  });

  // No dedicated animal-sound bus exists, so the global Howler mix is the
  // closest available proxy for "reduce animal sound volume".
  eventBus.on('world:setAnimalVolume', ({ volume }) => {
    Howler.volume(Howler.volume() * volume);
  });

  // returnEnding.js's Phase C: Asha's jeep drives east while the camera
  // holds on the gathering (Amara's position) so the jeep shrinks to a dot.
  eventBus.on('jeep:driveAwayEast', () => {
    const jeep = getJeepRef();
    if (!jeep) return;

    const groupPos = { x: amara.mesh.position.x, z: amara.mesh.position.z };
    const sunrisePoint = { x: groupPos.x + 400, z: groupPos.z + 100 };
    holdCameraOn(
      { x: groupPos.x, y: 15, z: groupPos.z + 40 },
      { x: groupPos.x, y: 0, z: groupPos.z },
      20000
    );

    const driveInterval = setInterval(() => {
      const arrived = moveToward(jeep, sunrisePoint, DRIVE_KMH * 1.5, TICK_MS / 1000, 3);
      if (arrived) clearInterval(driveInterval);
    }, TICK_MS);
  });

  // returnEnding.js's Phase A: the journal mesh lerps from Asha's (the
  // jeep's) position to Amara's over 3 seconds.
  eventBus.on('story:giveJournalToAmara', () => {
    const jeep = getJeepRef();
    if (!jeep || !amara.mesh) return;
    const scene = getAnimalManager()?.scene;
    if (!scene) return;

    const from = { x: jeep.position.x, z: jeep.position.z };
    const book = new Mesh(new BoxGeometry(0.25, 0.05, 0.35), new MeshStandardMaterial({ color: 0x6b4a2a }));
    book.position.set(from.x, 1, from.z);
    scene.add(book);

    const durationMs = 3000;
    let elapsed = 0;
    const moveInterval = setInterval(() => {
      elapsed += TICK_MS;
      const t = elapsed / durationMs;
      book.position.x = lerp(from.x, amara.mesh.position.x, t);
      book.position.z = lerp(from.z, amara.mesh.position.z, t);
      if (elapsed >= durationMs) clearInterval(moveInterval);
    }, TICK_MS);
  });
}
