import { WebGLRenderer } from 'three';

export function createRenderer(canvas) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer;
}

export function resizeRenderer(renderer) {
  renderer.setSize(window.innerWidth, window.innerHeight);
}
