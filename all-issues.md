# GitHub Issues — paste each block into GitHub as a separate issue
# Assign each to @claude and the agent picks it up automatically

---

## Issue 1 — Phase 1: Project scaffold
**Labels**: phase-1, claude-task
**Assignee**: @claude

@claude

Set up the Wandering Lens project scaffold exactly as specified in CLAUDE.md Phase 1.

Tasks:
- Init Vite project with vanilla JS (not React)
- Install: three, three-mesh-bvh, howler, nipplejs, gh-pages
- Create the exact folder structure from CLAUDE.md
- Create `src/core/renderer.js` — WebGLRenderer, antialias, shadow maps enabled
- Create `src/core/scene.js` — Scene, fog (FogExp2, warm amber, density 0.0008)
- Create `src/core/camera.js` — PerspectiveCamera, fov 60, near 0.1, far 2000
- Create `src/core/loop.js` — requestAnimationFrame loop, delta time, clock
- Create `src/world/dayNight.js` — stub: sky colour lerps warm orange → deep blue → black over 4 real minutes per cycle
- Add `deploy` script to package.json using gh-pages
- Configure vite.config.js with base set to repo name for GitHub Pages
- Confirm: `npm run dev` shows a scene with colour-changing sky and no console errors
- Confirm: `npm run build` completes with no warnings
- Open a PR titled "Phase 1: Scaffold"

---

## Issue 2 — Phase 2: World
**Labels**: phase-2, claude-task
**Assignee**: @claude

@claude

Build the savanna world. Read CLAUDE.md Phase 2 fully before starting.

Tasks:
- `src/world/terrain.js` — PlaneGeometry(2000, 2000, 128, 128), displacement map from `/public/textures/heightmap.png` (create a procedural one if missing using canvas API), MeshStandardMaterial with grass texture repeat 40×40
- `src/world/skybox.js` — PMREMGenerator + RoomEnvironment for lighting baseline. Day sky: #87CEEB. Sunset: #FF7043. Night: #0a0a1a. Lerp between states on the day/night cycle.
- `src/world/dayNight.js` — full implementation: 24 in-game hours = 4 real minutes. Export `getGameHour()` used by all time-aware systems.
- `src/world/weather.js` — 3 states: clear / overcast / storm. Random storm every 15–25 real minutes, lasts 3–5 minutes. Exports `getCurrentWeather()`.
- `src/audio/ambientSound.js` — Howler.js wind loop at `/public/audio/ambient/wind.mp3`. Volume modulates with weather state. Use a freely licensed sound or generate a sine-wave placeholder.
- `src/utils/eventBus.js` — simple pub/sub: `on(event, cb)`, `emit(event, data)`, `off(event, cb)`. All cross-module communication uses this.
- Open a PR titled "Phase 2: World"

---

## Issue 3 — Phase 3: Jeep and controls
**Labels**: phase-3, claude-task
**Assignee**: @claude

@claude

Build the jeep, controls, and resource dashboard. Read CLAUDE.md Phase 3 fully.

Tasks:
- `src/jeep/jeepModel.js` — load `/public/models/jeep.glb`. If missing: BoxGeometry placeholder (4×2×2), log ASSET MISSING warning.
- `src/jeep/jeepPhysics.js` — simple arcade physics: acceleration, max speed 80 km/h, friction, turning radius. No physics engine — pure math.
- `src/jeep/controls.js` — desktop: WASD keys via KeyboardEvent listeners + pointer-lock mouse look. Mobile: nipplejs left joystick for drive, right swipe for camera.
- `src/jeep/engineCut.js` — Spacebar (desktop) / double-tap (mobile). Toggles engine on/off. When off: stealth mode active, animals do not detect jeep.
- `src/jeep/onFootMode.js` — activates when fuel = 0. Player moves at walking speed (5 km/h). Predator detection radius increases. Lion encounter risk doubles.
- `src/jeep/dashboard.js` — 4 resource values displayed as thin coloured strips on the jeep's dashboard mesh (UV mapped). NOT a HUD overlay. Updates via `wl_resources` localStorage.
- `src/utils/localStorage.js` — helpers: `save(key, value)`, `load(key, defaultValue)`. All keys prefixed `wl_`.
- Open a PR titled "Phase 3: Jeep and Controls"

