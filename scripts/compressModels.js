import { NodeIO } from '@gltf-transform/core';
import { draco } from '@gltf-transform/functions';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, '../public/models');

async function compressAll() {
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  const io = new NodeIO()
    .registerExtensions(KHRONOS_EXTENSIONS);
  const files = fs.readdirSync(modelsDir)
    .filter(f => f.endsWith('.glb') &&
                 !f.includes('.draco.'));
  for (const file of files) {
    const inputPath = path.join(modelsDir, file);
    const outputPath = path.join(modelsDir,
      file.replace('.glb', '.draco.glb'));
    console.log(`Compressing ${file}...`);
    const document = await io.read(inputPath);
    await document.transform(draco());
    await io.write(outputPath, document);
    console.log(`→ ${path.basename(outputPath)}`);
  }
  console.log('All models compressed.');
}

compressAll().catch(console.error);
