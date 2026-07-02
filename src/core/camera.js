import { PerspectiveCamera } from 'three';

const FOV = 60;
const NEAR = 0.1;
const FAR = 5000;

export function createCamera() {
  const camera = new PerspectiveCamera(
    FOV,
    window.innerWidth / window.innerHeight,
    NEAR,
    FAR
  );
  camera.position.set(0, 2, 5);
  return camera;
}

export function resizeCamera(camera) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
