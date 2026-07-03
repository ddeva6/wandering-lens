/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import * as THREE from 'three';
import { eventBus } from '../../utils/eventBus.js';
import { amara } from '../../characters/amara/AmaraCharacter.js';

let gameScene = null;
let mediaJeeps = [];
let maasaiGroup = [];
let stationSign = null;
let campfireLight = null;

const JEEP_POSITIONS = [
  { x: -50, z: 300, yRotation: 0 },
  { x: -20, z: 310, yRotation: 0.2 },
  { x: 10, z: 290, yRotation: -0.1 }
];

export function init(scene) {
  gameScene = scene;

  eventBus.on('world:spawnMediaJeeps', () => {
    // 3 white jeeps on southern horizon
    const geometry = new THREE.BoxGeometry(4, 2, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

    JEEP_POSITIONS.forEach(pos => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos.x, 1, pos.z); // Assuming ground level is ~0
      mesh.rotation.y = pos.yRotation;

      // Headlights at dusk
      const headlight1 = new THREE.SpotLight(0xffffee, 2, 100, Math.PI / 6, 0.5, 1);
      headlight1.position.set(-1, 0, -4);
      headlight1.target.position.set(-1, 0, -10);
      mesh.add(headlight1);
      mesh.add(headlight1.target);

      const headlight2 = new THREE.SpotLight(0xffffee, 2, 100, Math.PI / 6, 0.5, 1);
      headlight2.position.set(1, 0, -4);
      headlight2.target.position.set(1, 0, -10);
      mesh.add(headlight2);
      mesh.add(headlight2.target);

      gameScene.add(mesh);
      mediaJeeps.push(mesh);
    });
  });

  eventBus.on('world:spawnStationSign', () => {
    // Station sign near eastern boundary
    const geometry = new THREE.PlaneGeometry(6, 2);

    // Create text texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111'; // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OSEI-MENSAH CONSERVATION ZONE', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

    stationSign = new THREE.Mesh(geometry, material);
    stationSign.position.set(300, 2, 0); // Near eastern boundary
    stationSign.rotation.y = -Math.PI / 2; // Face inwards

    // Simple post
    const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 4);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x4a3b28 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(0, -2, 0);
    stationSign.add(post);

    gameScene.add(stationSign);
  });

  eventBus.on('world:removeMediaJeepsAndMarkers', () => {
    mediaJeeps.forEach(mesh => gameScene.remove(mesh));
    mediaJeeps = [];
    // Assuming map markers are handled in their own UI system listening to ending triggers
  });

  eventBus.on('world:spawnMaasaiCommunity', () => {
    // Spawn 6 additional Maasai figures at Amara's real live position.
    const amaraPosition = { x: amara.mesh.position.x, z: amara.mesh.position.z };

    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red shuka

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const figure = new THREE.Mesh(geometry, material);
      figure.position.set(
        amaraPosition.x + Math.cos(angle) * radius,
        0.9,
        amaraPosition.z + Math.sin(angle) * radius
      );
      gameScene.add(figure);
      maasaiGroup.push(figure);
    }

    // Spawn animated fire
    campfireLight = new THREE.PointLight(0xff6b00, 2, 15);
    campfireLight.position.set(amaraPosition.x, 1, amaraPosition.z);
    gameScene.add(campfireLight);

    // Setup animation loop for the fire
    const animateFire = () => {
      if (campfireLight) {
        campfireLight.intensity = Math.sin(Date.now() * 0.01) * 0.5 + 1.5;
        requestAnimationFrame(animateFire);
      }
    };
    animateFire();
  });
}
