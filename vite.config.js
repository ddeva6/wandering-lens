import { defineConfig } from 'vite';

// Base path matches the GitHub Pages project URL:
// https://<username>.github.io/wandering-lens/
export default defineConfig({
  base: '/wandering-lens/',
  build: {
    // three.js core is one monolithic vendor chunk (~510 kB min, ~129 kB
    // gzip) and cannot be split further — raise the limit just past it.
    chunkSizeWarningLimit: 560,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'three';
            if (id.includes('howler')) return 'howler';
            if (id.includes('nipplejs')) return 'nipplejs';
            return 'vendor';
          }
        },
      },
    },
  },
});