---

## Issue 4 — Phase 4: Animal AI
**Labels**: phase-4, claude-task
**Assignee**: @claude

@claude

Build the animal AI system for 5 species. Read CLAUDE.md Phase 4 fully.

Tasks:
- `src/animals/BaseAnimal.js` — abstract class: position, state machine, trust level, update(delta), dispose()
- `src/animals/AnimalMemory.js` — localStorage manager for `wl_animal_memory`. Methods: getTrust(id), setTrust(id, level), resetAll()
- `src/animals/species/Elephant.js` — extends BaseAnimal. Herd of 8. Active 06:30–09:00 and 16:00–19:00. States: idle, walk, drink, mock-charge, real-charge. Charge triggers when distance < 20m with calf present.
- `src/animals/species/Lion.js` — extends BaseAnimal. Pride of 6. Active noon and 18:00–21:00. States: rest, prowl, stalk, charge. Charge on-foot when distance < 40m.
- `src/animals/species/Cheetah.js` — extends BaseAnimal. Solo. Active 16:00–18:30. Race state: matches jeep speed up to 110 km/h when jeep drives parallel within 50m.
- `src/animals/species/Giraffe.js` — extends BaseAnimal. Group of 4. Active all day. Gentle flee — no charge.
- `src/animals/species/Zebra.js` — extends BaseAnimal. Herd of 20. Boid flocking (separation, alignment, cohesion). Stampede when lion within 100m.
- `src/animals/AnimalManager.js` — spawns and updates all animals. Distance-based LOD: full AI within 300m, waypoint-only beyond.
- `src/animals/WaterholeManager.js` — attraction zone. Pulls correct species at correct hours.
- Open a PR titled "Phase 4: Animal AI"

---

## Issue 5 — Phase 5: Photo mechanic
**Labels**: phase-5, claude-task
**Assignee**: @claude

@claude

Build the complete 3-factor photo system. Read CLAUDE.md Phase 5 fully.

Tasks:
- `src/mechanics/photo/viewfinder.js` — full-screen canvas overlay when camera raised. Black vignette border, centre crosshair, 3 live meters drawn via canvas API.
- `src/mechanics/photo/timingMeter.js` — arc drawn around viewfinder edge. Fills 0→100 during golden hour windows. Pulses gold when at 100.
- `src/mechanics/photo/distanceMeter.js` — inner ring. Score inversely proportional to distance from nearest animal. Pulses red when < safe threshold (triggers animal reaction).
- `src/mechanics/photo/momentDetector.js` — per-species moment definitions in `src/story/momentDefs.js`. Fires gold flash when animal enters defined state (elephant drinking, lion yawning, cheetah racing).
- `src/mechanics/photo/shotSystem.js` — calculates composite score 0–100. Legendary = all 3 at 80+. Standard = any score. Deducts film from `wl_resources`. Saves shot to `wl_photo_album`.
- `src/mechanics/photo/photoComparison.js` — after legendary shot, check `src/story/victorAttempts.js` for matching animal+zone. If match: show side-by-side split screen for 4 seconds.
- `src/story/victorAttempts.js` — array of 12 objects `{ animalSpecies, zone, victorScore, victorNote }`.
- `src/ui/viewfinderUI.js` — mounts/unmounts viewfinder DOM overlay. Keyboard E + mobile hold-tap toggles.
- Open a PR titled "Phase 5: Photo Mechanic"

---

## Issue 6 — Phase 6: Survival systems
**Labels**: phase-6, claude-task
**Assignee**: @claude

@claude

Build all survival systems and crisis events. Read CLAUDE.md Phase 6 fully.

