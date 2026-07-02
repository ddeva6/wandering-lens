# The Wandering Lens

> *"The animal decides when the photograph happens. Not you."*
> — Victor Osei Mensah, Field Journal, 1978

A virtual wild safari experience built entirely in the browser. No download. No install. Just a URL and the open savanna.

**[Play now →](https://ddeva6.github.io/wandering-lens)**

---

## The story

Your grandfather Victor was a pioneering wildlife photographer who vanished in the Serengeti in 1994. On your 19th birthday, a package arrives — his battered field journal, a half-developed roll of film, and a note: *"The savanna remembers everything. Go find what I left there for you."*

You arrive at dawn with his old camera and no idea what you're doing. The savanna will teach you.

## What you'll find

- A living open world that changes by the hour — elephant herds at sunrise, lion prides at dusk, aardvarks only after midnight
- 24 of Victor's field journal pages hidden across the world, each unlocking a piece of the mystery
- A photography system with real stakes — 36 frames per day, golden hour windows, animal behaviour that rewards patience
- Survival events that hit without warning — lion encounters, flash floods, wildfires, crocodile crossings
- Three endings that depend on every choice you made along the way
- A story designed to make you feel something, not just complete something

## Tech stack

| Layer | Technology |
|---|---|
| 3D Engine | [Three.js](https://threejs.org) r160+ |
| Bundler | [Vite](https://vitejs.dev) (vanilla JS, no framework) |
| Collision | [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) |
| Mobile controls | [nipplejs](https://yoannmoi.net/nipplejs/) |
| Audio | [Howler.js](https://howlerjs.com) |
| Hosting | GitHub Pages (free, always-on) |
| Persistence | localStorage (no backend, no account needed) |

Runs in any modern browser. No WebGPU required. Target initial load: under 8 MB.

## Controls

| Action | Desktop | Mobile |
|---|---|---|
| Drive | WASD | Left joystick |
| Look | Mouse | Right swipe |
| Camera | Hold E | Hold tap |
| Take photo | Left click | Tap |
| Cut engine | Spacebar | Double tap |
| Journal | J | Journal icon |

## Running locally

```bash
git clone https://github.com/ddeva6/wandering-lens.git
cd wandering-lens
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

```bash
npm run build    # production build
npm run preview  # preview the production build locally
```

## Project structure

```
src/
  core/         scene, renderer, camera, game loop
  world/        terrain, skybox, day-night cycle, weather
  animals/      5 species AI, memory system, flocking
  jeep/         controls, physics, dashboard, on-foot mode
  mechanics/    photo system, survival resources, crisis events
  story/        journal, voice system, Radio Mama, endings
  characters/   Amara, Isaac — models and dialogue
  ui/           viewfinder, HUD, journal UI, ending screens
  audio/        spatial audio, ambient soundscape
public/
  models/       .glb animal and character models (Draco compressed)
  textures/     terrain, skybox (KTX2)
  audio/        ambient loops, voice recordings
```

## Design philosophy

Built as a study in what browser games can be when story comes first. No points. No leaderboard. No social features. Just a world that rewards the kind of attention most games train you out of — stillness, patience, looking before you shoot.

Inspired by the work of wildlife photographers who believed the photograph is never the point. The point is what you had to become to take it.

## Browser support

| Browser | Status |
|---|---|
| Chrome 110+ | ✅ Full support |
| Firefox 110+ | ✅ Full support |
| Safari 16+ | ✅ Full support |
| Edge 110+ | ✅ Full support |
| Mobile Chrome | ✅ Full support |
| Mobile Safari | ✅ Full support |

## Contributing

This is a personal creative project. The codebase is public for learning purposes — if you find a bug or have a technical suggestion, open an issue.

Story content, characters, and narrative are not open for contribution or modification.

## Reporting a security issue

Please do not open a public GitHub issue for security vulnerabilities. Email directly: **ddeva6@gmail.com**

## License

**Code** — Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International
([CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/))

You may share and reference the code with attribution. You may not use it commercially, modify it, or redistribute it without written permission.

**Story, characters, and narrative content** — All Rights Reserved
Victor Osei Mensah, Asha, Amara, Isaac Mwangi, Radio Mama, and all associated story elements are original fictional works.

---

© 2026 Devakumar M. All rights reserved.

*Made with Three.js and a lot of patience.*
