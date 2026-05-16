import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/chat/admin/',
  build: {
    outDir: '../../public/chat/admin',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5174,
  },
});
