#!/usr/bin/env python3
"""Generate a candidate avatar mesh via bobthebuilderinternational/image-to-3d-deepsdf.

Uses all 8 multi-view slots: four distinct body views repeated in the same order.
Saves OBJ + converted GLB under assets/avatar-ref/candidates/deepsdf/.
Does NOT touch production GLBs.
"""

import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

import requests
from gradio_client import Client, handle_file

ROOT = Path(__file__).resolve().parents[1]
CROPPED = ROOT / "assets" / "avatar-ref" / "cropped"
CAND_DIR = ROOT / "assets" / "avatar-ref" / "candidates" / "deepsdf"
LOG_PATH = ROOT / "assets" / "avatar-ref" / "generation_deepsdf.log"

FRONT = CROPPED / "front.png"
SIDE = CROPPED / "side.png"
THREE_Q = CROPPED / "three_quarter.png"
BACK = CROPPED / "back.png"
PORTRAIT = CROPPED / "portrait_clean.png"

SPACE = "bobthebuilderinternational/image-to-3d-deepsdf"

# Four distinct body views, repeated to fill the 8 required slots.
VIEW_SLOTS = [
    (FRONT, "Front"),
    (SIDE, "Right side"),          # side.png is assumed to be the right profile
    (THREE_Q, "Three-quarter front"),
    (BACK, "Back"),
    (FRONT, "Front"),
    (SIDE, "Right side"),
    (THREE_Q, "Three-quarter front"),
    (BACK, "Back"),
]

TOKEN = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")


def log(message: str) -> None:
    stamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    line = f"[{stamp}] {message}"
    print(line, flush=True)
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
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


def first_file(value):
    found = []
    collect_files(value, found)
    for item in found:
        if isinstance(item, str):
            return item
    return None


def fetch_runtime(space: str):
    try:
        response = requests.get(f"https://huggingface.co/api/spaces/{space}", timeout=20)
        if response.status_code != 200:
            return None, None, f"HTTP {response.status_code}"
        data = response.json()
        runtime = data.get("runtime", {}) or {}
        hardware = (runtime.get("hardware") or data.get("hardware") or {}).get("current")
        stage = runtime.get("stage") or data.get("stage")
        return stage, hardware, None
    except Exception as error:
        return None, None, str(error)


