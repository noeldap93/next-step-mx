import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/chat/',
  build: {
    outDir: '../../public/chat',
    // emptyOutDir is intentionally false: the admin app builds into
    // public/chat/admin, so wiping public/chat here would also wipe the
    // admin build. Vite uses hashed filenames so stale chunks are harmless.
    emptyOutDir: false,
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (path) => {
          // Forward /api/chat -> http://127.0.0.1:5001/<project>/<region>/chat
          // The project id and region come from VITE_FUNCTIONS_EMULATOR_PATH
          const base = process.env.VITE_FUNCTIONS_EMULATOR_PATH || '/next-step-mx/us-central1';
          return path.replace(/^\/api\/chat$/, `${base}/chat`);
        },
      },
    },
  },
});
