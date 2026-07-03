import { defineConfig } from 'vite';

// Base path matches the GitHub Pages project URL:
// https://<username>.github.io/wandering-lens/
export default defineConfig({
  base: '/wandering-lens/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          howler: ['howler'],
          nipplejs: ['nipplejs'],
        },
      },
    },
    // three.js core is one monolithic vendor chunk (~510-565 kB min,
    // ~130-145 kB gzip) and cannot be split further — raise the limit
    // past it so a normal three.js update doesn't re-trigger the warning.
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 5173,
    open: true,
  },
});
