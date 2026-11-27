#!/usr/bin/env python3
"""Generate authenticated (textured/PBR) avatar candidates via HF Spaces."""
import contextlib, io, json, shutil, struct, time, urllib.request
from pathlib import Path
import requests
from gradio_client import Client, handle_file

ROOT = Path(__file__).resolve().parents[1]
CROPPED = ROOT / "assets" / "avatar-ref" / "cropped"
CAND_DIR = ROOT / "assets" / "avatar-ref" / "candidates" / "authenticated"
LOG_PATH = ROOT / "assets" / "avatar-ref" / "generation_auth.log"
TRELLIS_SPACE = "microsoft/TRELLIS.2"
HUNYUAN_SPACE = "tencent/Hunyuan3D-2.1"
TRELLIS_INPUTS = [
    ("portrait", CROPPED / "portrait_clean.png", CAND_DIR / "trellis_portrait.glb"),
    ("front", CROPPED / "front.png", CAND_DIR / "trellis_front.glb"),
]
HUNYUAN_OUTPUT = CAND_DIR / "hunyuan.glb"
CALL_TIMEOUT = 600

def log(message):
    stamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    line = f"[{stamp}] {message}"
    print(line, flush=True)
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as h:
        h.write(line + "\n")

def collect_files(value, found):
    if isinstance(value, (list, tuple)):
        for item in value: collect_files(item, found)
    elif isinstance(value, dict):
        for key in ("path", "value", "name", "url", "file"):
            if key in value and value[key] is not None:
                collect_files(value[key], found)
        for item in value.values(): collect_files(item, found)
    elif isinstance(value, str):
        found.append(value)

def first_file_with_ext(value, exts):
    found = []
    collect_files(value, found)
    for item in found:
        if isinstance(item, str) and any(item.lower().endswith(e) for e in exts):
            return item
    for item in found:
        if isinstance(item, str):
            return item
    return None

def fetch_runtime(space):
    try:
        response = requests.get(f"https://huggingface.co/api/spaces/{space}", timeout=20)
        if response.status_code != 200:
            return None, None, f"HTTP {response.status_code}"
        data = response.json()
        runtime = data.get("runtime", {}) or {}
        hardware = runtime.get("hardware") or data.get("hardware") or {}
        if isinstance(hardware, dict):
            hardware = hardware.get("current") or hardware.get("requested")
        stage = runtime.get("stage") or data.get("stage")
        return stage, hardware, None
    except Exception as error:
        return None, None, str(error)

def parse_glb(path):
    info = {"magic_ok": False, "size": 0, "version": None, "textures": 0,
            "images": 0, "materials": 0, "meshes": 0, "image_embedded": False, "error": None}
    try:
        data = path.read_bytes()
        info["size"] = len(data)
        if len(data) < 12 or data[:4] != b"glTF":
            info["error"] = "bad magic"
            return info
        info["magic_ok"] = True
        info["version"] = struct.unpack("<I", data[4:8])[0]
        off = 12
        json_chunk = None
        while off < len(data):
            if off + 8 > len(data): break
            chunk_len = struct.unpack("<I", data[off:off+4])[0]
            chunk_type = struct.unpack("<I", data[off+4:off+8])[0]
            chunk_data = data[off+8:off+8+chunk_len]
            if chunk_type == 0x4E4F534A:
                json_chunk = chunk_data
            off += 8 + chunk_len
            if chunk_len % 4:
                off += 4 - (chunk_len % 4)
        if json_chunk is None:
            info["error"] = "no json chunk"
            return info
        g = json.loads(json_chunk.decode("utf-8", errors="replace"))
        info["textures"] = len(g.get("textures", []))
        info["images"] = len(g.get("images", []))
        info["materials"] = len(g.get("materials", []))
        info["meshes"] = len(g.get("meshes", []))
        for im in g.get("images", []):
            if "bufferView" in im:
                info["image_embedded"] = True
    except Exception as error:
        info["error"] = str(error)
    return info

