import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { hydraStudio } from './studio.plugin.mjs';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), hydraStudio()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Tailnet access (phone / remote devices via tailscale serve)
      allowedHosts: ['.ts.net'],
      hmr: {
        host: 'hydra-studio.tail189f98.ts.net',
        protocol: 'wss',
      },
    },
  };
});
