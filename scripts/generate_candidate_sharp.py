#!/usr/bin/env python3
"""Generate Sharp (Apple SHARP) candidate PLYs and convert the best to GLB.

Uses the free CPU Space rajaai1/Apple-Sharp-Image-to-3D-View-Synthesis.
Does NOT touch public/models/avatar.glb.
"""

import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

from gradio_client import Client, handle_file

ROOT = Path(__file__).resolve().parents[1]
CROPPED = ROOT / "assets" / "avatar-ref" / "cropped"
CAND = ROOT / "assets" / "avatar-ref" / "candidates" / "sharp"
LOG_PATH = ROOT / "assets" / "avatar-ref" / "generation_sharp.log"
SPACE = "rajaai1/Apple-Sharp-Image-to-3D-View-Synthesis"
ENDPOINT = "/run_sharp"

INPUTS = [
    ("front", CROPPED / "front.png"),
    ("portrait_clean", CROPPED / "portrait_clean.png"),
]

TRAJECTORY = "rotate_forward"
OUTPUT_LONG_SIDE = 512
NUM_FRAMES = 60
FPS = 30
RENDER_VIDEO = True
CALL_TIMEOUT = 300

BLENDER = shutil.which("blender") or "/home/hydrasamo/.local/bin/blender"


def log(message: str) -> None:
    stamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    line = f"[{stamp}] {message}"
    print(line, flush=True)
    with LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def collect_files(value, found: list) -> None:
    if isinstance(value, (list, tuple)):
        for item in value:
            collect_files(item, found)
    elif isinstance(value, dict):
        for key in ("path", "value", "name", "url", "file"):
            if key in value:
                collect_files(value[key], found)
        for item in value.values():
            collect_files(item, found)
    elif isinstance(value, str):
        found.append(value)


def first_ply(result) -> str | None:
    found = []
    collect_files(result, found)
    for item in found:
        if isinstance(item, str) and item.lower().endswith(".ply"):
            return item
    return None


def ply_vertex_count(path: Path) -> int:
    count = 0
    with path.open("rb") as handle:
        header = b""
        while True:
            chunk = handle.read(4096)
            if not chunk:
                break
            header += chunk
            if b"end_header" in header:
                break
        text = header.split(b"end_header", 1)[0].decode("utf-8", errors="replace")
    match = re.search(r"element\s+vertex\s+(\d+)", text)
    if match:
        count = int(match.group(1))
    return count


def inspect_api(client: Client) -> dict:
    info = client._get_api_info()
    endpoints = info.get("named_endpoints", {})
    ep = endpoints.get(ENDPOINT, {})
    params = ep.get("parameters", [])
    returns = ep.get("returns", [])
    log(f"Space: {SPACE}")
    log(f"Endpoint {ENDPOINT}")
    log("Parameters:")
    for p in params:
        name = p.get("parameter_name")
        comp = p.get("component")
        default = p.get("parameter_default")
        enum = None
        t = p.get("type", {})
        if isinstance(t, dict):
            enum = t.get("enum")
        log(f"  - {name}: component={comp} default={default!r} choices={enum}")
    log("Returns:")
    for r in returns:
        log(f"  - {r.get('label')}: component={r.get('component')}")
    # valid choices for dropdowns
    traj_choices = None
    res_choices = None
    for p in params:
        if p.get("parameter_name") == "trajectory_type":
            traj_choices = p.get("type", {}).get("enum")
        if p.get("parameter_name") == "output_long_side":
            res_choices = p.get("type", {}).get("enum")
    log(f"trajectory_type valid choices: {traj_choices}")
    log(f"output_long_side valid choices: {res_choices}")
    return info


