/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Group, CylinderGeometry, SphereGeometry, MeshStandardMaterial, Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { loadingManager } from '../../core/loadingManager.js';
import { eventBus } from '../../utils/eventBus.js';
import { save, load } from '../../utils/localStorage.js';
import { distance2D } from '../../utils/mathUtils.js';
import { amaraDialogue } from './dialogue.js';
import { frustum } from '../../core/camera.js';
import { showDialogueLine } from '../dialogueSubtitle.js';
import * as behavior from './amaraBehavior.js';
import { initFieldTests, startTest1, startTest2, startTest3, getTestState } from './fieldTests.js';

const gltfLoader = new GLTFLoader(loadingManager);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
gltfLoader.setDRACOLoader(dracoLoader);

const SPAWN_POSITION = { x: 580, z: 20 };
const PATROL_RADIUS_T1 = 100; // "200m east-west line" == ±100m
const PATROL_RADIUS_T2 = 400;
const INTERACT_RANGE = 20;

export class AmaraCharacter {
  constructor() {
    this.trust = 0;
    this.mesh = null;
    this.headMesh = null;
    this.spawnPosition = SPAWN_POSITION;
    this.playerPosition = { x: 0, y: 0, z: 0 };
    this.jeepPosition = { x: 0, z: 0 };
    this.jeepYaw = 0;
    this.jeep = null;

    this.approachStage = null;
    this.patrolDirection = 1;
    this.nodTimer = 0;
    this.hasNoddedThisPass = false;
    this.facingPlayer = false;
    this.act3Walking = false;
    this.act3Timer = 0;
    this.act3StartPos = null;
  }

  init(scene, jeep) {
    this.scene = scene;
    this.jeep = jeep;
    this.trust = load('amara_trust', 0);

    this.mesh = new Group();
    this.mesh.position.set(SPAWN_POSITION.x, 0, SPAWN_POSITION.z);
    this.mesh.rotation.y = Math.PI / 2; // faces west, toward player spawn

    const placeholder = new Group();
    placeholder.name = 'amara_placeholder';
    const body = new Mesh(
      new CylinderGeometry(0.4, 0.5, 1.7, 8),
      new MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })
    );
    body.position.y = 0.85;
    this.headMesh = new Mesh(
      new SphereGeometry(0.25, 8, 8),
      new MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })
    );
    this.headMesh.position.y = 1.85;
    placeholder.add(body, this.headMesh);
    this.mesh.add(placeholder);
    scene.add(this.mesh);

    const dracoPath = `${import.meta.env.BASE_URL}models/amara.draco.glb`;
    const regularPath = `${import.meta.env.BASE_URL}models/amara.glb`;

    gltfLoader.load(
      dracoPath,
      (gltf) => {
        this.mesh.remove(placeholder);
        this.mesh.add(gltf.scene);
      },
      undefined,
      () => {
        gltfLoader.load(
          regularPath,
          (gltf) => {
            this.mesh.remove(placeholder);
            this.mesh.add(gltf.scene);
          },
          undefined,
          () => console.warn('[ASSET MISSING] amara.glb — using placeholder')
        );
      }
    );

    eventBus.on('jeep:positionUpdate', ({ position }) => {
      this.playerPosition = position;
    });
    eventBus.on('story:act3Start', () => {
      if (this.trust >= 3) behavior.startAct3Walk(this);
    });

    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyE' && !event.repeat) this.interact();
    });

    initFieldTests(this);
  }

  setTrust(level) {
    if (level === this.trust) return;
    this.trust = level;
    save('amara_trust', level);
    eventBus.emit('amara:trustChanged', { level });
  }

  // Called by controls when the player presses E within range of Amara.
  interact() {
    if (!this.mesh) return;
    const dist = distance2D(this.playerPosition, this.mesh.position);
    if (dist > INTERACT_RANGE) return;

    const tests = getTestState();
    if (this.trust === 0 && !tests.test1) {
      showDialogueLine({ text: amaraDialogue.fieldTestPrompts.test1 });
      startTest1();
    } else if (this.trust === 1 && !tests.test2) {
      showDialogueLine({ text: amaraDialogue.fieldTestPrompts.test2 });
      startTest2();
    } else if (this.trust === 2 && !tests.test3) {
      showDialogueLine({ text: amaraDialogue.fieldTestPrompts.test3 });
      startTest3();
    } else {
      const tier = amaraDialogue[`tier${this.trust}`];
      if (tier?.[0]) showDialogueLine(tier[0]);
    }
  }

  update(delta) {
    if (!this.mesh) return;
    this.mesh.visible = frustum.containsPoint(this.mesh.position);
    if (this.jeep) {
      this.jeepPosition = this.jeep.position;
      this.jeepYaw = this.jeep.rotation.y;
    }
    const dist = distance2D(this.playerPosition, this.mesh.position);

    if (this.act3Walking) {
      behavior.updateAct3Walk(this, delta);
      return;
    }
    if (this.trust === 0) behavior.updateHostile(this, dist);
    else if (this.trust === 1) behavior.updatePatrol(this, delta, dist, PATROL_RADIUS_T1);
    else if (this.trust === 2) behavior.updatePatrol(this, delta, dist, PATROL_RADIUS_T2);
  }
}

export const amara = new AmaraCharacter();
