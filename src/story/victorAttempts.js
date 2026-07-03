/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

// Twelve shots Victor documented in his field journal but never got —
// matched against the player's legendary shots by species + world zone
// in src/mechanics/photo/photoComparison.js.
export const victorAttempts = [
  {
    id: 1,
    rarity: 0.1,
    year: 1978,
    zone: 'west',
    species: 'elephant',
    victorScore: 67,
    victorNote:
      'She looked directly at the lens for three full seconds. I hesitated. By the time I pressed the shutter she had turned away. I sat there for an hour afterward. Some moments punish the uncertain.',
    requiredMoment: 'drink',
  },
  {
    id: 2,
    rarity: 0.1,
    year: 1972,
    zone: 'west',
    species: 'elephant',
    victorScore: 54,
    victorNote:
      "First season out here and already I've learned the wrong lesson twice — that patience is a virtue, and that virtue is not the same as timing. The calf drank first. Its mother watched me the whole time, not it. I photographed the wrong one.",
    requiredMoment: 'drink',
  },
  {
    id: 3,
    rarity: 0.1,
    year: 1983,
    zone: 'north',
    species: 'elephant',
    victorScore: 71,
    victorNote:
      'The drought pushed them north of where the maps say elephants go. I followed for six days on a hunch and a half tank of fuel. Found them at a pan I did not know existed. Got close. Not close enough — the light broke before I did.',
    requiredMoment: 'drink',
  },
  {
    id: 4,
    rarity: 0.1,
    year: 1974,
    zone: 'east',
    species: 'lion',
    victorScore: 61,
    victorNote:
      'The male yawned instead of roared. Every book I own says the roar is the shot. Nobody tells you the yawn is more honest, or that honesty rarely photographs well. I have three rolls of yawns and not one roar to show for them.',
    requiredMoment: 'rest',
  },
  {
    id: 5,
    rarity: 0.1,
    year: 1985,
    zone: 'east',
    species: 'lion',
    victorScore: 78,
    victorNote:
      'A cub asleep against its mother\'s flank, her paw resting over it like a question she already knew the answer to. I got within thirty metres before my own breathing gave me away. She did not charge. She simply looked at me until I left. I have never felt so correctly dismissed.',
    requiredMoment: 'rest',
  },
  {
    id: 6,
    rarity: 0.1,
    year: 1990,
    zone: 'south',
    species: 'lion',
    victorScore: 49,
    victorNote:
      "A nomadic pride passing through, gone by morning. I chased the light instead of the lions and lost both. Twelve years in and I still make a rookie's trade. Perhaps that is the actual lesson — the savanna does not grade on tenure.",
    requiredMoment: 'stalk',
  },
  {
    id: 7,
    rarity: 0.1,
    year: 1986,
    zone: 'south',
    species: 'cheetah',
    victorScore: 73,
    victorNote:
      "She ran alongside the jeep for eleven seconds — I counted, out loud, like a fool. Eleven seconds at that speed is a lifetime and no lifetime at all. The frame I got shows her mid-stride, blurred at the edges. I have decided I prefer it blurred. Sharp would have been a lie about how fast that was.",
    requiredMoment: 'race',
  },
  {
    id: 8,
    rarity: 0.1,
    year: 1971,
    zone: 'east',
    species: 'cheetah',
    victorScore: 58,
    victorNote:
      'Young, solitary, hunting too close to lion ground for my comfort or hers. I wanted the photograph more than I wanted her safe, which is a thing I am not proud to have written down but will not cross out either. She lived. The photograph did not turn out. I think I got the order of my priorities backward and the savanna corrected me anyway.',
    requiredMoment: 'race',
  },
  {
    id: 9,
    rarity: 0.1,
    year: 1980,
    zone: 'west',
    species: 'giraffe',
    victorScore: 65,
    victorNote:
      'Four of them at the waterhole at first light, necks bowed at that impossible angle that always looks like prayer and is probably just thirst. I metered for the sky and lost the animals to shadow. A technical failure, I keep telling myself. Not a failure of attention. I am not sure I believe me.',
    requiredMoment: 'idle',
  },
  {
    id: 10,
    rarity: 0.1,
    year: 1993,
    zone: 'north',
    species: 'giraffe',
    victorScore: 69,
    victorNote:
      "Last roll before the rains, last good light of the season. One of them turned its head toward camp, toward me, the way they do — unhurried, unbothered, entirely certain of its own patience. I was not certain of mine. This is the closest I have come to photographing what stillness actually looks like. It is still not close enough.",
    requiredMoment: 'idle',
  },
  {
    id: 11,
    rarity: 0.1,
    year: 1977,
    zone: 'north',
    species: 'zebra',
    victorScore: 52,
    victorNote:
      "A herd grazing in that loose, overlapping pattern that makes each stripe argue with its neighbour. Beautiful, and beautifully impossible to focus on any single animal without the whole picture falling apart. I chose one. I should have chosen the chaos. The chaos was the actual subject.",
    requiredMoment: 'graze',
  },
  {
    id: 12,
    rarity: 0.1,
    year: 1989,
    zone: 'west',
    species: 'zebra',
    victorScore: 63,
    victorNote:
      'Grazing near the elephant crossing, close enough that I could photograph both if I was patient and lucky in equal measure. I was patient. Luck did not show up that morning. I have learned not to blame the animals for my arithmetic.',
    requiredMoment: 'graze',
  },
];
