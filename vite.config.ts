import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { hydraStudio } from './studio.plugin.mjs';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), hydraStudio()],
});
