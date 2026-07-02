/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

// Layered-noise canvas: draws small random-pixel canvases scaled up with
// smoothing enabled, which reads as smooth value noise. Placeholder-quality
// only — replaced by real texture files when they exist in public/textures/.
function noiseCanvas(size, octaves) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  octaves.forEach((octaveSize, i) => {
    const layer = document.createElement('canvas');
    layer.width = octaveSize;
    layer.height = octaveSize;
    const lctx = layer.getContext('2d');
    const pixels = lctx.createImageData(octaveSize, octaveSize);
    for (let p = 0; p < pixels.data.length; p += 4) {
      const v = Math.floor(Math.random() * 256);
      pixels.data[p] = v;
      pixels.data[p + 1] = v;
      pixels.data[p + 2] = v;
      pixels.data[p + 3] = 255;
    }
    lctx.putImageData(pixels, 0, 0);
    ctx.globalAlpha = 0.5 / (i + 1);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(layer, 0, 0, size, size);
  });

  ctx.globalAlpha = 1;
  return canvas;
}

export function createHeightmapTexture(size = 256) {
  const canvas = noiseCanvas(size, [4, 8, 16, 32]);
  return new CanvasTexture(canvas);
}

export function createGrassTexture(size = 256) {
  const noise = noiseCanvas(size, [8, 32, 64, 128]);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Tint the grayscale noise into dry-savanna greens and straw yellows.
  ctx.drawImage(noise, 0, 0);
  const img = ctx.getImageData(0, 0, size, size);
  for (let p = 0; p < img.data.length; p += 4) {
    const v = img.data[p] / 255;
    img.data[p] = 96 + v * 70;
    img.data[p + 1] = 110 + v * 60;
    img.data[p + 2] = 46 + v * 30;
  }
  ctx.putImageData(img, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
