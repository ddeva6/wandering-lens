# The Wandering Lens — Claude Code Agent Instructions

## Project identity
A solo-mode virtual wild safari game built with Three.js + Vite + vanilla JS.
No backend. No framework. Deployed free to GitHub Pages.
Story-driven, emotionally packed, survival mechanics, designed for young players aged 13–25.

## Tech stack — locked, do not deviate
- **Bundler**: Vite (vanilla JS, no React, no Vue)
- **3D Engine**: Three.js r160+
- **Physics/Collision**: three-mesh-bvh
- **Controls**: vanilla pointer-lock API (desktop) + nipplejs (mobile joystick)
- **Audio**: Howler.js (positional audio)
- **Persistence**: localStorage only (no backend)
- **Deploy**: GitHub Pages via gh-pages npm package
- **Node**: 20+

## Folder structure — maintain exactly
```
src/
  core/           # scene, renderer, camera, loop
  world/          # terrain, skybox, day-night cycle, weather
  animals/        # species classes, AI, memory system
  jeep/           # controls, physics, dashboard
  mechanics/      # photo system, survival resources, crisis events
  story/          # journal, voice recordings, Radio Mama, journal entries
  characters/     # Amara, Isaac, models, dialogue
  ui/             # HUD, viewfinder, journal UI, ending screens
  utils/          # localStorage helpers, event bus, math utils
  audio/          # sound manager, spatial audio setup
public/
  audio/          # voice recordings (.mp3), ambient sounds
  models/         # .glb animal models, jeep, characters
  textures/       # terrain, skybox, UI textures
  journal/        # Victor's journal page images (SVG)
```

## Coding standards — always follow
- Vanilla ES modules. Named exports only — no default exports except main entry.
- Every file under 200 lines. Split when it grows beyond that.
- Three.js objects disposed properly — geometry.dispose(), material.dispose(), texture.dispose() on remove.
- localStorage keys prefixed `wl_` (wandering-lens). Example: `wl_animal_memory`, `wl_journal_progress`.
- EventBus pattern for cross-module communication. Never import UI into game logic.
- Mobile first. Every control has a touch fallback. Test at 375px viewport width.
- No hardcoded strings in game logic. All copy lives in `src/story/copy.js`.
- Console.log only in development. Use `if (import.meta.env.DEV)` guard.

## Game systems — implementation priority order
Build in this exact sequence. Do not skip ahead.

### Phase 1 — Scaffold ✅ start here
- Vite project init with Three.js
- Folder structure as above
- GitHub Pages deploy script in package.json
- Basic renderer + scene + camera (no content yet)
- Day/night cycle stub (just sky colour change)
- Confirm: `npm run dev` shows a black scene with changing sky

### Phase 2 — World
- Savanna terrain (PlaneGeometry 2000×2000, displacement map, grass texture)
- Skybox (equirectangular HDR or 6-face cubemap)
- Day/night full cycle: 24 in-game minutes = 4 real minutes per cycle
- Weather system stub: 3 weather states (clear, overcast, storm)
- Ambient sound: wind layer via Howler.js

### Phase 3 — Jeep and controls
- Jeep model loaded from `/public/models/jeep.glb`
- WASD drive with pointer-lock mouse look (desktop)
- nipplejs virtual joystick + swipe camera (mobile)
- Engine cut mechanic: Spacebar / double-tap
- Dashboard resource display (fuel, battery, water, film) — visible on jeep model, NOT HUD overlay
- Fuel depletes per km. Battery per shot. Water per minute. Film is shot counter.

### Phase 4 — Animal AI (5 species first)
Species: elephant, lion, giraffe, zebra, cheetah.
- Each species is a class extending `BaseAnimal`
- States: idle, walk, graze/drink, flee, charge (lion/elephant only), race (cheetah only)
- Animal memory: localStorage key `wl_animal_memory` — object keyed by animalId, value: {trust: 'neutral'|'spooked'|'familiar'}
- Trust changes: startled → spooked (flees earlier). Patient approach → familiar (allows closer).
- Flocking: zebra and wildebeest use Boid rules (separation, alignment, cohesion)
- Waterhole attraction: all species drawn to waterhole at time-appropriate hours
- Animals visible at correct hours (elephant 6:30–9:00, lion noon + dusk, etc.)

### Phase 5 — Photo mechanic
- Hold E / hold tap → raise camera → viewfinder fills screen
- Viewfinder UI: circular frame, 3 live meters:
  - **Timing ring** (arc around edge): fills during golden hour (06:30–09:00, 16:00–18:30). Glow when full.
  - **Distance ring** (inner circle): closer = higher score, pulses red when too close (triggers flee/charge)
  - **Moment indicator** (centre flash): fires when animal performs species-specific behaviour
