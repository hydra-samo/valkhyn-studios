import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { valkhynStudio } from './studio.plugin.mjs';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), valkhynStudio()],
  server: {
    // Tailnet access (phone / remote: tailscale serve proxies :443 -> :1717).
    // Without this Vite answers 403 to the .ts.net hostname and the phone
    // channel is dead even though the local probe says "up".
    allowedHosts: ['.ts.net'],
  },
});
