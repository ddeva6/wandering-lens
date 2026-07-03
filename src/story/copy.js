/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

// Single source of truth for every string in the game — nothing in game
// logic should hardcode player-facing text after this phase.
export const copy = {
  victorRecordings: {
    dawn_arrival: {
      id: 'dawn_arrival',
      text: "The first thing you'll notice is the silence. Don't fill it. Let it fill you. When you're ready — start the engine.",
      trigger: 'game:start',
      audioFile: 'victor_01_dawn.mp3',
    },
    engine_controls: {
      id: 'engine_controls',
      text: 'Drive slowly at first. The savanna punishes the impatient. The steering responds to where you look — not where you point.',
      trigger: 'jeep:firstMove',
      audioFile: 'victor_02_controls.mp3',
    },
    giraffe_moment: {
      id: 'giraffe_moment',
      text: "Stop. Cut the engine. If it's what I think it is — don't breathe too loud.",
      trigger: 'animal:giraffeNear',
      audioFile: 'victor_03_giraffe.mp3',
    },
    camera_instructions: {
      id: 'camera_instructions',
      text: "The camera is on the seat beside you. Pick it up when something is worth remembering. Not everything is. You'll learn the difference.",
      trigger: 'photo:firstOpen',
      audioFile: 'victor_04_camera.mp3',
    },
    dashboard_check: {
      id: 'dashboard_check',
      text: 'Check your fuel. Check your water. Check your film. In that order. Every morning. Non-negotiable.',
      trigger: 'game:firstDawn',
      audioFile: 'victor_05_dashboard.mp3',
    },
    lion_survived: {
      id: 'lion_survived',
      text: 'I lost that shot too. Same spot. Same lion. I came back the next morning. So will you.',
      trigger: 'crisis:lionCharge',
      audioFile: 'victor_06_lion.mp3',
    },
    waterhole_discovery: {
      id: 'waterhole_discovery',
      text: "Every animal knows where the water is. Watch where they walk at dusk. They'll take you there.",
      trigger: 'world:waterholeActivity',
      audioFile: 'victor_07_waterhole.mp3',
    },
    final_recording: {
      id: 'final_recording',
      text: "I found what I came here to find. Not in the photographs. In the waiting. In the watching. In learning that some things cannot be taken — only received. If you're hearing this, you already understand. You just don't know it yet.",
      trigger: 'story:finalRecordingFound',
      audioFile: 'victor_08_final.mp3',
    },
  },

  radioMama: {
    checkin_1: {
      text: 'City child, are you eating? I hope you packed more than that camera. Check in tomorrow same time. Radio Mama out.',
      day: 1,
    },
    checkin_2: {
      text: "Still alive, good. Amara says you found the waterhole. Your grandfather found that same waterhole on his third day. Took him a week. You're already ahead. Radio Mama out.",
      day: 2,
    },
    checkin_3: {
      text: "Something moving near the eastern boundary. Amara is watching it. Stay west until she gives the all-clear. Don't argue with me about this. Radio Mama out.",
      day: 3,
    },
    checkin_4: {
      text: 'Your grandfather used to call me at this exact time every evening. Thirty years ago. Same frequency. I always picked up. Radio Mama out.',
      day: 4,
    },
    checkin_silence: {
      text: null,
      day: 5,
      note: 'No transmission. Silence is the event.',
    },
    final_call: {
      text: "City child. We're alright. Isaac's men left when they couldn't find what they came for. You keep what you found. All of it. Radio Mama out. For the last time.",
      day: 'post_ending',
    },
  },

  missionFail: {
    lionCharge: "The savanna doesn't grade on effort. Come back tomorrow. Same spot.",
    flashFlood:
      'Victor\'s note, margin of page 7: "Got caught in the valley flood. Lost the jeep for a day. Found the plateau instead. Some mistakes are geography lessons in disguise."',
    wildfire: "You can't outrun fire. But you can read it. West wind, east river. Try again.",
    hyenaCamp: 'The fire went out. It happens. Tomorrow night, start collecting firewood before dark.',
  },

  subtitles: {
    cubLeft: 'She found her way back. You helped without knowing it.',
    plateauView: 'This is where he used to watch the migration. You can see everything from here.',
    persistence:
      '"The savanna doesn\'t reward the lucky. It rewards the ones who stayed." — Victor Osei Mensah, 1987',
  },
};
