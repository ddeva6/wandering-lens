import { Clock } from 'three';

export function createLoop(renderer, scene, camera) {
  const clock = new Clock();
  const updatables = [];
  let running = false;

  function tick() {
    if (!running) return;
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    for (const update of updatables) {
      update(delta, elapsed);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  return {
    // update: (delta, elapsed) => void
    add(update) {
      updatables.push(update);
    },
    start() {
      if (running) return;
      running = true;
      clock.start();
      requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      clock.stop();
    },
  };
}
