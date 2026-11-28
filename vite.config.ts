import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Inline the built stylesheet so first paint never waits on a CSS request.
 * The emitted .css file is dropped; /assets/* still uses immutable caching
 * for the JS bundle via public/_headers.
 */
const inlineCss = (): Plugin => ({
  name: 'inline-css',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml(html, ctx) {
    if (!ctx.bundle) return html;
    const entry = Object.entries(ctx.bundle).find(
      ([name, asset]) => name.endsWith('.css') && typeof asset.source === 'string'
    );
    if (!entry) return html;

    const [fileName, asset] = entry;
    // Dev CSS resolves /fonts from public/; inlined HTML needs a relative path
    // so the same bundle works from the site root and a Pages subpath.
    const css = (asset.source as string)
      .replace(/\/fonts\//g, './fonts/')
      .replace(/<\/style/gi, '<\\/style');
    delete ctx.bundle[fileName];

    return html.replace(
      /<link[^>]+rel="stylesheet"[^>]+href="\.\/assets\/[^"]+\.css"[^>]*>/,
      () => `<style>${css}</style>`
    );
  },
});

export default defineConfig({
  base: './',
  plugins: [inlineCss(), react(), tailwindcss()],
  server: {
    // Tailnet access (phone / remote: tailscale serve proxies :443 -> :1717).
    // Without this Vite answers 403 to the .ts.net hostname and the phone
    // channel is dead even though the local probe says "up".
    allowedHosts: ['.ts.net'],
  },
});
