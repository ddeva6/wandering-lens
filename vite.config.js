import { defineConfig } from 'vite';

// Base path matches the GitHub Pages project URL:
// https://<username>.github.io/wandering-lens/
export default defineConfig({
  base: '/wandering-lens/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          howler: ['howler'],
        },
      },
    },
  },
});
