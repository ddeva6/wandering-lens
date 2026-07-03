/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../../utils/eventBus.js';
import { load } from '../../utils/localStorage.js';
import { resourceManager } from '../../mechanics/survival/resourceManager.js';
import { spawnDropById } from '../../mechanics/isaacGifts.js';
import { isaacDialogue } from './dialogue.js';
import { buildIsaacGroup, driveToward, stepOut, playDialogue } from './isaacBehavior.js';

const APPEARANCE1_DELAY_MS = 30000;
const APPEARANCE1_PARK = { x: 30, z: 30 };
const APPEARANCE1_START = { x: 30, z: 130 };
const APPEARANCE1_EXIT = { x: 30, z: 230 };

const APPEARANCE2_OFFSCREEN_OFFSET = { x: 160, z: 0 };
const APPEARANCE2_EXIT_OFFSET = { x: 300, z: 0 }; // toward the eastern boundary
const APPEARANCE2_FUEL_GIFT = 40;

const APPEARANCE3_PARK = { x: 0, z: 0 };
const APPEARANCE3_EXIT = { x: 0, z: 100 };
const APPEARANCE3_EXIT_SPEED = 0.4; // "drives away slowly, no urgency"

class IsaacCharacter {
  constructor() {
    this.state = 'idle';
    this.appearanceConfig = null;
    this.appeared = [false, false, false];
    this.playerPosition = { x: 0, y: 0, z: 0 };
    this.group = null;
    this.person = null;
  }

  init(scene) {
    this.scene = scene;
    const built = buildIsaacGroup(scene);
    this.group = built.group;
    this.person = built.person;

    eventBus.on('jeep:positionUpdate', ({ position }) => {
      this.playerPosition = position;
    });
    eventBus.on('resource:update', ({ fuel }) => {
      if (!this.appeared[1] && this.state === 'idle' && fuel <= 0) this.triggerAppearance2();
    });
    eventBus.on('world:newDay', () => {
      if (!this.appeared[1] && this.state === 'idle' && load('radio_day', 1) === 3) {
        this.triggerAppearance2();
      }
    });
    eventBus.on('story:act3Start', () => {
      if (!this.appeared[2]) this.triggerAppearance3();
    });

    setTimeout(() => {
      if (!this.appeared[0]) this.triggerAppearance1();
    }, APPEARANCE1_DELAY_MS);
  }

  triggerAppearance1() {
    this.appeared[0] = true;
    this.beginAppearance({
      park: APPEARANCE1_PARK,
      start: APPEARANCE1_START,
      exit: APPEARANCE1_EXIT,
      dialogueKey: 'isaac_01_arrival',
      onDialogueEnd: () => spawnDropById(1),
    });
  }

  triggerAppearance2() {
    this.appeared[1] = true;
    const park = { x: this.playerPosition.x, z: this.playerPosition.z };
    this.beginAppearance({
      park,
      start: { x: park.x + APPEARANCE2_OFFSCREEN_OFFSET.x, z: park.z + APPEARANCE2_OFFSCREEN_OFFSET.z },
      exit: { x: park.x + APPEARANCE2_EXIT_OFFSET.x, z: park.z + APPEARANCE2_EXIT_OFFSET.z },
      dialogueKey: 'isaac_02_rescue',
      onStepOutEnd: () => resourceManager.refuel(APPEARANCE2_FUEL_GIFT),
    });
  }

  triggerAppearance3() {
    this.appeared[2] = true;
    this.beginAppearance({
      park: APPEARANCE3_PARK,
      start: APPEARANCE3_PARK,
      exit: APPEARANCE3_EXIT,
      exitSpeedMultiplier: APPEARANCE3_EXIT_SPEED,
      dialogueKey: 'isaac_03_confrontation',
      skipDriveIn: true,
    });
  }

  beginAppearance(config) {
    this.appearanceConfig = config;
    this.group.position.set(config.start.x, 0, config.start.z);
    this.group.visible = true;
    this.person.visible = false;
    this.person.position.x = 0;
    this.stepOutTimer = 0;
    this.state = config.skipDriveIn ? 'stepping_out' : 'driving_in';
  }

  update(delta) {
    if (!this.group || this.state === 'idle') return;
    const config = this.appearanceConfig;

    if (this.state === 'driving_in') {
      if (driveToward(this, config.park, delta, 2)) this.state = 'stepping_out';
      return;
    }

    if (this.state === 'stepping_out') {
      if (stepOut(this, delta)) {
        config.onStepOutEnd?.();
        this.state = 'dialogue';
        playDialogue(config.dialogueKey, isaacDialogue, () => {
          config.onDialogueEnd?.();
          this.state = 'driving_out';
        });
      }
      return;
    }

    if (this.state === 'driving_out') {
      if (driveToward(this, config.exit, delta, 2, config.exitSpeedMultiplier ?? 1)) {
        this.group.visible = false;
        this.state = 'idle';
      }
    }
  }
}

export { IsaacCharacter };
export const isaac = new IsaacCharacter();