Tasks:
- `src/mechanics/survival/resourceManager.js` — manages wl_resources. Depletion rates as specified. Emits events on EventBus: 'resource:low', 'resource:empty'.
- `src/mechanics/survival/dehydrationFX.js` — below 20% water: screen edge vignette via post-processing (Three.js EffectComposer + custom shader). Camera sway via perlin noise on camera position.
- `src/mechanics/crisis/lionCharge.js` — on-foot detection. Spawns 3 choice bubbles (Still / Run / Noise). 3-second countdown timer. Wrong choice: mission fail state. Correct: orphan cub spawns if `wl_comeback.lionSurvived` not yet set.
- `src/mechanics/crisis/elephantCharge.js` — body language identification. Shows elephant with animated ears. Player identifies mock vs real. 5-second window.
- `src/mechanics/crisis/flashFlood.js` — triggers during storm weather, random. Water plane rises over 90 seconds. Player must reach plateau (y > 40). Success: `wl_comeback.flood = true`.
- `src/mechanics/crisis/wildfire.js` — particle system smoke (1000 particles, grey, rising). Visibility shader reduces to 15m. Compass-only navigation. Success: `wl_comeback.wildfire = true`. Burns terrain texture patch. Spawns Victor's camp after.
- `src/mechanics/crisis/hyenaCamp.js` — night campfire rhythm game. Firewood click targets appear every 2–4 seconds. Miss 3 → fire dies → retreat to jeep.
- `src/mechanics/comeback/comebackManager.js` — reads `wl_comeback` flags. On flag set: triggers exclusive aftermath content after crisis resolves.
- Open a PR titled "Phase 6: Survival Systems"

---

## Issue 7 — Phase 7: Story layer
**Labels**: phase-7, claude-task
**Assignee**: @claude

@claude

Build the complete story delivery system. Read CLAUDE.md Phase 7 fully.

Tasks:
- `src/story/copy.js` — all strings in one file. Sections: victorRecordings, radioMama, journalEntries, ashaCampfire, isaacDialogue, amaraDialogue.
- `src/story/journalEntries.js` — all 24 entries. Format: `{ id: 1, year: 1971, text: '...', unlockCondition: 'photo:elephant:legendary', tier: 'basic'|'good'|'perfect'|'legendary' }`. Write real emotionally resonant entries for Victor from 1971–1994, building toward the Isaac revelation.
- `src/story/voiceSystem.js` — triggers Victor's recordings by world position + game state. 8 recordings minimum. Plays via Howler.js. Subtitles displayed in bottom band.
- `src/story/radioMama.js` — schedules 18:00 check-in via game clock. Plays audio + subtitle. If missed (player out of range): queues morning notification. Act 3 silence: emits 'story:radioMamaSilent' event.
- `src/mechanics/campfireJournal.js` — night-only text input UI. Saves to `wl_player_journal` array. Day 21 trigger: reads back player's Day 1 entry. Asha reacts with scripted response based on emotional keywords detected (loneliness / fear / excitement / wonder).
- `src/mechanics/isaacGifts.js` — 6 supply drop world positions. Spawns when player enters zone. Contains items + hidden tracker. Examine interaction (hold E) reveals tracker. Adds to `wl_evidence` array.
- `src/story/victorAttempts.js` — 12 legendary shot attempts Victor documented. Used by photoComparison.js.
- Open a PR titled "Phase 7: Story Layer"

---

## Issue 8 — Phase 8: Characters
**Labels**: phase-8, claude-task
**Assignee**: @claude

@claude

Build Amara and Isaac character systems. Read CLAUDE.md Phase 8 fully.

Tasks:
- `src/characters/amara/AmaraCharacter.js` — loads `/public/models/amara.glb` (placeholder if missing). Positioned at east zone boundary. Trust levels: 0 (hostile), 1 (neutral), 2 (friendly), 3 (ally). Blocks path at trust < 1.
- `src/characters/amara/fieldTests.js` — 3 test implementations:
  - Test 1: Leopard tracking — activate stealth mode, follow footprint trail without triggering flee
  - Test 2: Bird calls — audio + illustrated card matching mini-game (5 calls)
  - Test 3: Hidden waterhole — navigate by elephant migration path, no map marker
  - Each test completion: `amara.trust += 1`, plays Amara dialogue, unlocks Victor memory about that animal
