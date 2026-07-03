/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';
import { lerp } from '../../utils/mathUtils.js';
import { amaraDialogue } from './dialogue.js';
import { showDialogueLine } from '../dialogueSubtitle.js';

const BLOCK_RANGE = 15;
const PERSIST_RANGE = 40;
const APPROACH_RANGE = 80;
const NOD_RANGE = 40;
const FACE_RANGE = 30;
const NOD_DURATION_S = 1;
const NOD_ANGLE = -15 * (Math.PI / 180);
const PATROL_KMH = 3;
const ACT3_WALK_DURATION_S = 60;

// Trust 0 — blocks the eastern boundary and escalates dialogue as the
// player closes distance: approach -> persist -> block.
export function updateHostile(character, dist) {
  const { mesh, jeepPosition, jeepYaw } = character;

  if (dist <= BLOCK_RANGE) {
    const aheadX = jeepPosition.x - Math.sin(jeepYaw) * 8;
    const aheadZ = jeepPosition.z - Math.cos(jeepYaw) * 8;
    mesh.position.set(aheadX, 0, aheadZ);
    if (character.approachStage !== 'blocking') {
      character.approachStage = 'blocking';
      eventBus.emit('amara:blocking');
      showDialogueLine(amaraDialogue.tier0[2]);
    }
    return;
  }

  if (dist <= PERSIST_RANGE) {
    if (character.approachStage !== 'persist' && character.approachStage !== 'blocking') {
      character.approachStage = 'persist';
      showDialogueLine(amaraDialogue.tier0[1]);
    }
  } else if (dist <= APPROACH_RANGE) {
    if (!character.approachStage) {
      character.approachStage = 'approach';
      showDialogueLine(amaraDialogue.tier0[0]);
    }
  } else {
    character.approachStage = null;
  }
}

// Trust 1/2 — ping-pongs along an east-west line centred on spawn, nods
// when the player closes in, and (trust 2) turns to face them up close.
export function updatePatrol(character, delta, dist, radiusM) {
  const { mesh } = character;
  const centreX = character.spawnPosition.x;
  const centreZ = character.spawnPosition.z;

  if (character.facingPlayer) {
    updateNod(character, delta);
  } else {
    const target = character.patrolDirection > 0 ? centreX + radiusM : centreX - radiusM;
    const step = (PATROL_KMH / 3.6) * delta;
    if (Math.abs(mesh.position.x - target) < 1) {
      character.patrolDirection *= -1;
    } else {
      mesh.position.x += Math.sign(target - mesh.position.x) * step;
    }
    mesh.position.z = centreZ;
    mesh.rotation.y = character.patrolDirection > 0 ? -Math.PI / 2 : Math.PI / 2;
  }

  if (dist <= NOD_RANGE && !character.hasNoddedThisPass) {
    character.hasNoddedThisPass = true;
    character.nodTimer = NOD_DURATION_S;
  } else if (dist > NOD_RANGE) {
    character.hasNoddedThisPass = false;
  }
  updateNod(character, delta);

  if (character.trust === 2 && dist <= FACE_RANGE && !character.facingPlayer) {
    character.facingPlayer = true;
    pointToLandmark(character);
  } else if (character.facingPlayer && dist > FACE_RANGE) {
    character.facingPlayer = false;
  }
}

function updateNod(character, delta) {
  if (character.nodTimer <= 0) {
    character.headMesh.rotation.x = 0;
    return;
  }
  character.nodTimer -= delta;
  const t = 1 - character.nodTimer / NOD_DURATION_S;
  const phase = t <= 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  character.headMesh.rotation.x = NOD_ANGLE * phase;
}

// Trust 3 — after story:act3Start, walks to the player over 60s regardless
// of distance, then announces arrival.
export function startAct3Walk(character) {
  character.act3Walking = true;
  character.act3Timer = 0;
  character.act3StartPos = { x: character.mesh.position.x, z: character.mesh.position.z };
}

export function updateAct3Walk(character, delta) {
  character.act3Timer += delta;
  const t = Math.min(1, character.act3Timer / ACT3_WALK_DURATION_S);
  const { mesh, act3StartPos, playerPosition } = character;
  mesh.position.x = lerp(act3StartPos.x, playerPosition.x, t);
  mesh.position.z = lerp(act3StartPos.z, playerPosition.z, t);
  if (t >= 1) {
    character.act3Walking = false;
    eventBus.emit('amara:arrivedForAct3');
    showDialogueLine(amaraDialogue.tier3[0]);
  }
}

export function pointToLandmark(character) {
  eventBus.emit('amara:pointsToLandmark', { landmark: 'baobab_north' });
  showDialogueLine(amaraDialogue.tier2[4]);
}