def copy_result(src, dst):
    src_path = Path(src)
    if src.startswith("http://") or src.startswith("https://"):
        tmp = dst.parent / (dst.stem + "_download" + (src_path.suffix or ".glb"))
        urllib.request.urlretrieve(src, tmp)
        src_path = tmp
    if not src_path.exists():
        raise FileNotFoundError(f"source not found: {src}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src_path, dst)
    return dst

def inspect_client(client, space):
    log(f"Space: {space}")
    try:
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            client.view_api()
        view_text = buf.getvalue()
        log("VIEW_API_BEGIN")
        for line in view_text.splitlines():
            log(line)
        log("VIEW_API_END")
    except Exception as error:
        log(f"view_api failed: {error}")
    try:
        info = client._get_api_info()
        schema = info.get("named_endpoints", {}) if isinstance(info, dict) else {}
        log("SCHEMA_BEGIN")
        for name, ep in schema.items():
            params = [(p.get("parameter_name"), p.get("component"), p.get("parameter_default"))
                      for p in ep.get("parameters", [])]
            returns = [(r.get("label"), r.get("component")) for r in ep.get("returns", [])]
            log(f"  {name}: params={params} returns={returns}")
            for p in ep.get("parameters", []):
                t = p.get("type", {})
                if isinstance(t, dict) and t.get("enum"):
                    log(f"     {p.get('parameter_name')} enum={t.get('enum')}")
        log("SCHEMA_END")
    except Exception as error:
        log(f"schema discovery failed: {error}")

def run_trellis():
    log("=" * 80)
    log("PRIORITY 1: microsoft/TRELLIS.2")
    stage, hardware, rerr = fetch_runtime(TRELLIS_SPACE)
    log(f"runtime stage={stage} hardware={hardware} ({rerr})")
    successes = []
    try:
        client = Client(TRELLIS_SPACE, token=True, httpx_kwargs={"timeout": 600.0})
    except Exception as error:
        log(f"client creation failed: {error}")
        return successes
    inspect_client(client, TRELLIS_SPACE)
    for label, img_path, out_path in TRELLIS_INPUTS:
        log("-" * 60)
        log(f"TRELLIS candidate: {label}")
        log(f"input file: {img_path}")
        log(f"output file: {out_path}")
        if not img_path.exists():
            log(f"MISSING INPUT: {img_path}")
            continue
        try:
            client.predict(api_name="/start_session")
            log("start_session OK")
        except Exception as error:
            log(f"start_session ERROR: {error}")
        preprocessed = None
        try:
            pp_result = client.predict(handle_file(str(img_path)), api_name="/preprocess_image")
            if isinstance(pp_result, dict):
                preprocessed = pp_result.get("path") or pp_result.get("value")
            else:
                preprocessed = pp_result
            if isinstance(preprocessed, (list, tuple)):
                preprocessed = preprocessed[0] if preprocessed else None
            log(f"preprocess_image result: {preprocessed}")
        except Exception as error:
            log(f"preprocess_image ERROR: {error}")
            preprocessed = None
        if not preprocessed:
            log("ERROR: preprocess returned no image")
            continue
        try:
            job = client.submit(
                handle_file(str(preprocessed)),
                0, "1024", 7.5, 0.7, 12, 5.0,
                7.5, 0.5, 12, 3.0,
                1.0, 0.0, 12, 3.0,
                api_name="/image_to_3d",
            )
            it3d = job.result(timeout=CALL_TIMEOUT)
            log(f"image_to_3d OK (result type={type(it3d).__name__}, preview_len={len(str(it3d))})")
        except Exception as error:
            log(f"image_to_3d ERROR: {error}")
            continue
        glb_src = None
        try:
            job = client.submit(300000, 2048, api_name="/extract_glb")
            ext = job.result(timeout=CALL_TIMEOUT)
            log(f"extract_glb result: {str(ext)[:500]}")
            glb_src = first_file_with_ext(ext, [".glb"])
        except Exception as error:
            log(f"extract_glb ERROR: {error}")
            continue
        if not glb_src:
            log("ERROR: no GLB returned from extract_glb")
            continue
        try:
            copy_result(glb_src, out_path)
            log(f"saved GLB: {out_path} ({out_path.stat().st_size} bytes)")
        except Exception as error:
            log(f"copy/save ERROR: {error}")
            continue
        info = parse_glb(out_path)
        log(f"verify: magic_ok={info['magic_ok']} size={info['size']} textures={info['textures']} "
            f"images={info['images']} embedded_images={info['image_embedded']} "
            f"materials={info['materials']} meshes={info['meshes']} err={info['error']}")
        if info["magic_ok"] and info["images"] > 0:
            log(f"SUCCESS textured GLB: {out_path}")
            successes.append(out_path)
        else:
            log(f"WARNING: GLB missing textures/images: {out_path}")
    log(f"TRELLIS successes: {[str(p) for p in successes]}")
    return successes

def run_hunyuan():
    log("=" * 80)
    log("PRIORITY 2: tencent/Hunyuan3D-2.1")
    stage, hardware, rerr = fetch_runtime(HUNYUAN_SPACE)
    log(f"runtime stage={stage} hardware={hardware} ({rerr})")
    successes = []
    try:
        client = Client(HUNYUAN_SPACE, token=True, httpx_kwargs={"timeout": 600.0})
    except Exception as error:
        log(f"client creation failed: {error}")
        return successes
    inspect_client(client, HUNYUAN_SPACE)
    front = CROPPED / "front.png"
    back = CROPPED / "back.png"
    side = CROPPED / "side.png"
    tq = CROPPED / "three_quarter.png"
    for p in (front, back, side, tq):
        if not p.exists():
            log(f"MISSING INPUT: {p}")
            return successes
    log("Call args (file paths only):")
    log("  image=front.png mv_image_front=front.png mv_image_back=back.png "
        "mv_image_left=side.png mv_image_right=three_quarter.png")
    gen_result = None
    for image_choice in (front, None):
        try:
            job = client.submit(
                handle_file(str(image_choice)) if image_choice else None,
                handle_file(str(front)),
                handle_file(str(back)),
                handle_file(str(side)),
                handle_file(str(tq)),
                30, 5.0, 1234, 256, True, 8000, True,
                api_name="/generation_all",
            )
            gen_result = job.result(timeout=CALL_TIMEOUT)
            log(f"generation_all OK (image={image_choice}) result: {str(gen_result)[:800]}")
            break
        except Exception as error:
            log(f"generation_all ERROR (image={image_choice}): {error}")
            gen_result = None
            continue
    if not gen_result:
        log("ERROR: generation_all failed")
        return successes
    files = []
    collect_files(gen_result, files)
    file_paths = [f for f in files if isinstance(f, str)]
    log(f"generation_all files: {file_paths}")
    f1 = file_paths[0] if len(file_paths) > 0 else None
    f2 = file_paths[1] if len(file_paths) > 1 else (file_paths[0] if file_paths else None)
    try:
        job = client.submit(
            handle_file(str(f1)) if f1 else None,
            handle_file(str(f2)) if f2 else None,
            "glb", False, True, 10000,
            api_name="/on_export_click",
        )
        exp = job.result(timeout=CALL_TIMEOUT)
        log(f"on_export_click result: {str(exp)[:800]}")
    except Exception as error:
        log(f"on_export_click ERROR: {error}")
        return successes
    exp_files = []
    collect_files(exp, exp_files)
    exp_paths = [f for f in exp_files if isinstance(f, str)]
    log(f"export files: {exp_paths}")
    glb_src = first_file_with_ext(exp, [".glb"]) or (exp_paths[-1] if exp_paths else None)
    if not glb_src:
        log("ERROR: no GLB from export")
        return successes
    try:
        copy_result(glb_src, HUNYUAN_OUTPUT)
        log(f"saved GLB: {HUNYUAN_OUTPUT} ({HUNYUAN_OUTPUT.stat().st_size} bytes)")
    except Exception as error:
        log(f"copy/save ERROR: {error}")
        return successes
    info = parse_glb(HUNYUAN_OUTPUT)
    log(f"verify: magic_ok={info['magic_ok']} size={info['size']} textures={info['textures']} "
        f"images={info['images']} embedded_images={info['image_embedded']} "
        f"materials={info['materials']} meshes={info['meshes']} err={info['error']}")
    if info["magic_ok"]:
        log(f"SUCCESS GLB: {HUNYUAN_OUTPUT}")
        successes.append(HUNYUAN_OUTPUT)
    return successes

def main():
    CAND_DIR.mkdir(parents=True, exist_ok=True)
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text("", encoding="utf-8")
    log("Starting authenticated generation")
    log(f"candidate dir: {CAND_DIR}")
    log("token source: cached HF login (token=True); value never logged")
    trellis_successes = run_trellis()
    hunyuan_successes = []
    if not trellis_successes:
        log("TRELLIS produced no successful GLB; attempting Hunyuan fallback")
        hunyuan_successes = run_hunyuan()
    else:
        log("TRELLIS succeeded; skipping Hunyuan fallback")
    log("=" * 80)
    log("FINAL SUMMARY")
    all_paths = trellis_successes + hunyuan_successes
    for p in all_paths:
        info = parse_glb(p)
        log(f"  {p}: size={info['size']} magic_ok={info['magic_ok']} "
            f"textures={info['textures']} images={info['images']} embedded={info['image_embedded']}")
    if not all_paths:
        log("  NO SUCCESSFUL CANDIDATES")
    for p in all_paths:
        data = p.read_bytes()
        assert data[:4] == b"glTF", f"bad magic: {p}"
        assert p.stat().st_size > 0, f"empty: {p}"
    log("self-check: magic bytes + size OK for all candidates")
    log("Authenticated generation finished")

if __name__ == "__main__":
    main()
