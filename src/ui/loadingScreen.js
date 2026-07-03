import { loadingManager } from '../core/loadingManager.js';
import { eventBus } from '../utils/eventBus.js';

// Scoped CSS styles for loading screen
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
  
  .loading-screen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #0a0a0a;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    opacity: 1;
    transition: opacity 1.2s ease-in-out;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  .loading-quote-container {
    max-width: 420px;
    text-align: center;
    margin-bottom: 40px;
    opacity: 0;
    transition: opacity 2s ease-in-out;
  }
  
  .loading-quote {
    font-family: 'Caveat', cursive;
    font-size: 24px;
    line-height: 1.8;
    margin-bottom: 10px;
  }
  
  .loading-quote-author {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.05em;
  }
  
  .loading-bar-container {
    width: 240px;
    height: 2px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 1px;
    overflow: hidden;
    margin-bottom: 15px;
  }
  
  .loading-bar-fill {
    width: 0%;
    height: 100%;
    background: #ffffff;
    transition: width 0.3s ease;
  }
  
  .loading-status-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`;

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

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

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