- All 3 peak simultaneously = legendary shot (costs 3 frames, requires confirm button)
- Standard shot costs 1 frame. 36 frames per day, resets at in-game dawn.
- Shot result: score 0–100 → unlocks journal entry tier (basic / good / perfect / legendary)
- Photo comparison: legendary shots checked against Victor's attempt database in `src/story/victorAttempts.js`

### Phase 6 — Survival systems
Resources stored in localStorage as `wl_resources`:
```js
{ fuel: 100, battery: 100, water: 100, film: 36 }
```
- Fuel: -0.5 per 100m driven. Zero → jeep dies, on-foot mode activates.
- Water: -1 per real minute. Below 20 → screen edge vignette + camera sway shader.
- Battery: -10 per standard shot, -30 per legendary. Zero → camera unavailable.
- Film: decremented per shot. Zero → no photos until dawn reset.

Crisis events (each is a module in `src/mechanics/crisisEvents/`):
- `lionCharge.js` — triggered by distance < 15m on foot. 3-choice UI, 3-second timer.
- `elephantCharge.js` — mock vs real charge identification. Body language read mechanic.
- `flashFlood.js` — random during storm weather. 90-second race to plateau.
- `wildfire.js` — random, creates smoke particle system, navigation by compass only.
- `hyenaCamp.js` — night mechanic, firewood rhythm game.

Comeback flags stored in localStorage as `wl_comeback`:
```js
{ wildfire: false, flood: false, onFoot: false, failedNights: 0, lionSurvived: false }
```
When flag set true after survival → spawn exclusive content in aftermath.

### Phase 7 — Story layer
- **Victor's voice recordings**: 8 audio files in `/public/audio/victor/`. Triggered at specific world positions + game states.
- **Journal system**: 24 entries in `src/story/journalEntries.js`. Each has `{ id, year, text, unlockCondition, tier }`.
- **Radio Mama**: audio trigger at 18:00 in-game daily. Miss = notification. Act 3 silence = plot trigger.
- **Campfire journal**: text input each night. Player text stored in `wl_player_journal`. Read-back trigger at Day 21.
- **Isaac's gifts**: 6 supply drops at GPS coordinates. Each contains `{ items, hasTracker: true }`. Tracker discoverable on examine.

### Phase 8 — Characters
- **Amara**: 3D model `/public/models/amara.glb`. Appears in east zone. 3 trust levels unlocked by field tests. Dialogue trees in `src/characters/amara/dialogue.js`.
- **Isaac**: White Land Cruiser `/public/models/isaacJeep.glb`. Appears at 3 scripted moments. Dialogue in `src/characters/isaac/dialogue.js`. Charming, never threatening.
- **Amara field tests**: 3 tests in `src/characters/amara/fieldTests.js`. Leopard track, bird calls, hidden waterhole.

### Phase 9 — Three endings
Trigger condition: all GPS trackers found + Victor's final recording played + Amara trust = full.
- Show 3 choice cards on screen. Player selects.
- `src/story/endings/publishEnding.js` — Isaac exposed, Victor's name cleared.
- `src/story/endings/buryEnding.js` — Land stays hidden, elephant stays at camp.
- `src/story/endings/returnEnding.js` — Maasai stewardship, Amara's family gets journal.
- Each ending changes post-credits world state stored in `wl_ending_chosen`.
- **Victor's Challenge** unlocks after any ending.

### Phase 10 — Polish and deploy
- LOD system for animals beyond 200m
- Frustum culling audit
- Mobile performance pass (target 30fps on mid-range Android)
- Draco-compressed models
- KTX2 textures via `vite-plugin-ktx2`
- Lighthouse accessibility audit
- `npm run deploy` pushes to gh-pages branch

## Assets — use placeholders during development
If a model/audio file doesn't exist yet, use a coloured BoxGeometry placeholder.
Log a clear warning: `console.warn('[ASSET MISSING] jeep.glb — using placeholder')`.
Never block game startup on missing assets.

## Do not do these things
- Do not install React, Vue, Angular, or any UI framework
- Do not use a physics engine (cannon.js, rapier, ammo.js) — three-mesh-bvh only
- Do not add a backend, database, or WebSocket server
- Do not create a multiplayer system (explicit design decision: solo only)
- Do not use localStorage for anything larger than 50KB per key
- Do not use inline styles in HTML — all styling via CSS modules or scoped CSS files
- Do not commit `.env` files or API keys
- Do not use default Three.js examples code verbatim — adapt to this project's patterns

## Definition of done per phase
Each phase is done when:
1. `npm run dev` starts without errors or warnings
2. `npm run build` completes successfully
3. The specific phase features work on both desktop (Chrome) and mobile (iPhone Safari simulation)
4. No console errors in production build
5. `npm run deploy` pushes a working build to GitHub Pages
