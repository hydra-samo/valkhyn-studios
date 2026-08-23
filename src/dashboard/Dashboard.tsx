import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Trash2,
  ExternalLink,
  RefreshCw,
  Check,
  FolderOpen,
  FolderTree,
  Waves,
  ChevronRight,
  ChevronDown,
  File as FileIcon,
  PanelRightClose,
  PanelRightOpen,
  Send,
} from 'lucide-react';
import { HydraLogo } from '../components/HydraLogo';

/**
 * HYDRA Studio Console (/dashboard).
 *
 * Layout: left activity rail → active side panel (Content / Files /
 * Atmosphere) → persistent Agent drawer on the right that stays mounted over
 * every panel. Visual language follows BRAND/DESIGN.md: abyssal canvas,
 * white/[0.04] glass with backdrop blur, emerald-bordered obsidian buttons,
 * Manrope labels, Space Grotesk headings — no solid neon CTAs, no SaaS pills,
 * mono reserved for technical readouts.
 */

type Project = {
  id: string;
  title: string;
  client: string;
  category: 'video' | 'motion' | 'direction';
  tag: string;
  year: string;
  thumbnail: string;
  videoUrl?: string;
  description: string;
  softwareStack: string[];
  clientBrief: string;
  deliverables: string[];
};

type Atmosphere = {
  master: boolean;
  grain: boolean;
  layers: Record<string, { enabled: boolean; opacity: number; blend: string }>;
};

const LAYER_LABELS: Record<string, string> = {
  haze: 'Haze',
  'env-secondary': 'Blue Wash',
  'env-primary': 'Volumetric Green',
  dust: 'Dust Field',
  wisp: 'Atmospheric Wisp',
  'geometry-primary': 'Geometry (Work)',
  'env-fragment': 'Signature Fragment (Work)',
};

const BLENDS = ['screen', 'normal', 'overlay', 'soft-light', 'luminosity'];

/** Section import targets — where uploaded files land in public/. */
const IMPORT_TARGETS: { id: string; label: string; dir: string; hint: string }[] = [
  { id: 'hero-bg', label: 'Hero Background', dir: 'background', hint: 'background.jpeg replacement lives here' },
  { id: 'work-media', label: 'Work Media', dir: 'work/upload', hint: 'posters & videos for case studies' },
  { id: 'motion-layers', label: 'Motion Layers', dir: 'motion', hint: 'name files NN.mp4 (e.g. 06.mp4)' },
  { id: 'brand', label: 'Brand Assets', dir: 'brand', hint: 'logos, favicons, social cards' },
  { id: 'audio', label: 'Voice Audio', dir: 'audio', hint: 'voice-over tracks for future playback' },
];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, init);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function Dashboard() {
  const [panel, setPanel] = useState<'content' | 'files' | 'atmosphere'>('content');
  const [agentOpen, setAgentOpen] = useState(true);
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    api<{ ok: boolean }>('/health').then(() => setAlive(true)).catch(() => setAlive(false));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#060c09] text-[#f3f4f6] overflow-hidden relative" style={{ colorScheme: 'dark' }}>
      {/* Translucent aurora under-layer — panels float on this */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-1/4 left-1/3 -translate-x-1/2 w-[52rem] h-[40rem] rounded-full bg-[#10b981]/[0.055] blur-[130px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[44rem] h-[36rem] rounded-full bg-[#059669]/[0.05] blur-[120px]" />
        <div className="absolute top-1/3 right-[-12%] w-[38rem] h-[34rem] rounded-full bg-[#34d399]/[0.035] blur-[110px]" />
      </div>

      {/* Header lockup */}
      <header className="relative z-10 flex items-center justify-between px-5 h-14 shrink-0 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <HydraLogo className="h-6 w-6 text-accent hydra-mark-glow" />
          <span className="font-display font-bold tracking-[-0.02em] text-sm uppercase">
            HYDRA <span className="text-accent">SAMO</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/35 ml-1 hidden sm:inline">
            Studio Console
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`h-1.5 w-1.5 rounded-full ${alive ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}
            title={alive ? 'Local server running' : 'Server unreachable'}
          />
          <a href="/" target="_blank" rel="noreferrer" className={ghostBtn}>
            Open Site <ExternalLink size={11} />
          </a>
          <button onClick={() => setAgentOpen(!agentOpen)} className={ghostBtn} title="Toggle agent drawer">
            {agentOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
          </button>
        </div>
      </header>

      {/* Body: rail · panel · agent drawer */}
      <div className="relative z-10 flex flex-1 min-h-0">
        {/* Activity rail */}
        <nav className="w-14 shrink-0 flex flex-col items-center gap-1 py-3 border-r border-white/[0.06] bg-white/[0.015]" aria-label="Console panels">
          {(
            [
              ['content', FolderOpen, 'Content & Imports'],
              ['files', FolderTree, 'Repo Files'],
              ['atmosphere', Waves, 'Atmosphere'],
            ] as const
          ).map(([id, Icon, title]) => (
            <button
              key={id}
              onClick={() => setPanel(id)}
              title={title}
              aria-pressed={panel === id}
              className={`relative h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                panel === id ? 'bg-white/[0.06] text-accent' : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {panel === id && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full bg-accent" />}
              <Icon size={17} />
            </button>
          ))}
        </nav>

        {/* Active panel */}
        <main className="flex-1 min-w-0 overflow-y-auto p-5 sm:p-7">
          <div className="max-w-3xl mx-auto space-y-6">
            {panel === 'content' && <ContentPanel />}
            {panel === 'files' && <FilesPanel />}
            {panel === 'atmosphere' && <AtmospherePanel />}
          </div>
        </main>

        {/* Persistent agent drawer — mounts once, survives panel switches */}
        {agentOpen && (
          <aside className="w-[24rem] xl:w-[26rem] shrink-0 border-l border-white/[0.06] bg-white/[0.02] backdrop-blur-md flex flex-col min-h-0">
            <AgentDrawer />
          </aside>
        )}
      </div>
    </div>
  );
}

