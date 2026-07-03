import { loadingManager } from '../core/loadingManager.js';
import { eventBus } from '../utils/eventBus.js';

let overlay = null;
let barFill = null;
let statusTextEl = null;

function getStatusText(url) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('elephant')) return 'Locating the herd...';
  if (lowerUrl.includes('lion')) return 'Listening for the pride...';
  if (lowerUrl.includes('terrain')) return 'Raising the savanna...';
  if (lowerUrl.includes('skybox')) return 'Opening the sky...';
  if (lowerUrl.includes('audio')) return 'Tuning the wind...';
  return 'Preparing the expedition...';
}

function updateStatus(text) {
  if (statusTextEl) {
    statusTextEl.textContent = text;
  }
}

function setProgress(percent) {
  if (barFill) {
    barFill.style.width = `${percent}%`;
  }
}

function fadeOutLoadingScreen() {
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
      eventBus.emit('game:loaded');
    }, 1200);
  }
}

// Immediately create the element on module load (before Three.js init)
function createOverlay() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('loading-screen-overlay')) return;

  overlay = document.createElement('div');
  overlay.id = 'loading-screen-overlay';
  overlay.className = 'loading-screen-overlay';

  overlay.innerHTML = `
    <div class="loading-quote-container" id="loading-quote-container">
      <p class="loading-quote">"The first thing you'll notice is the silence. Don't fill it. Let it fill you."</p>
      <p class="loading-quote-author">— Victor Osei Mensah, Field Journal, 1971</p>
    </div>
    <div class="loading-bar-container">
      <div class="loading-bar-fill" id="loading-bar-fill"></div>
    </div>
    <div class="loading-status-text" id="loading-status-text">Preparing the expedition...</div>
  `;

  document.body.appendChild(overlay);

  // Fade in quote after DOM ready / short timeout
  setTimeout(() => {
    const quoteContainer = document.getElementById('loading-quote-container');
    if (quoteContainer) {
      quoteContainer.style.opacity = '1';
    }
  }, 100);

  barFill = document.getElementById('loading-bar-fill');
  statusTextEl = document.getElementById('loading-status-text');
}

// Run immediately
createOverlay();

export function init() {
  // Wire up LoadingManager callbacks
  loadingManager.onStart = (url, loaded, total) => {
    updateStatus('Loading world...');
    setProgress((loaded / total) * 100);
  };

  loadingManager.onProgress = (url, loaded, total) => {
    setProgress((loaded / total) * 100);
    updateStatus(getStatusText(url));
  };

  loadingManager.onLoad = () => {
    setProgress(100);
    updateStatus('Ready.');
    setTimeout(() => fadeOutLoadingScreen(), 800);
  };

  loadingManager.onError = (url) => {
    console.warn(`[LOAD] Failed: ${url}`);
    // Do not block — continue loading
  };
}
