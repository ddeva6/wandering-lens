/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

const AUTO_CANCEL_MS = 3000;

// Shows the legendary-shot confirm prompt. Resolves via exactly one of
// onCommit/onCancel, then removes itself — commit, explicit cancel, or the
// 3-second timeout (which also counts as cancel).
export function showLegendaryConfirm(onCommit, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'legendary-confirm-overlay';
  overlay.innerHTML = `
    <p class="legendary-confirm-text">LEGENDARY SHOT — costs 3 frames</p>
    <div class="legendary-confirm-buttons">
      <button type="button" class="legendary-confirm-commit">COMMIT</button>
      <button type="button" class="legendary-confirm-cancel">CANCEL</button>
    </div>
  `;
  // Stop clicks on the overlay (including the buttons) from bubbling to
  // viewfinderUI's document-level shutter listener, which would otherwise
  // fire a second shot on the same click that resolves this prompt.
  overlay.addEventListener('click', (event) => event.stopPropagation());
  document.body.appendChild(overlay);

  let resolved = false;
  const timeout = setTimeout(() => resolve(onCancel), AUTO_CANCEL_MS);

  function resolve(handler) {
    if (resolved) return;
    resolved = true;
    clearTimeout(timeout);
    overlay.remove();
    handler();
  }

  overlay.querySelector('.legendary-confirm-commit').addEventListener('click', () => resolve(onCommit));
  overlay.querySelector('.legendary-confirm-cancel').addEventListener('click', () => resolve(onCancel));
}
