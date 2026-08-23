import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, ExternalLink, RefreshCw, Check } from 'lucide-react';
import { HydraLogo } from '../components/HydraLogo';

/**
 * HYDRA Studio Console (/dashboard).
 *
 * Local-only control surface for the always-on site: upload work into
 * public/work/, edit the project list, and shape the atmosphere engine
 * (layer opacity / blend / enabled, master + film grain). Every change is
 * written through the local API into src/data/*.json — Vite hot-reloads the
 * site in real time. Visual language mirrors the site: same palette, glass
 * surfaces, editorial labels.
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
  'haze': 'Haze',
  'env-secondary': 'Blue Wash',
  'env-primary': 'Volumetric Green',
  'dust': 'Dust Field',
  'wisp': 'Atmospheric Wisp',
  'geometry-primary': 'Geometry (Work)',
  'env-fragment': 'Signature Fragment (Work)',
};

const BLENDS = ['screen', 'normal', 'overlay', 'soft-light', 'luminosity'];

const input =
  'w-full bg-white/[0.04] border border-white/[0.08] focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/25 backdrop-blur-md';
const label = 'block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1.5 font-semibold';
const btnGhost =
  'h-9 px-4 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-accent/40 transition-colors inline-flex items-center gap-1.5';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, init);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function Dashboard() {
  const [tab, setTab] = useState<'content' | 'atmosphere'>('content');
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    api<{ ok: boolean }>('/health').then(() => setAlive(true)).catch(() => setAlive(false));
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-white relative overflow-hidden" style={{ colorScheme: 'dark' }}>
      {/* Clean canvas glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-accent/[0.05] blur-[140px]" />
      </div>

      {/* Header lockup */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 h-16 border-b border-white/[0.06] bg-canvas/60 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3">
          <HydraLogo className="h-7 w-7 text-accent hydra-mark-glow" />
          <span className="font-display font-bold tracking-[-0.02em] text-sm uppercase">HYDRA SAMO</span>
          <span className="label-cinematic hidden sm:inline ml-2">Studio Console</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`h-2 w-2 rounded-full ${alive ? 'bg-accent shadow-[0_0_8px_rgba(0,168,107,0.8)]' : 'bg-red-500'}`}
            title={alive ? 'Local server running' : 'Server unreachable'}
          />
          <a href="/" target="_blank" rel="noreferrer" className={btnGhost}>
            Open Site <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* Tabs */}
      <nav className="relative z-10 px-6 sm:px-10 pt-8 flex gap-2">
        {(['content', 'atmosphere'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`relative h-9 px-5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
              tab === t ? 'text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            {tab === t && (
              <motion.span
                layoutId="tabThumb"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
            <span className="relative z-10">{t}</span>
          </button>
        ))}
      </nav>

      <main className="relative z-10 px-6 sm:px-10 py-8 max-w-4xl mx-auto">
        {tab === 'content' ? <ContentTab /> : <AtmosphereTab />}
      </main>
    </div>
  );
}

/* ── Content ─────────────────────────────────────────────────────────── */

function ContentTab() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    api<Project[]>('/projects').then(setProjects).catch(() => setError('Could not reach local API'));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (id: string) => {
    if (!projects) return;
    await api('/projects', { method: 'PUT', body: JSON.stringify(projects.filter((p) => p.id !== id)) });
    refresh();
  };

  return (
    <section className="space-y-6" aria-label="Content">
      <AddProjectForm onDone={() => { refresh(); }} setBusy={setBusy} setError={setError} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <span className="label-cinematic">Published Work ({projects?.length ?? '…'})</span>
          <button onClick={refresh} className={btnGhost} title="Refresh">
            <RefreshCw size={12} />
          </button>
        </div>
        {projects === null ? (
          <p className="px-5 py-6 text-sm text-white/30">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30">
            No published work yet. Add a real project above — it appears on the site instantly.
          </p>
        ) : (
          <ul>
            {projects.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0">
                <span className="w-14 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden shrink-0">
                  {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">{p.title}</span>
                  <span className="block text-[11px] text-white/35 truncate">{p.client} · {p.year} · {p.tag}</span>
                </span>
                <button onClick={() => remove(p.id)} className="h-8 w-8 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors" aria-label={`Delete ${p.title}`}>
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {busy && <p className="text-xs text-accent animate-pulse">Working…</p>}
    </section>
  );
}

function AddProjectForm({
  onDone,
  setBusy,
  setError,
}: {
  onDone: () => void;
  setBusy: (b: boolean) => void;
  setError: (e: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const posterRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      const id = `p-${Date.now().toString(36)}`;
      let thumbnail = '';
      let videoUrl = '';

      const poster = posterRef.current?.files?.[0];
      if (poster) {
        thumbnail = await upload(poster, `${id}/poster${extOf(poster.name)}`);
      }
      const video = videoRef.current?.files?.[0];
      if (video) {
        videoUrl = await upload(video, `${id}/video${extOf(video.name)}`);
      }

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
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between w-full group" aria-expanded={open}>
        <span className="label-cinematic">Upload New Project</span>
        <span className={`text-accent transition-transform duration-300 ${open ? 'rotate-45' : ''} text-lg leading-none`}>+</span>
      </button>

      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field name="title" label="Title *" required placeholder="NEON GENESIS — Brand Film" />
            <Field name="client" label="Client" placeholder="Aether Studios or Spec / Concept Project" />
            <Field name="year" label="Year" placeholder="2026" />
            <Field name="tag" label="Tag" placeholder="Direction & Edit" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={label} htmlFor="f-category">Category</label>
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
            <button type="submit" className="h-10 px-6 rounded-full bg-accent text-black text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-accent-soft transition-colors">
              <Upload size={13} /> Publish to Site
            </button>
            {saved && <span className="text-xs text-accent inline-flex items-center gap-1"><Check size={12} /> Live now</span>}
          </div>
          <p className="text-[11px] text-white/25 leading-relaxed">
            Real work only — files land in public/work/&lt;id&gt;/ and the project list updates the site immediately.
          </p>
        </motion.div>
      )}
    </form>
  );
}

/* ── Atmosphere ──────────────────────────────────────────────────────── */

function AtmosphereTab() {
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

  if (!cfg) return <p className="text-sm text-white/30">Loading atmosphere…</p>;

  const patchLayer = (id: string, patch: Partial<Atmosphere['layers'][string]>) =>
    save({ ...cfg, layers: { ...cfg.layers, [id]: { ...cfg.layers[id], ...patch } } });

  return (
    <section className="space-y-6" aria-label="Atmosphere">
      {/* Master switches */}
      <div className="glass-card rounded-2xl divide-y divide-white/[0.06]">
        <SwitchRow label="Atmosphere Engine" hint="All video layers behind the content" checked={cfg.master} onChange={(v) => save({ ...cfg, master: v })} />
        <SwitchRow label="Film Grain" hint="Full-screen texture overlay" checked={cfg.grain} onChange={(v) => save({ ...cfg, grain: v })} />
      </div>

      {/* Layers */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <span className="label-cinematic">Layers</span>
          {justSaved && <span className="text-[10px] uppercase tracking-widest text-accent inline-flex items-center gap-1"><Check size={11} /> Synced live</span>}
        </div>
        <ul>
          {Object.keys(LAYER_LABELS).map((id) => {
            const l = cfg.layers[id] ?? { enabled: true, opacity: 1, blend: 'screen' };
            return (
              <li key={id} className="px-5 py-4 border-b border-white/[0.04] last:border-0 grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_130px_120px] items-center gap-x-4 gap-y-2">
                <Toggle checked={l.enabled !== false} onChange={(v) => patchLayer(id, { enabled: v })} small />
                <div className="min-w-0">
                  <span className={`block text-sm font-medium ${l.enabled === false ? 'text-white/25 line-through' : ''}`}>{LAYER_LABELS[id]}</span>
                  <code className="block text-[10px] text-white/25">{id}</code>
                </div>
                <label className="flex items-center gap-2 col-start-2 sm:col-start-auto">
                  <input
                    type="range" min={0} max={1} step={0.05} value={l.opacity}
                    onChange={(e) => patchLayer(id, { opacity: Number(e.target.value) })}
                    className="w-full accent-[#00A86B]"
                    aria-label={`${LAYER_LABELS[id]} opacity`}
                  />
                  <span className="text-[10px] tabular-nums text-white/40 w-8">{Math.round(l.opacity * 100)}%</span>
                </label>
                <select
                  value={l.blend} onChange={(e) => patchLayer(id, { blend: e.target.value })}
                  className="h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/70 px-2 cursor-pointer"
                  aria-label={`${LAYER_LABELS[id]} blend mode`}
                >
                  {BLENDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-[11px] text-white/25">Changes apply to the open site windows in real time.</p>
    </section>
  );
}

/* ── Atoms ───────────────────────────────────────────────────────────── */

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label: lbl, ...rest } = props;
  return (
    <div>
      <label className={label} htmlFor={`f-${rest.name}`}>{lbl}</label>
      <input id={`f-${rest.name}`} {...rest} className={input} />
    </div>
  );
}

function FileField({ label: lbl, inputRef, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; inputRef?: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div>
      <span className={label}>{lbl}</span>
      <input {...rest} ref={inputRef} type="file" className="block w-full text-[11px] text-white/40 file:h-9 file:mr-3 file:px-3 file:rounded-full file:border file:border-accent/30 file:bg-transparent file:text-accent file:text-[10px] file:uppercase file:tracking-widest file:cursor-pointer cursor-pointer" />
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
      className={`relative rounded-full transition-colors duration-200 ${small ? 'h-5 w-9' : 'h-6 w-11'} ${checked ? 'bg-accent' : 'bg-white/15'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white ${small ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'} ${checked ? (small ? 'left-[calc(100%-1rem)]' : 'left-[calc(100%-1.375rem)]') : 'left-1'}`}
        style={{ width: small ? 14 : 18, height: small ? 14 : 18 }}
      />
    </button>
  );
}

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '.bin';
}

async function upload(file: File, relPath: string): Promise<string> {
  const dir = relPath.split('/')[0] === 'work' ? relPath : `work/${relPath}`;
  const parts = dir.split('/');
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
