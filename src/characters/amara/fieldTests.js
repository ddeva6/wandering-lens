/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { save, load } from '../../utils/localStorage.js';
import { amaraDialogue } from './dialogue.js';
import { showDialogueLine } from '../dialogueSubtitle.js';
import * as behavior from './amaraBehavior.js';
import * as fieldTest1 from './fieldTest1.js';
import * as fieldTest2 from './fieldTest2.js';
import * as fieldTest3 from './fieldTest3.js';

const DEFAULT_TESTS = { test1: false, test2: false, test3: false };

let character = null;

function getTests() {
  return load('amara_tests', DEFAULT_TESTS);
}

function setTestComplete(key) {
  const tests = getTests();
  tests[key] = true;
  save('amara_tests', tests);
}

export function getTestState() {
  return getTests();
}

export function initFieldTests(amaraCharacter) {
  character = amaraCharacter;
  if (load('amara_tests', null) === null) save('amara_tests', DEFAULT_TESTS);
}

export function startTest1() {
  fieldTest1.start(
    character,
    () => {
      setTestComplete('test1');
      character.setTrust(1);
      showDialogueLine(amaraDialogue.tier1[3]);
    },
    () => {}
  );
}

export function startTest2() {
  fieldTest2.start(
    () => {
      setTestComplete('test2');
      character.setTrust(2);
      showDialogueLine(amaraDialogue.tier2[3]);
    },
    () => {
      const el = document.createElement('p');
      el.className = 'victor-subtitle victor-subtitle--visible';
      el.textContent = 'Listen more carefully. The savanna will play the same songs tomorrow.';
      document.body.appendChild(el);
      setTimeout(() => {
        el.classList.remove('victor-subtitle--visible');
        setTimeout(() => el.remove(), 500);
      }, 4500);
    }
  );
}

export function startTest3() {
  fieldTest3.start(
    character,
    () => {
      setTestComplete('test3');
      // tier2.a2_5 plays immediately; tier3 dialogue becomes reachable via
      // interact() (see AmaraCharacter.interact()'s trust===3 fallback)
      // once trust actually updates 5 seconds later.
      behavior.pointToLandmark(character);
      setTimeout(() => character.setTrust(3), 5000);
    },
    () => {}
  );
}
