/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

export const amaraDialogue = {
  tier0: [
    {
      id: 'a0_1',
      trigger: 'player:approach',
      text: 'This zone is closed. Turn around.',
      tone: 'flat',
    },
    {
      id: 'a0_2',
      trigger: 'player:persist',
      text: "I said turn around. I won't say it again.",
      tone: 'warning',
    },
    {
      id: 'a0_3',
      trigger: 'player:question',
      text: "What you're looking for isn't east of here. Go back to camp.",
      tone: 'dismissive',
    },
  ],

  tier1: [
    {
      id: 'a1_1',
      trigger: 'player:greet',
      text: "You're still here.",
      tone: 'neutral',
    },
    {
      id: 'a1_2',
      trigger: 'player:ask_about_land',
      text: "The eastern zone floods in storm season. Don't drive into the valley blind.",
      tone: 'informational',
    },
    {
      id: 'a1_3',
      trigger: 'player:ask_about_victor',
      text: "I know the name. Everyone here does. That's all I'll say about it.",
      tone: 'guarded',
    },
    {
      id: 'a1_4',
      trigger: 'fieldtest1_complete',
      text: "You tracked the leopard without spooking it. That took patience. I didn't think you had it.",
      tone: 'reluctant_respect',
    },
  ],

  tier2: [
    {
      id: 'a2_1',
      trigger: 'player:greet',
      text: 'You\'ve been spending time at the waterhole. My grandmother used to say the waterhole teaches more than any school.',
      tone: 'opening',
    },
    {
      id: 'a2_2',
      trigger: 'player:ask_about_victor',
      text: 'He was kind. He asked before he photographed. Most of them don\'t ask. He always asked. My grandmother remembered him.',
      tone: 'soft',
    },
    {
      id: 'a2_3',
      trigger: 'player:ask_about_isaac',
      text: 'Isaac Mwangi has operated in this territory for thirty years. He knows where the rangers patrol. He knows because someone tells him.',
      tone: 'careful',
    },
    {
      id: 'a2_4',
      trigger: 'fieldtest2_complete',
      text: 'Five calls. Correct. The lilac-breasted roller is the hardest — most people mistake it for the kingfisher. You didn\'t.',
      tone: 'genuine',
    },
    {
      id: 'a2_5',
      trigger: 'amara:pointsToLandmark',
      text: 'The baobab to the north. Your grandfather carved a mark on the east face. Third branch from the ground. I found it when I was seven.',
      tone: 'offering',
    },
  ],

  tier3: [
    {
      id: 'a3_1',
      trigger: 'amara:arrivedForAct3',
      text: "Radio Mama is safe. Isaac's men found nothing at the station. But they'll come back. We don't have long.",
      tone: 'urgent',
    },
    {
      id: 'a3_2',
      trigger: 'story:allTrackersFound',
      text: 'Six trackers. He\'s been mapping your route since the first day. Every zone you entered. Every animal you photographed. He knows what you found before you knew what you found.',
      tone: 'grim',
    },
    {
      id: 'a3_3',
      trigger: 'player:ask_about_1994',
      text: 'I was three years old. My grandmother told me later. She said a photographer came to warn the rangers about the poaching routes. He never came back from the field. His jeep was found. His cameras were not. Isaac\'s operation doubled in size that year.',
      tone: 'grief',
    },
    {
      id: 'a3_4',
      trigger: 'story:endingUnlocked',
      text: 'My community can protect this land. But only if we know what\'s buried here. The choice is yours, not mine.',
      tone: 'quiet_strength',
    },
  ],

  fieldTestPrompts: {
    test1: 'Can you track without being tracked? The leopard was here this morning. Find it without disturbing it. I\'ll be watching.',
    test2: 'Close your eyes. Tell me what you hear.',
    test3: 'The hidden waterhole. No map. No marker. Follow what the elephants follow. If you find it — you understand this land.',
  },
};