- `src/characters/amara/dialogue.js` — all dialogue lines keyed by trust level and trigger. Amara communicates through short sentences. Never warm until trust 2.
- `src/characters/isaac/IsaacCharacter.js` — loads `/public/models/isaacJeep.glb`. Appears at 3 scripted world positions (camp arrival, mid-game rescue, Act 3 confrontation). Dialogue via `src/characters/isaac/dialogue.js`.
- `src/characters/isaac/dialogue.js` — all lines must sound genuinely helpful and friendly. No menace until confrontation. Retroactive realisation is the design goal.
- `src/mechanics/gpsTrackerReveal.js` — when 4+ trackers found: UI notification "These are tracking devices." Story beat plays. Isaac's past kindnesses listed on screen with red annotations.
- Open a PR titled "Phase 8: Characters"

---

## Issue 9 — Phase 9: Three endings
**Labels**: phase-9, claude-task
**Assignee**: @claude

@claude

Build the three-ending system and Victor's Challenge. Read CLAUDE.md Phase 9 fully.

Tasks:
- `src/story/endingTrigger.js` — checks unlock conditions: all 6 trackers found + Victor's final recording played + Amara trust = 3. Emits 'story:endingUnlocked'.
- `src/ui/endingChoiceUI.js` — 3 choice cards displayed. Each has title, 2-line description, consequence preview. 30-second wait before choices appear (dramatic pause). No time limit on choosing.
- `src/story/endings/publishEnding.js` — post-credits: media jeeps on horizon. Amara at new station sign. Radio Mama final call. Victor's name shown on screen.
- `src/story/endings/buryEnding.js` — post-credits: silent savanna. Elephant at Victor's camp. Victor's voice one final time.
- `src/story/endings/returnEnding.js` — post-credits: Amara with elders. Fire. Asha's jeep drives into sunrise. Radio Mama's final call.
- `wl_ending_chosen` localStorage key set after ending. Saves which ending was selected.
- `src/story/victorsChallenge.js` — unlocks after any ending. 12 legendary shots Victor attempted. Each entry: `{ id, journalRef, zone, animalSpecies, requiredMoment, rarity: 0.05–0.15 }`. UI shows challenge list, greyed until achieved. Final reward: plays Victor's last photo reveal sequence.
- Open a PR titled "Phase 9: Three Endings"

---

## Issue 10 — Phase 10: Polish and deploy
**Labels**: phase-10, claude-task
**Assignee**: @claude

@claude

Final polish pass and production deploy. Read CLAUDE.md Phase 10 fully.

Tasks:
- LOD system: animals beyond 200m switch to low-poly mesh (reduce triangle count by 80%). Beyond 400m: hidden.
- Frustum culling: ensure all animals and world objects not in camera frustum are skipped in update loop.
- Draco compression: compress all .glb models. Install @gltf-transform/cli and run `gltf-transform draco` on all models in /public/models/.
- Mobile performance: test at 375px. Reduce texture resolution to 512px on mobile via `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`.
- Loading screen: full-screen overlay with Victor's first journal quote. Fades out when Three.js scene + at least 3 animal models loaded. Progress bar driven by LoadingManager.
- Accessibility: all UI interactive elements have aria-label. Subtitles for all audio. Reduced-motion: `matchMedia('(prefers-reduced-motion)')` disables camera sway and particle animations.
- vite.config.js: set `base` to your GitHub repo name `/wandering-lens/`.
- GitHub Pages: enable Pages in repo settings, source = GitHub Actions. Run `npm run deploy` to confirm live URL works.
- Open a final PR titled "Phase 10: Production deploy" with the live GitHub Pages URL in the description.
