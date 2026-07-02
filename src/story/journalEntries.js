/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

/**
 * Journal entries placeholder.
 * Full content loaded from public/data/story.json at runtime.
 * story.json is excluded from version control — see .gitignore.
 */

export const journalEntries = [];

export async function loadJournalEntries() {
  try {
    const res = await fetch('/data/story.json');
    const data = await res.json();
    return data.entries || [];
  } catch {
    console.warn('[STORY] story.json not found — running with empty journal.');
    return [];
  }
}
