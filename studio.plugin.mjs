import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';

/**
 * VALKHYN Studio — local API for the /dashboard console.
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

/* The live agent server is `opencode-serve.service`, bound to this box's
   tailnet address; `valkhyn-agent.service` is an inactive loopback duplicate.
   Resolve once: loopback first, then `tailscale ip -4`. */
let agentBase;
const resolveAgent = async () => {
  if (agentBase) return agentBase;
  try {
    await fetch('http://127.0.0.1:17171/project');
    return (agentBase = 'http://127.0.0.1:17171');
  } catch {}
  const ip = await new Promise((res) =>
    execFile('tailscale', ['ip', '-4'], (err, out) => res(err ? '' : out.trim().split('\n')[0])),
  );
  if (!ip) throw new Error('agent server unreachable');
  return (agentBase = `http://${ip}:17171`);
};

export function valkhynStudio() {
  return {
    name: 'valkhyn-studio',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://local');
        const p = url.pathname;

        // ── Agent liveness (for the drawer status dot) ──────────────
        if (p === '/agent-health') {
          try {
            const r = await fetch(`${await resolveAgent()}/project`, { method: 'GET' });
            return send(res, 200, { up: r.ok });
          } catch {
            return send(res, 200, { up: false });
          }
        }

        // ── Agent proxy → self-hosted opencode (127.0.0.1:17171) ────
        // Same-origin for the dashboard: no CORS, no token handling here.
        if (p.startsWith('/agent')) {
          const rest = p.slice('/agent'.length) + url.search;
          const init = { method: req.method, headers: {} };
          if (req.headers['content-type']) init.headers['content-type'] = req.headers['content-type'];
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const body = await readBody(req);
            if (body.length) init.body = body;
          }
          try {
            const r = await fetch(`${await resolveAgent()}${rest}`, init);
            const text = await r.text();
            res.statusCode = r.status;
            res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
            return res.end(text);
          } catch {
            return send(res, 502, { ok: false, error: 'agent server unreachable (valkhyn-agent.service down?)' });
          }
        }

        // ── Environment: skills / mcp servers / plugins ─────────────
        if (p === '/env' && req.method === 'GET') {
          const home = os.homedir();
          const listDir = (dir) => {
            try {
              return fs
                .readdirSync(dir, { withFileTypes: true })
                .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
                .map((e) => e.name);
            } catch {
              return [];
            }
          };
          const skills = [
            ...listDir(path.join(home, '.agents', 'skills')).map((n) => ({ name: n, src: 'global' })),
            ...listDir(path.join(process.cwd(), '.opencode', 'skills')).map((n) => ({ name: n, src: 'project' })),
          ];
          let mcps = [];
          let plugins = [];
          try {
            const r = await fetch(`${await resolveAgent()}/config`);
            const cfg = await r.json();
            mcps = Object.entries(cfg.mcp || {}).map(([name, v]) => ({
              name,
              type: v?.type || 'local',
              enabled: v?.enabled !== false,
            }));
            plugins = Array.isArray(cfg.plugin) ? cfg.plugin : [];
          } catch {}
          return send(res, 200, { skills, mcps, plugins });
        }

        // ── Open Computer Use toggle (wraps ~/bin ocu-toggle) ───────
        if (p === '/ocu' && (req.method === 'GET' || req.method === 'POST')) {
          let state;
          if (req.method === 'POST') {
            const buf = await readBody(req);
            try {
              state = JSON.parse(buf.toString('utf8') || '{}').state;
            } catch {}
          }
          const args = state ? [String(state)] : [];
          if (state && !['on', 'off', 'block'].includes(state)) {
            return send(res, 400, { ok: false, error: 'state must be on|off|block' });
          }
          const bin = path.join(os.homedir(), '.config', 'opencode', 'bin', 'ocu-toggle');
          // The toggle script was never shipped with the console; report it as
          // unavailable instead of a 500 the drawer would log on every open.
          if (!fs.existsSync(bin)) return send(res, 200, { ok: false, unavailable: true, output: '' });
          return execFile(bin, args, { timeout: 5000 }, (err, stdout) => {
            if (err) return send(res, 500, { ok: false, error: String(err.message || err) });
            send(res, 200, { ok: true, output: String(stdout).trim() });
          });
        }

        // ── Repo tree + file viewer (dashboard Files panel) ─────────
        if (p === '/tree' && req.method === 'GET') {
          const SKIP = new Set(['node_modules', '.git', 'dist', '.secrets']);
          const out = [];
          const walk = (dir, rel, depth) => {
            if (depth > 8 || out.length > 3000) return;
            let entries;
            try {
              entries = fs.readdirSync(dir, { withFileTypes: true });
            } catch {
              return;
            }
            for (const e of entries) {
              if (SKIP.has(e.name)) continue;
              const abs = path.join(dir, e.name);
              const r = rel ? `${rel}/${e.name}` : e.name;
              if (e.isDirectory()) {
                out.push({ p: r, d: true });
                walk(abs, r, depth + 1);
              } else {
                let size = 0;
                try {
                  size = fs.statSync(abs).size;
                } catch {}
                out.push({ p: r, d: false, s: size });
              }
            }
          };
          walk(process.cwd(), '', 0);
          return send(res, 200, out);
        }

        if (p === '/file' && req.method === 'GET') {
          const rel = String(url.searchParams.get('path') || '');
          const abs = path.resolve(process.cwd(), rel);
          if (!abs.startsWith(process.cwd()) || rel.includes('..')) {
            return send(res, 403, { ok: false, error: 'outside repo' });
          }
          let stat;
          try {
            stat = fs.statSync(abs);
          } catch {
            return send(res, 404, { ok: false, error: 'not found' });
          }
          if (stat.size > 400 * 1024) return send(res, 200, { path: rel, binary: true, reason: 'too large' });
          const buf = fs.readFileSync(abs);
          // crude binary sniff: NUL byte in first 8000 bytes
          if (buf.subarray(0, 8000).includes(0)) return send(res, 200, { path: rel, binary: true });
          return send(res, 200, { path: rel, binary: false, text: buf.toString('utf8') });
        }

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
          const name = safe(url.searchParams.get('name'), 'file.bin');
          const destDir = path.join(PUB(), dir);
          const dest = path.join(destDir, name);
          if (!dest.startsWith(PUB())) return send(res, 400, { ok: false, error: 'bad path' });
          fs.mkdirSync(destDir, { recursive: true });
          const ws = fs.createWriteStream(dest);
          req.pipe(ws);
          ws.on('finish', () => send(res, 200, { ok: true, path: `/${dir}/${name}` }));
          ws.on('error', (e) => send(res, 500, { ok: false, error: String(e) }));
          return;
        }

        // ── Health ──────────────────────────────────────────────────
        if (p === '/health') return send(res, 200, { ok: true, studio: 'valkhyn' });

        next();
      });
    },
  };
}
