import fs from 'node:fs';
import path from 'node:path';

/**
 * HYDRA Studio — local API for the /dashboard console.
 *
 * Zero-dependency Vite middleware: lets the dashboard upload media into
 * public/ and edit src/data/*.json. Vite watches those files, so every write
 * hot-reloads the live site instantly.
 *
 * Binds wherever vite does (127.0.0.1) — local studio use only.
 */

const DATA = () => path.join(process.cwd(), 'src', 'data');
const PUB = () => path.join(process.cwd(), 'public');

const safe = (s, fb) => {
  const v = String(s || '').replace(/[^a-zA-Z0-9._-]/g, '_');
  return v || fb;
};

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA(), file), 'utf8'));
  } catch {
    return fallback;
  }
};

const writeJson = (file, value) => {
  fs.mkdirSync(DATA(), { recursive: true });
  fs.writeFileSync(path.join(DATA(), file), JSON.stringify(value, null, 2) + '\n');
};

const send = (res, code, body) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

export function hydraStudio() {
  return {
    name: 'hydra-studio',
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        const url = new URL(req.url, 'http://local');
        const p = url.pathname;

        // ── Projects ────────────────────────────────────────────────
        if (p === '/projects' && req.method === 'GET') {
          return send(res, 200, readJson('projects.json', []));
        }
        if (p === '/projects' && req.method === 'PUT') {
          return readBody(req).then((buf) => {
            try {
              const list = JSON.parse(buf.toString('utf8'));
              if (!Array.isArray(list)) throw new Error('expected array');
              writeJson('projects.json', list);
              send(res, 200, { ok: true, count: list.length });
            } catch (e) {
              send(res, 400, { ok: false, error: String(e.message || e) });
            }
          });
        }

        // ── Atmosphere ──────────────────────────────────────────────
        if (p === '/atmosphere' && req.method === 'GET') {
          return send(res, 200, readJson('atmosphere.json', {}));
        }
        if (p === '/atmosphere' && req.method === 'PUT') {
          return readBody(req).then((buf) => {
            try {
              const cfg = JSON.parse(buf.toString('utf8'));
              writeJson('atmosphere.json', cfg);
              send(res, 200, { ok: true });
            } catch (e) {
              send(res, 400, { ok: false, error: String(e.message || e) });
            }
          });
        }

        // ── Upload — raw binary stream, name/dir via query ─────────
        if (p === '/upload' && req.method === 'POST') {
          const dir = String(url.searchParams.get('dir') || 'work/misc')
            .split('/')
            .map((seg) => safe(seg, 'x'))
            .join('/');
          if (!dir.startsWith('work')) return send(res, 400, { ok: false, error: 'dir must start with work/' });
          const name = safe(url.searchParams.get('name'), 'file.bin');
          const destDir = path.join(PUB(), dir);
          const dest = path.join(destDir, name);
          if (!dest.startsWith(path.join(PUB(), 'work'))) return send(res, 400, { ok: false, error: 'bad path' });
          fs.mkdirSync(destDir, { recursive: true });
          const ws = fs.createWriteStream(dest);
          req.pipe(ws);
          ws.on('finish', () => send(res, 200, { ok: true, path: `/${dir}/${name}` }));
          ws.on('error', (e) => send(res, 500, { ok: false, error: String(e) }));
          return;
        }

        // ── Health ──────────────────────────────────────────────────
        if (p === '/health') return send(res, 200, { ok: true, studio: 'hydra' });

        next();
      });
    },
  };
}
