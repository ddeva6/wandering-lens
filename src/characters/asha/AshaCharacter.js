/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { Group, CylinderGeometry, SphereGeometry, MeshStandardMaterial, Mesh } from 'three';
import { load } from '../../utils/localStorage.js';

const DEFAULT_SKIN_TONE = '#c68642';

// The player's own placeholder body — not rendered in first-person (the
// camera is her eyes while on foot), but positioned each frame so it's
// ready wherever a third-person shot needs it: ending cutscenes, and any
// future over-the-shoulder camera work.
class AshaCharacter {
  constructor() {
    this.mesh = null;
    this.bodyMaterial = null;
    this.headMaterial = null;
  }

  init(scene) {
    this.mesh = new Group();
    this.mesh.visible = false;

    this.bodyMaterial = new MeshStandardMaterial({ color: DEFAULT_SKIN_TONE, roughness: 0.85 });
    this.headMaterial = new MeshStandardMaterial({ color: DEFAULT_SKIN_TONE, roughness: 0.85 });

    const clothing = new Mesh(
      new CylinderGeometry(0.28, 0.34, 1.1, 8),
      new MeshStandardMaterial({ color: 0x5a4a38, roughness: 0.9 })
    );
    clothing.position.y = 0.95;

    const head = new Mesh(new SphereGeometry(0.2, 8, 8), this.headMaterial);
    head.position.y = 1.65;

    const legs = new Mesh(new CylinderGeometry(0.16, 0.14, 0.8, 6), this.bodyMaterial);
    legs.position.y = 0.4;

    this.mesh.add(clothing, head, legs);
    scene.add(this.mesh);

    const profile = load('asha_profile', null);
    if (profile?.skinTone) this.setSkinTone(profile.skinTone);
  }

  setSkinTone(hex) {
    this.bodyMaterial?.color.set(hex);
    this.headMaterial?.color.set(hex);
  }

  setPosition(x, y, z) {
    this.mesh?.position.set(x, y, z);
  }

  setVisible(visible) {
    if (this.mesh) this.mesh.visible = visible;
  }
}

export { AshaCharacter };
export const asha = new AshaCharacter();