/* ── Shared styles (DESIGN.md: glassmorphic obsidian, never solid neon) ── */

const ghostBtn =
  'h-8 px-3 rounded-lg border border-emerald-500/25 bg-emerald-950/30 text-[10px] font-semibold uppercase tracking-wider text-white/70 hover:border-emerald-500/50 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all inline-flex items-center gap-1.5';
const input =
  'w-full bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-white/25';
const fieldLabel = 'block text-[10px] font-medium uppercase tracking-widest text-white/40 mb-1.5';

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-semibold uppercase tracking-tight text-xl mb-1">{children}</h2>
  );
}

/* ── Content panel ───────────────────────────────────────────────────── */

function ContentPanel() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  const refresh = useCallback(() => {
    api<Project[]>('/projects').then(setProjects).catch(() => setProjects([]));
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = async (id: string) => {
    if (!projects) return;
    await api('/projects', { method: 'PUT', body: JSON.stringify(projects.filter((p) => p.id !== id)) });
    refresh();
  };

  return (
    <>
      <PanelTitle>
        Content <span className="text-accent">&amp;</span> Imports
      </PanelTitle>
      <p className="text-sm text-white/45 mb-5">Import section files, publish projects — every change lands live.</p>

      <ImportTargets />
      <ImportProjectsJson onDone={refresh} />

      {/* Projects list */}
      <section className="glass-card rounded-2xl overflow-hidden" aria-label="Published work">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
            Published Work ({projects?.length ?? '…'})
          </span>
          <button onClick={refresh} className={ghostBtn} title="Refresh">
            <RefreshCw size={11} />
          </button>
        </div>
        {projects === null ? (
          <p className="px-5 py-6 text-sm text-white/30">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30">No published work yet.</p>
        ) : (
          <ul>
            {projects.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0">
                <span className="w-14 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden shrink-0">
                  {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">{p.title}</span>
                  <span className="block text-[11px] text-white/35 truncate">
                    {p.client} · {p.year} · {p.tag}
                  </span>
                </span>
                <button
                  onClick={() => remove(p.id)}
                  className="h-8 w-8 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  aria-label={`Delete ${p.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddProjectForm onDone={refresh} />
    </>
  );
}

function ImportTargets() {
  const [target, setTarget] = useState(IMPORT_TARGETS[0].id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string[] | null>(null);

  const submit = async () => {
    const t = IMPORT_TARGETS.find((x) => x.id === target)!;
    const files = fileRef.current?.files;
    if (!files?.length || busy) return;
    setBusy(true);
    setDone(null);
    try {
      const saved: string[] = [];
      for (const f of Array.from(files)) {
        saved.push(await upload(f, `${t.dir}/${f.name}`));
      }
      setDone(saved);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setDone([`error: ${String(e)}`]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass-card rounded-2xl p-5 space-y-4" aria-label="Import section files">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">Import Section Files</span>
        {done && (
          <span className="text-[10px] text-accent inline-flex items-center gap-1">
            <Check size={11} /> {done.length} file{done.length > 1 ? 's' : ''} live
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={fieldLabel} htmlFor="import-target">
            Target
          </label>
          <select id="import-target" value={target} onChange={(e) => setTarget(e.target.value)} className={`${input} cursor-pointer`}>
            {IMPORT_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} → /{t.dir}/
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={fieldLabel}>Files</span>
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={(e) => void submit()}
            disabled={busy}
            className="block w-full text-[11px] text-white/40 file:h-9 file:mr-3 file:px-3 file:rounded-lg file:border file:border-emerald-500/30 file:bg-emerald-950/30 file:text-white/80 file:text-[10px] file:uppercase file:tracking-wider file:cursor-pointer cursor-pointer"
          />
        </div>
      </div>
      <p className="text-[11px] text-white/25">
        {IMPORT_TARGETS.find((t) => t.id === target)?.hint} · uploads go straight to public/ and hot-reload the site
      </p>
      {done && done.length > 0 && (
        <ul className="space-y-1">
          {done.map((d) => (
            <li key={d} className="text-[11px] font-mono text-white/40">
              {d}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ImportProjectsJson({ onDone }: { onDone: () => void }) {
  return (
    <label className="glass-card rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:border-emerald-500/30 transition-colors">
      <span>
        <span className="block text-[10px] font-medium uppercase tracking-widest text-white/40 mb-0.5">Bulk Import</span>
        <span className="block text-xs text-white/45">Replace the project list from a projects.json export</span>
      </span>
      <Upload size={15} className="text-accent shrink-0" />
      <input
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            const list = JSON.parse(await f.text());
            if (!Array.isArray(list)) throw new Error('expected a JSON array');
            await api('/projects', { method: 'PUT', body: JSON.stringify(list) });
            onDone();
          } catch {
            /* invalid file — silent */
          }
          e.target.value = '';
        }}
      />
    </label>
  );
}

/* ── Files panel (VSCode-style repo browser) ─────────────────────────── */

type TreeEntry = { p: string; d: boolean; s?: number };

function FilesPanel() {
  const [entries, setEntries] = useState<TreeEntry[] | null>(null);
  const [openDirs, setOpenDirs] = useState<Set<string>>(new Set(['src', 'src/data']));
  const [selected, setSelected] = useState<{ path: string; binary?: boolean; text?: string; reason?: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const refresh = useCallback(() => {
    api<TreeEntry[]>('/tree').then(setEntries).catch(() => setEntries([]));
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const openFile = async (path: string) => {
    setLoadingFile(true);
    try {
      const res = await api<{ path: string; binary: boolean; text?: string; reason?: string }>(
        `/file?path=${encodeURIComponent(path)}`
      );
      setSelected(res);
    } finally {
      setLoadingFile(false);
    }
  };

  // Build nested tree from flat entries
  const tree = useMemo(() => buildTree(entries ?? []), [entries]);

  return (
    <>
      <PanelTitle>
        Repo <span className="text-accent">Files</span>
      </PanelTitle>
      <p className="text-sm text-white/45 mb-5">Every file behind the site. The agent can edit any of them on request.</p>

      <div className="glass-card rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[28rem]">
        {/* Tree */}
        <div className="border-b md:border-b-0 md:border-r border-white/[0.06] overflow-y-auto max-h-[32rem] md:max-h-none py-2">
          <div className="flex items-center justify-between px-4 pb-2">
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/35">Explorer</span>
            <button onClick={refresh} className="text-white/30 hover:text-white transition-colors" title="Refresh">
              <RefreshCw size={11} />
            </button>
          </div>
          {tree.map((node) => (
            <TreeRow
              key={node.path}
              node={node}
              depth={0}
              openDirs={openDirs}
              setOpenDirs={setOpenDirs}
              selected={selected?.path}
              onFile={openFile}
            />
          ))}
        </div>

        {/* Viewer */}
        <div className="overflow-auto max-h-[32rem] md:max-h-none min-h-[16rem]">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-xs text-white/25 p-8 text-center">
              Pick a file to preview its contents.
            </div>
          ) : loadingFile ? (
            <p className="p-5 text-xs text-white/30">Reading…</p>
          ) : selected.binary ? (
            <div className="p-5 text-xs text-white/40">
              <span className="font-mono">{selected.path}</span> — binary or too large ({selected.reason ?? 'binary'}).
            </div>
          ) : (
            <pre className="p-5 text-[11px] leading-relaxed font-mono text-white/60 whitespace-pre-wrap break-words">
              {selected.text}
            </pre>
          )}
        </div>
      </div>
    </>
  );
}

type TreeNode = { name: string; path: string; children: Map<string, TreeNode>; isDir: boolean };

function buildTree(entries: TreeEntry[]): TreeNode[] {
  const root: TreeNode = { name: '', path: '', children: new Map(), isDir: true };
  for (const e of entries) {
    const parts = e.p.split('/');
    let cur = root;
    parts.forEach((part, i) => {
      const isLast = i === parts.length - 1;
      const p = parts.slice(0, i + 1).join('/');
      if (!cur.children.has(part)) {
        cur.children.set(part, { name: part, path: p, children: new Map(), isDir: !isLast || e.d });
      }
      cur = cur.children.get(part)!;
    });
  }
  const flatten = (n: TreeNode): TreeNode[] =>
    [...n.children.values()].sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1));
  return flatten(root);
}

function TreeRow({
  node,
  depth,
  openDirs,
  setOpenDirs,
  selected,
  onFile,
}: {
  node: TreeNode;
  depth: number;
  openDirs: Set<string>;
  setOpenDirs: React.Dispatch<React.SetStateAction<Set<string>>>;
  selected?: string;
  onFile: (p: string) => void;
}) {
  const open = openDirs.has(node.path);
  return (
    <>
      <button
        onClick={() => {
          if (node.isDir) {
            const next = new Set(openDirs);
            if (open) next.delete(node.path);
            else next.add(node.path);
            setOpenDirs(next);
          } else {
            onFile(node.path);
          }
        }}
        className={`w-full text-left flex items-center gap-1.5 py-1 pr-2 text-xs transition-colors ${
          selected === node.path ? 'bg-white/[0.05] text-white' : 'text-white/55 hover:bg-white/[0.03] hover:text-white'
        }`}
        style={{ paddingLeft: `${depth * 14 + 14}px` }}
      >
        {node.isDir ? (
          open ? (
            <ChevronDown size={12} className="shrink-0 text-white/30" />
          ) : (
            <ChevronRight size={12} className="shrink-0 text-white/30" />
          )
        ) : (
          <FileIcon size={11} className="shrink-0 text-white/25" />
        )}
        <span className={`truncate ${node.isDir ? 'font-medium' : 'font-normal'}`}>{node.name}</span>
      </button>
      {node.isDir &&
        open &&
        node.children.size > 0 &&
        [...node.children.values()]
          .sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1))
          .map((c) => (
            <TreeRow
              key={c.path}
              node={c}
              depth={depth + 1}
              openDirs={openDirs}
              setOpenDirs={setOpenDirs}
              selected={selected}
              onFile={onFile}
            />
          ))}
    </>
  );
}

/* ── Atmosphere panel ────────────────────────────────────────────────── */

function AtmospherePanel() {
  const [cfg, setCfg] = useState<Atmosphere | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    api<Atmosphere>('/atmosphere').then(setCfg).catch(() => {});
  }, []);

  const save = useCallback((next: Atmosphere) => {
    setCfg(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      api('/atmosphere', { method: 'PUT', body: JSON.stringify(next) })
        .then(() => {
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 1500);
        })
        .catch(() => {});
    }, 250);
  }, []);

  if (!cfg)
    return (
      <>
        <PanelTitle>Atmosphere</PanelTitle>
        <p className="text-sm text-white/30 mt-4">Loading…</p>
      </>
    );

  const patchLayer = (id: string, patch: Partial<Atmosphere['layers'][string]>) =>
    save({ ...cfg, layers: { ...cfg.layers, [id]: { ...cfg.layers[id], ...patch } } });

  return (
    <>
      <PanelTitle>
        Atmos<span className="text-accent">phere</span>
      </PanelTitle>
      <p className="text-sm text-white/45 mb-5">The living layer behind every section — tuned in real time.</p>

      <div className="glass-card rounded-2xl divide-y divide-white/[0.06] mb-6">
        <SwitchRow label="Atmosphere Engine" hint="All video layers behind the content" checked={cfg.master} onChange={(v) => save({ ...cfg, master: v })} />
        <SwitchRow label="Film Grain" hint="Full-screen texture overlay" checked={cfg.grain} onChange={(v) => save({ ...cfg, grain: v })} />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">Layers</span>
          {justSaved && (
            <span className="text-[10px] uppercase tracking-widest text-accent inline-flex items-center gap-1">
              <Check size={11} /> Synced live
            </span>
          )}
        </div>
        <ul>
          {Object.keys(LAYER_LABELS).map((id) => {
            const l = cfg.layers[id] ?? { enabled: true, opacity: 1, blend: 'screen' };
            return (
              <li
                key={id}
                className="px-5 py-4 border-b border-white/[0.04] last:border-0 grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_130px_120px] items-center gap-x-4 gap-y-2"
              >
                <Toggle checked={l.enabled !== false} onChange={(v) => patchLayer(id, { enabled: v })} small />
                <div className="min-w-0">
                  <span className={`block text-sm font-medium ${l.enabled === false ? 'text-white/25 line-through' : ''}`}>
                    {LAYER_LABELS[id]}
                  </span>
                  <code className="block text-[10px] font-mono text-white/25">{id}</code>
                </div>
                <label className="flex items-center gap-2 col-start-2 sm:col-start-auto">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={l.opacity}
                    onChange={(e) => patchLayer(id, { opacity: Number(e.target.value) })}
                    className="w-full accent-[#10b981]"
                    aria-label={`${LAYER_LABELS[id]} opacity`}
                  />
                  <span className="text-[10px] tabular-nums text-white/40 w-8">{Math.round(l.opacity * 100)}%</span>
                </label>
                <select
                  value={l.blend}
                  onChange={(e) => patchLayer(id, { blend: e.target.value })}
                  className="h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] px-2 cursor-pointer"
                  aria-label={`${LAYER_LABELS[id]} blend mode`}
                >
                  {BLENDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

/* ── Agent drawer (persistent across panels) ─────────────────────────── */

type ChatMsg = { role: 'user' | 'assistant'; text: string };

const SESSION_KEY = 'hydra-agent-session';

function AgentDrawer() {
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'plan' | 'build'>(
    () => (localStorage.getItem('hydra-agent-mode') as 'plan' | 'build') || 'plan'
  );
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState<string>(() => localStorage.getItem('hydra-agent-model') || 'x-preview-f-free');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ providers: { id: string; models: Record<string, unknown> }[] }>('/agent/config/providers')
      .then((c) => {
        const zen = c.providers?.find((p) => p.id === 'opencode');
        if (zen?.models)
          setModels(
            Object.keys(zen.models)
              .filter((m) => /(^|-)free$/.test(m) || m === 'big-pickle' || m.startsWith('deepseek'))
              .sort()
          );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', text }]);
    try {
      let sid = sessionId;
      if (!sid) {
        const s = await api<{ id: string }>('/agent/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        sid = s.id;
        localStorage.setItem(SESSION_KEY, sid);
        setSessionId(sid);
      }
      const res = await api<{ parts?: { type: string; text?: string }[] }>(`/agent/session/${sid}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parts: [{ type: 'text', text }],
          agent: mode,
          ...(model ? { model: { providerID: 'opencode', modelID: model } } : {}),
        }),
      });
      const reply = (res.parts ?? [])
        .filter((p) => p.type === 'text' && p.text)
        .map((p) => p.text)
        .join('\n')
        .trim();
      setMessages((m) => [...m, { role: 'assistant', text: reply || '(no text output)' }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: `⚠ ${e instanceof Error ? e.message : String(e)} — agent server unreachable?` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Drawer header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <HydraLogo className="h-5 w-5 text-accent shrink-0" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/50 truncate">ox-alpha · self-hosted</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(['plan', 'build'] as const).map((mo) => (
            <button
              key={mo}
              onClick={() => {
                setMode(mo);
                localStorage.setItem('hydra-agent-mode', mo);
              }}
              aria-pressed={mode === mo}
              title={mo === 'plan' ? 'Read-only analysis' : 'Can edit files — changes go live instantly'}
              className={`h-6 px-2.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-colors ${
                mode === mo
                  ? 'border border-emerald-500/50 bg-emerald-500/10 text-accent'
                  : 'border border-white/10 text-white/40 hover:text-white'
              }`}
            >
              {mo}
            </button>
          ))}
          {sessionId && (
            <button
              onClick={() => {
                localStorage.removeItem(SESSION_KEY);
                setSessionId(null);
                setMessages([]);
              }}
              className="h-6 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-white"
              title="New session"
            >
              ↺
            </button>
          )}
        </div>
      </div>

      {/* Model picker */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] shrink-0 flex items-center gap-2">
        <span className="text-[9px] font-medium uppercase tracking-widest text-white/30 shrink-0">Zen free models</span>
        <select
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            localStorage.setItem('hydra-agent-model', e.target.value);
          }}
          className="flex-1 min-w-0 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono px-2 cursor-pointer"
          aria-label="Agent model"
        >
          {models.length === 0 && <option value={model}>{model}</option>}
          {models.map((m) => (
            <option key={m} value={m}>
              {m === 'x-preview-f-free' ? `${m} — ox-alpha` : m}
            </option>
          ))}
        </select>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 opacity-60 px-4">
            <HydraLogo className="h-7 w-7 text-accent/70" />
            <p className="text-xs text-white/50 leading-relaxed">
              Ask for changes while browsing any panel — edits land on the site live.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[92%] rounded-xl px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap border ${
                m.role === 'user'
                  ? 'bg-emerald-950/30 border-emerald-500/25 text-white'
                  : 'bg-white/[0.03] border-white/[0.07] text-white/75'
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-xl px-3.5 py-2 bg-white/[0.03] border border-white/[0.07] flex items-center gap-1">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1 w-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-white/[0.06] px-4 py-3 shrink-0 w-full flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={mode === 'build' ? 'Describe a change…' : 'Ask about the codebase…'}
          className={`${input} resize-none max-h-28 text-xs min-h-[40px] flex-1`}
          aria-label="Message the agent"
        />
        <button
          onClick={() => void send()}
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="h-10 w-10 shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-accent hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send size={14} />
        </button>
      </div>
    </>
  );
}

/* ── Add project form ────────────────────────────────────────────────── */

function AddProjectForm({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const posterRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const f = new FormData(e.currentTarget);
      const id = `p-${Date.now().toString(36)}`;
      let thumbnail = '';
      let videoUrl = '';
      const poster = posterRef.current?.files?.[0];
      if (poster) thumbnail = await upload(poster, `${id}/poster${extOf(poster.name)}`);
      const video = videoRef.current?.files?.[0];
      if (video) videoUrl = await upload(video, `${id}/video${extOf(video.name)}`);

      const project: Project = {
        id,
        title: String(f.get('title') || ''),
        client: String(f.get('client') || ''),
        category: (String(f.get('category')) as Project['category']) || 'video',
        tag: String(f.get('tag') || ''),
        year: String(f.get('year') || new Date().getFullYear()),
        thumbnail,
        videoUrl: videoUrl || undefined,
        description: String(f.get('description') || ''),
        softwareStack: String(f.get('stack') || '').split(',').map((s) => s.trim()).filter(Boolean),
        clientBrief: String(f.get('brief') || ''),
        deliverables: String(f.get('deliverables') || '').split(',').map((s) => s.trim()).filter(Boolean),
      };
      const list = await api<Project[]>('/projects');
      list.push(project);
      await api('/projects', { method: 'PUT', body: JSON.stringify(list) });
      e.currentTarget.reset();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onDone();
    } catch {
      /* surfaced by upload() */
    }
  };

  return (
    <form onSubmit={submit} className="glass-card rounded-2xl p-5 space-y-4">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between w-full" aria-expanded={open}>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">New Case Study</span>
        <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field name="title" label="Title *" required placeholder="NEON GENESIS — Brand Film" />
            <Field name="client" label="Client" placeholder="Real client or Spec / Concept Project" />
            <Field name="year" label="Year" placeholder="2026" />
            <Field name="tag" label="Tag" placeholder="Direction & Edit" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={fieldLabel} htmlFor="f-category">
                Category
              </label>
              <select id="f-category" name="category" className={`${input} cursor-pointer`} defaultValue="video">
                <option value="video">Video</option>
                <option value="motion">Motion</option>
                <option value="direction">Direction</option>
              </select>
            </div>
            <FileField inputRef={posterRef} label="Poster image" accept="image/*" />
            <FileField inputRef={videoRef} label="Video (optional)" accept="video/mp4,video/webm" />
          </div>
          <Field name="description" label="Description" placeholder="One or two sentences about the piece." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field name="stack" label="Toolchain (comma-separated)" placeholder="Premiere Pro, After Effects" />
            <Field name="deliverables" label="Deliverables (comma-separated)" placeholder="4K Master, Social Cutdowns" />
          </div>
          <Field name="brief" label="Client brief" placeholder="What was asked of you." />

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="h-9 px-5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 text-[10px] font-semibold uppercase tracking-wider text-white inline-flex items-center gap-2 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
            >
              <Upload size={12} /> Publish to Site
            </button>
            {saved && (
              <span className="text-xs text-accent inline-flex items-center gap-1">
                <Check size={12} /> Live now
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/25">Real work only — files land in public/work/&lt;id&gt;/ and publish immediately.</p>
        </motion.div>
      )}
    </form>
  );
}

/* ── Atoms ───────────────────────────────────────────────────────────── */

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label: lbl, ...rest } = props;
  return (
    <div>
      <label className={fieldLabel} htmlFor={`f-${rest.name}`}>
        {lbl}
      </label>
      <input id={`f-${rest.name}`} {...rest} className={input} />
    </div>
  );
}

function FileField({ label: lbl, inputRef, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; inputRef?: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div>
      <span className={fieldLabel}>{lbl}</span>
      <input
        {...rest}
        ref={inputRef}
        type="file"
        className="block w-full text-[11px] text-white/40 file:h-9 file:mr-3 file:px-3 file:rounded-lg file:border file:border-emerald-500/30 file:bg-emerald-950/30 file:text-white/80 file:text-[10px] file:uppercase file:tracking-wider file:cursor-pointer cursor-pointer"
      />
    </div>
  );
}

function SwitchRow({ label: lbl, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <span className="block text-sm font-medium">{lbl}</span>
        <span className="block text-[11px] text-white/30">{hint}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange, small = false }: { checked: boolean; onChange: (v: boolean) => void; small?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative rounded-full transition-colors duration-200 ${small ? 'h-5 w-9' : 'h-6 w-11'} ${checked ? 'bg-accent/80' : 'bg-white/15'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ width: small ? 14 : 18, height: small ? 14 : 18, left: checked ? `calc(100% - ${small ? 18 : 22}px)` : 4 }}
      />
    </button>
  );
}

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '.bin';
}

async function upload(file: File, relPath: string): Promise<string> {
  const parts = relPath.split('/');
  const name = safeName(parts.pop()!);
  const d = parts.map(safeName).join('/');
  const res = await fetch(`/api/upload?dir=${encodeURIComponent(d)}&name=${encodeURIComponent(name)}`, {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'upload failed');
  return json.path;
}

function safeName(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]/g, '_');
}
