/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

const listeners = new Map();

export const eventBus = {
  on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => this.off(event, handler);
  },

  off(event, handler) {
    listeners.get(event)?.delete(handler);
  },

  emit(event, payload) {
    listeners.get(event)?.forEach((handler) => handler(payload));
  },
};