def main() -> None:
    CAND_DIR.mkdir(parents=True, exist_ok=True)
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text("", encoding="utf-8")
    log("Starting DeepSDF candidate generation")
    log(f"HF token present: {bool(TOKEN)}")
    log(f"Space: {SPACE}")
    log("View slots (8): " + ", ".join(f"{p.name}:{v}" for p, v in VIEW_SLOTS))
    log("side.png assumed to be right profile; portrait_clean.png not used (4 body views repeated).")

    # Runtime check
    stage, hardware, rerr = fetch_runtime(SPACE)
    log(f"runtime stage={stage} hardware={hardware} ({rerr})")

    # Client + API inspection
    try:
        client = Client(SPACE, token=TOKEN)
    except Exception as error:
        log(f"client creation failed: {error}")
        return
    try:
        import contextlib
        import io
        _buf = io.StringIO()
        with contextlib.redirect_stdout(_buf):
            client.view_api()
        view_api_text = _buf.getvalue()
        log("VIEW_API_OUTPUT_BEGIN")
        for line in view_api_text.splitlines():
            log(line)
        log("VIEW_API_OUTPUT_END")
    except Exception as error:
        log(f"view_api failed: {error}")

    try:
        info = client._get_api_info()
    except Exception as error:
        log(f"schema discovery failed: {error}")
        return
    schema = info.get("named_endpoints", {}) if isinstance(info, dict) else {}
    # log compact schema
    for name, ep in schema.items():
        params = [(p.get("parameter_name"), p.get("component")) for p in ep.get("parameters", [])]
        returns = [(r.get("label"), r.get("component")) for r in ep.get("returns", [])]
        log(f"  {name}: params={params} returns={returns}")

    gen_ep = schema.get("/generate_3d")
    if not gen_ep:
        log("ERROR: /generate_3d not found")
        return

    # Extract dropdown choices dynamically
    dropdown_choices = None
    for p in gen_ep.get("parameters", []):
        if p.get("component") == "Dropdown":
            t = p.get("type", {})
            if isinstance(t, dict) and "enum" in t:
                dropdown_choices = t["enum"]
                break
    log(f"Dropdown choices (param_1): {dropdown_choices}")

    # Build args
    args = []
    for img_path, view_label in VIEW_SLOTS:
        if not img_path.exists():
            log(f"MISSING INPUT: {img_path}")
            return
        args.append(handle_file(str(img_path)))
        args.append(view_label)
    log("Call args (image->view): " + ", ".join(f"{p.name}->{v}" for p, v in VIEW_SLOTS))

    # Call
    t0 = time.time()
    try:
        job = client.submit(*args, api_name="/generate_3d")
        result = job.result(timeout=600)
    except Exception as error:
        log(f"/generate_3d ERROR: {error}")
        return
    elapsed = time.time() - t0
    log(f"/generate_3d result: {str(result)[:2000]}")
    log(f"elapsed: {elapsed:.1f}s")

    # Extract mesh path + status
    mesh_path = None
    status_text = None
    if isinstance(result, (list, tuple)):
        if len(result) > 0:
            mesh_path = first_file(result[0])
        if len(result) > 1:
            status_text = result[1]
    else:
        mesh_path = first_file(result)
    log(f"mesh_path={mesh_path}")
    log(f"status={status_text}")

    if not mesh_path:
        log("ERROR: no mesh returned")
        return

    # Save OBJ to candidate dir
    src = Path(mesh_path)
    if mesh_path.startswith("http://") or mesh_path.startswith("https://"):
        try:
            import urllib.request
            dst_tmp = CAND_DIR / src.name
            urllib.request.urlretrieve(mesh_path, dst_tmp)
            src = dst_tmp
        except Exception as error:
            log(f"download failed: {error}")
            return
    if not src.exists():
        log(f"mesh file not found locally: {src}")
        return

    obj_dest = CAND_DIR / "predicted.obj"
    if src.suffix.lower() != ".obj":
        # copy as-is with original name too
        shutil.copyfile(src, CAND_DIR / src.name)
    shutil.copyfile(src, obj_dest)
    log(f"saved OBJ: {obj_dest} ({obj_dest.stat().st_size} bytes)")

    # Convert OBJ -> GLB via Blender headless
    conv_script = CAND_DIR / "convert_obj_to_glb.py"
    conv_script.write_text(
        "import bpy, sys, argparse\n"
        "parser = argparse.ArgumentParser()\n"
        "parser.add_argument('--input', required=True)\n"
        "parser.add_argument('--output', required=True)\n"
        "args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])\n"
        "bpy.ops.wm.read_factory_settings(use_empty=True)\n"
        "bpy.ops.wm.obj_import(filepath=args.input)\n"
        "bpy.ops.export_scene.gltf(filepath=args.output, export_format='GLB')\n"
        "print('CONVERTED', args.output)\n",
        encoding="utf-8",
    )
    glb_dest = CAND_DIR / "candidate.glb"
    t1 = time.time()
    try:
        proc = subprocess.run(
            ["blender", "--background", "--python", str(conv_script), "--",
             "--input", str(obj_dest), "--output", str(glb_dest)],
            capture_output=True, text=True, timeout=300,
        )
        log(f"blender returncode={proc.returncode}")
        log(f"blender stdout: {proc.stdout[-1500:]}")
        if proc.stderr:
            log(f"blender stderr: {proc.stderr[-1500:]}")
    except Exception as error:
        log(f"blender conversion failed: {error}")
        return
    conv_elapsed = time.time() - t1
    log(f"conversion elapsed: {conv_elapsed:.1f}s")

    # Verify GLB
    if glb_dest.exists():
        data = glb_dest.read_bytes()
        magic = data[:4]
        log(f"GLB path: {glb_dest}")
        log(f"GLB size: {glb_dest.stat().st_size} bytes")
        log(f"GLB magic: {magic!r} (expected b'glTF')")
        if magic != b"glTF":
            log("WARNING: GLB magic bytes invalid")
        else:
            log("GLB magic bytes OK")
    else:
        log("ERROR: GLB not produced")

    log("DeepSDF candidate generation finished")


if __name__ == "__main__":
    main()