def main() -> int:
    CAND.mkdir(parents=True, exist_ok=True)
    # fresh log
    if LOG_PATH.exists():
        LOG_PATH.unlink()
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.touch()

    log("=== Sharp candidate generation start ===")
    log(f"Python: {sys.version.split()[0]}")
    log(f"Blender: {BLENDER}")

    client = Client(SPACE)
    inspect_api(client)

    generated = []  # (label, ply_path, vertices)
    for label, src in INPUTS:
        if not src.exists():
            log(f"INPUT MISSING: {src}")
            continue
        log(f"--- Generating from {label}: {src} ---")
        log(
            f"Call args: trajectory_type={TRAJECTORY!r}, "
            f"output_long_side={OUTPUT_LONG_SIDE!r}, num_frames={NUM_FRAMES}, "
            f"fps={FPS}, render_video={RENDER_VIDEO}"
        )
        t0 = time.time()
        try:
            result = client.predict(
                image_path=handle_file(str(src)),
                trajectory_type=TRAJECTORY,
                output_long_side=OUTPUT_LONG_SIDE,
                num_frames=NUM_FRAMES,
                fps=FPS,
                render_video=RENDER_VIDEO,
                api_name=ENDPOINT,
            )
            elapsed = round(time.time() - t0, 2)
            log(f"Raw result: {result}")
            log(f"Elapsed: {elapsed}s")
            ply_src = first_ply(result)
            if not ply_src:
                log(f"ERROR: no PLY in result for {label}")
                continue
            log(f"Returned PLY: {ply_src}")
            if not Path(ply_src).exists():
                log(f"ERROR: returned PLY path does not exist: {ply_src}")
                continue
            dest = CAND / f"{label}.ply"
            shutil.copyfile(ply_src, dest)
            verts = ply_vertex_count(dest)
            size = dest.stat().st_size
            log(f"Saved PLY: {dest} ({size} bytes, vertices={verts})")
            generated.append((label, dest, verts))
        except Exception as exc:
            elapsed = round(time.time() - t0, 2)
            log(f"ERROR generating {label} after {elapsed}s: {exc!r}")

    if not generated:
        log("FATAL: no PLYs generated")
        return 1

    # choose best by vertex count, tie -> front first (inputs order)
    best = max(generated, key=lambda item: item[2])
    # stable tie-break: prefer earlier in INPUTS order
    best_verts = best[2]
    candidates_top = [g for g in generated if g[2] == best_verts]
    if len(candidates_top) > 1:
        order = [name for name, _ in INPUTS]
        candidates_top.sort(key=lambda g: order.index(g[0]) if g[0] in order else 99)
        best = candidates_top[0]

    best_label, best_ply, best_verts = best
    log(f"Best PLY: {best_label} -> {best_ply} (vertices={best_verts})")
    for label, ply, verts in generated:
        log(f"  candidate {label}: {ply} vertices={verts} size={ply.stat().st_size}")

    # convert via blender
    sharp_glb = CAND / "sharp.glb"
    conv_script = CAND / "convert_ply_to_glb.py"
    conv_code = '''import bpy, sys, os
inp = sys.argv[-2]
outp = sys.argv[-1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.wm.ply_import(filepath=inp)
bpy.ops.export_scene.gltf(filepath=outp, export_format='GLB')
print("EXPORTED", os.path.getsize(outp))
'''
    conv_script.write_text(conv_code, encoding="utf-8")

    log(f"Converting {best_ply} -> {sharp_glb} via Blender")
    t0 = time.time()
    try:
        proc = subprocess.run(
            [BLENDER, "--background", "--python", str(conv_script), "--", str(best_ply), str(sharp_glb)],
            capture_output=True,
            text=True,
            timeout=300,
        )
        elapsed = round(time.time() - t0, 2)
        log(f"Blender returncode={proc.returncode} elapsed={elapsed}s")
        if proc.stdout:
            log("Blender stdout (tail):")
            for line in proc.stdout.strip().splitlines()[-20:]:
                log(f"  {line}")
        if proc.stderr:
            log("Blender stderr (tail):")
            for line in proc.stderr.strip().splitlines()[-20:]:
                log(f"  {line}")
    except Exception as exc:
        log(f"Blender conversion exception: {exc!r}")
        return 1

    if not sharp_glb.exists():
        log("FATAL: sharp.glb not created")
        return 1

    data = sharp_glb.read_bytes()
    magic = data[:4]
    size = len(data)
    log(f"sharp.glb size={size} magic={magic!r}")
    if magic != b"glTF":
        log("FATAL: bad GLB magic bytes")
        return 1

    # self-check
    assert sharp_glb.exists(), "sharp.glb missing"
    assert magic == b"glTF", "bad magic"
    assert size > 1000, "glb too small"
    for label, ply, verts in generated:
        assert ply.exists(), f"{ply} missing"
        assert ply.stat().st_size > 0, f"{ply} empty"
    log("Self-check: PASS")

    log("=== Summary ===")
    for label, ply, verts in generated:
        log(f"  {label}.ply: {ply} size={ply.stat().st_size} vertices={verts}")
    log(f"  sharp.glb: {sharp_glb} size={size} magic=glTF")
    log("=== Done ===")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
