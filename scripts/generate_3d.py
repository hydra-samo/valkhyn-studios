#!/usr/bin/env python3
"""Generate a textured avatar GLB from the prepared views via public HF Spaces."""

import os
import shutil
import time
import zipfile
from pathlib import Path

import requests
from gradio_client import Client, handle_file

ROOT = Path(__file__).resolve().parents[1]
CROPPED = ROOT / "assets" / "avatar-ref" / "cropped"
RAW_GLB = ROOT / "assets" / "avatar-ref" / "raw_avatar.glb"
LOG_PATH = ROOT / "assets" / "avatar-ref" / "generation2.log"

FRONT = CROPPED / "front.png"
SIDE = CROPPED / "side.png"
THREE_Q = CROPPED / "three_quarter.png"
BACK = CROPPED / "back.png"
PORTRAIT = CROPPED / "portrait_clean.png"
MULTI = [FRONT, SIDE, THREE_Q, BACK]

TOKEN = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")

# Candidate Spaces discovered via HF API + runtime inspection.
# Includes original ZeroGPU-blocked Spaces (re-checked) and free CPU-runtime Spaces.
CANDIDATES = [
    "microsoft/TRELLIS.2",
    "microsoft/TRELLIS",
    "tencent/Hunyuan3D-2",
    "tencent/Hunyuan3D-2mv",
    "trellis-community/TRELLIS",
    "tencent/Hunyuan3D-2.1",
    "TencentARC/InstantMesh",
    "cpuai/TRELLIS-2",
    "vaibhavpandeyvpz/trellis-image-to-3d",
    "3dpapercraft/TripoSR",
    "BalaAndegue/TripoSR",
    "orvixgamesai/TripoSR",
    "codemaker2015/TripoSR",
    "batsyroger/pixelforge-triposr",
    "WeReCooking2/Dust3R-TripoSR",
    "debs09/image-to-3d-demo",
    "rajaai1/Apple-Sharp-Image-to-3D-View-Synthesis",
    "asaasaasaa/image-to-3d-relief",
    "asaasaasaa/image-to-3d-pixel",
    "bobthebuilderinternational/image-to-3d-deepsdf",
    "attashe/test_hunyuan3d",
]

MV_MAP = {
    "mv_image_front": FRONT,
    "mv_image_back": BACK,
    "mv_image_left": SIDE,
    "mv_image_right": THREE_Q,
}


def log(message: str) -> None:
    stamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    line = f"[{stamp}] {message}"
    print(line)
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


def default_for_param(param: dict):
    python_type = str(param.get("python_type", {}).get("type", "")).lower()
    component = str(param.get("component", "")).lower()
    if "bool" in python_type:
        return bool(param.get("parameter_default", False))
    if "int" in python_type or "number" in python_type or "float" in python_type:
        return param.get("parameter_default", 0)
    if "str" in python_type:
        return param.get("parameter_default", "")
    if "image" in component or "file" in component or "gallery" in component:
        return None
    return None


def to_gradio_value(value):
    if isinstance(value, (str, Path)):
        path = Path(value)
        if path.exists():
            return handle_file(str(path))
        return value
    if isinstance(value, (list, tuple)):
        return [to_gradio_value(item) for item in value]
    return value


def invoke(client: Client, endpoint: str, schema: dict, assignments: dict, timeout: int = 180):
    params = schema[endpoint].get("parameters", [])
    args = []
    for index, param in enumerate(params):
        pname = param.get("parameter_name")
        value = None
        found = False
        if pname is not None and pname in assignments:
            value = assignments[pname]
            found = True
        elif index in assignments:
            value = assignments[index]
            found = True
        if not found:
            if param.get("parameter_has_default"):
                value = param.get("parameter_default")
            else:
                value = default_for_param(param)
        args.append(to_gradio_value(value))
    job = client.submit(*args, api_name=endpoint)
    return job.result(timeout=timeout)


def image_params(endpoint_schema: dict) -> list:
    params = endpoint_schema.get("parameters", [])
    result = []
    for param in params:
        name = str(param.get("parameter_name", "")).lower()
        component = str(param.get("component", "")).lower()
        if component == "image" or "image" in name:
            result.append(param)
    return result


def accept_glb(candidate_path: str) -> bool:
    path = Path(candidate_path)
    if candidate_path.startswith("http://") or candidate_path.startswith("https://"):
        try:
            import urllib.request

            target = Path("/tmp/opencode") / (path.name or "downloaded.glb")
            target.parent.mkdir(parents=True, exist_ok=True)
            urllib.request.urlretrieve(candidate_path, target)
            path = target
        except Exception as error:
            log(f"    download failed for {candidate_path}: {error}")
            return False
    if not path.exists():
        return False
    if RAW_GLB.exists():
        if path.suffix.lower() == ".glb":
            try:
                if path.read_bytes()[:4] == b"glTF":
                    log(f"    GLB already present; not overwriting with {path}")
                    return True
            except Exception:
                pass
        log(f"    GLB already present; ignoring non-GLB output {path}")
        return False
    if path.suffix.lower() == ".glb":
        try:
            if path.read_bytes()[:4] != b"glTF":
                log(f"    rejected GLB with bad magic: {path}")
                return False
        except Exception as error:
            log(f"    could not read {path}: {error}")
            return False
        shutil.copyfile(path, RAW_GLB)
        log(f"    saved GLB from {path} ({path.stat().st_size} bytes)")
        return True
    if path.suffix.lower() == ".zip":
        extract_dir = Path("/tmp/opencode") / f"zip_{int(time.time())}"
        extract_dir.mkdir(parents=True, exist_ok=True)
        try:
            with zipfile.ZipFile(path) as archive:
                archive.extractall(extract_dir)
        except Exception as error:
            log(f"    could not extract zip {path}: {error}")
            return False
        for extracted in extract_dir.rglob("*.glb"):
            if extracted.read_bytes()[:4] == b"glTF":
                shutil.copyfile(extracted, RAW_GLB)
                log(f"    saved GLB from zip {extracted} ({extracted.stat().st_size} bytes)")
                return True
        log(f"    zip did not contain a valid GLB: {path}")
        return False
    log(f"    non-GLB output ignored: {path}")
    return False


def extract_glb_from_result(result, endpoint: str) -> bool:
    found = []
    collect_files(result, found)
    for item in found:
        if accept_glb(item):
            return True
    if isinstance(result, str) and accept_glb(result):
        return True
    return False


def schema_summary(schema: dict) -> str:
    lines = []
    for name, endpoint in schema.items():
        params = [(p.get("parameter_name"), p.get("component")) for p in endpoint.get("parameters", [])]
        returns = [(r.get("label"), r.get("component")) for r in endpoint.get("returns", [])]
        lines.append(f"  {name}: params={params} returns={returns}")
    return "\n".join(lines)


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


def assign_images(endpoint_schema: dict, single_image: Path) -> dict:
    params = endpoint_schema.get("parameters", [])
    imgs = image_params(endpoint_schema)
    assignments = {}
    mv_present = any(str(p.get("parameter_name", "")).lower() in MV_MAP for p in imgs)
    if mv_present:
        for param in imgs:
            pname = param.get("parameter_name")
            key = pname if pname is not None else params.index(param)
            low = str(pname).lower() if pname is not None else ""
            if low in MV_MAP:
                assignments[key] = MV_MAP[low]
            else:
                assignments[key] = single_image
    elif len(imgs) <= 1:
        for param in imgs:
            pname = param.get("parameter_name")
            key = pname if pname is not None else params.index(param)
            assignments[key] = single_image
    else:
        for index, param in enumerate(imgs):
            pname = param.get("parameter_name")
            key = pname if pname is not None else params.index(param)
            assignments[key] = MULTI[index % len(MULTI)]
    return assignments


def recipe_trellis2(client: Client, schema: dict) -> bool:
    preprocess_candidates = [name for name in schema if "preprocess" in name.lower()]
    if not preprocess_candidates:
        return False
    pre_endpoint = preprocess_candidates[0]
    pre_assign = assign_images(schema[pre_endpoint], FRONT)
    try:
        pre_result = invoke(client, pre_endpoint, schema, pre_assign)
    except Exception as error:
        log(f"    {pre_endpoint} ERROR: {error}")
        return False
    pre_path = first_file(pre_result)
    if not pre_path:
        log(f"    {pre_endpoint} produced no file: {str(pre_result)[:300]}")
        return False
    log(f"    {pre_endpoint} -> {pre_path}")

    gen_candidates = [name for name in schema if "image_to_3d" in name.lower()]
    if not gen_candidates:
        gen_candidates = [name for name in schema if "generate" in name.lower()]
    if not gen_candidates:
        return False
    gen_endpoint = gen_candidates[0]
    gen_schema = schema[gen_endpoint]
    gen_imgs = image_params(gen_schema)
    gen_assign = {}
    for param in gen_imgs:
        pname = param.get("parameter_name")
        key = pname if pname is not None else gen_schema["parameters"].index(param)
        gen_assign[key] = pre_path
    try:
        gen_result = invoke(client, gen_endpoint, schema, gen_assign)
    except Exception as error:
        log(f"    {gen_endpoint} ERROR: {error}")
        return False
    log(f"    {gen_endpoint} result: {str(gen_result)[:500]}")

    extract_candidates = [name for name in schema if "extract" in name.lower()]
    if extract_candidates:
        ext_endpoint = extract_candidates[0]
        try:
            ext_result = invoke(client, ext_endpoint, schema, {})
        except Exception as error:
            log(f"    {ext_endpoint} ERROR: {error}")
            return False
        log(f"    {ext_endpoint} result: {str(ext_result)[:500]}")
        return extract_glb_from_result(ext_result, ext_endpoint)
    return extract_glb_from_result(gen_result, gen_endpoint)


def recipe_trellis(client: Client, schema: dict) -> bool:
    # Single-image path.
    pre_candidates = [name for name in schema if "preprocess_image" in name.lower()]
    pre_path = None
    if pre_candidates:
        pre_endpoint = pre_candidates[0]
        pre_assign = assign_images(schema[pre_endpoint], FRONT)
        try:
            pre_result = invoke(client, pre_endpoint, schema, pre_assign)
        except Exception as error:
            log(f"    {pre_endpoint} ERROR: {error}")
            pre_result = None
        if pre_result is not None:
            pre_path = first_file(pre_result)
            log(f"    {pre_endpoint} -> {pre_path}")

    gen_candidates = [name for name in schema if "generate_and_extract_glb" in name.lower()]
    if not gen_candidates:
        gen_candidates = [name for name in schema if "generate" in name.lower()]
    if not gen_candidates:
        return False
    gen_endpoint = gen_candidates[0]
    gen_schema = schema[gen_endpoint]
    gen_assign = {}
    gen_imgs = image_params(gen_schema)
    for param in gen_imgs:
        pname = param.get("parameter_name")
        key = pname if pname is not None else gen_schema["parameters"].index(param)
        gen_assign[key] = pre_path if pre_path else FRONT

    # Gallery multiimages param (if present) via preprocess_images.
    gallery_params = [p for p in gen_schema.get("parameters", [])
                     if "multi" in str(p.get("parameter_name", "")).lower()
                     or str(p.get("component", "")).lower() == "gallery"]
    multi_pre_path = None
    preprocess_images_candidates = [name for name in schema if "preprocess_images" in name.lower()]
    if preprocess_images_candidates and gallery_params:
        pre_multi_endpoint = preprocess_images_candidates[0]
        pre_multi_assign = {}
        imgs = image_params(schema[pre_multi_endpoint])
        # The preprocess_images takes a Gallery; assign the file list to its first param.
        first_param = schema[pre_multi_endpoint]["parameters"][0]
        key = first_param.get("parameter_name")
        if key is None:
            key = 0
        pre_multi_assign[key] = [FRONT, SIDE, THREE_Q, BACK]
        try:
            pre_multi_result = invoke(client, pre_multi_endpoint, schema, pre_multi_assign)
            log(f"    {pre_multi_endpoint} result: {str(pre_multi_result)[:300]}")
            multi_pre_path = pre_multi_result
        except Exception as error:
            log(f"    {pre_multi_endpoint} ERROR: {error}")

    if multi_pre_path is not None:
        for param in gallery_params:
            pname = param.get("parameter_name")
            key = pname if pname is not None else gen_schema["parameters"].index(param)
            gen_assign[key] = multi_pre_path
        # Use first preprocessed image for the single image slot if available.
        fp = first_file(multi_pre_path)
        if fp:
            for param in gen_imgs:
                pname = param.get("parameter_name")
                key = pname if pname is not None else gen_schema["parameters"].index(param)
                gen_assign[key] = fp

    try:
        gen_result = invoke(client, gen_endpoint, schema, gen_assign)
    except Exception as error:
        log(f"    {gen_endpoint} ERROR: {error}")
        return False
    log(f"    {gen_endpoint} result: {str(gen_result)[:500]}")
    return extract_glb_from_result(gen_result, gen_endpoint)


def recipe_triposr_standard(client: Client, schema: dict) -> bool:
    pre_candidates = [name for name in schema if "preprocess" in name.lower()]
    processed = None
    if pre_candidates:
        pre_endpoint = pre_candidates[0]
        pre_assign = assign_images(schema[pre_endpoint], FRONT)
        try:
            pre_result = invoke(client, pre_endpoint, schema, pre_assign)
        except Exception as error:
            log(f"    {pre_endpoint} ERROR: {error}")
            pre_result = None
        if pre_result is not None:
            processed = first_file(pre_result)
            log(f"    {pre_endpoint} -> {processed}")

    gen_candidates = [name for name in schema if "generate" in name.lower()]
    if not gen_candidates:
        return False
    gen_endpoint = gen_candidates[0]
    gen_schema = schema[gen_endpoint]
    gen_assign = assign_images(gen_schema, FRONT)
    # If we have a processed image, use it for image params.
    if processed:
        gen_imgs = image_params(gen_schema)
        for param in gen_imgs:
            pname = param.get("parameter_name")
            key = pname if pname is not None else gen_schema["parameters"].index(param)
            gen_assign[key] = processed
    try:
        gen_result = invoke(client, gen_endpoint, schema, gen_assign)
    except Exception as error:
        log(f"    {gen_endpoint} ERROR: {error}")
        return False
    log(f"    {gen_endpoint} result: {str(gen_result)[:500]}")
    return extract_glb_from_result(gen_result, gen_endpoint)


def recipe_pixelforge(client: Client, schema: dict) -> bool:
    gen_candidates = [name for name in schema if "generate" in name.lower()]
    if not gen_candidates:
        return False
    gen_endpoint = gen_candidates[0]
    gen_assign = assign_images(schema[gen_endpoint], FRONT)
    try:
        gen_result = invoke(client, gen_endpoint, schema, gen_assign)
    except Exception as error:
        log(f"    {gen_endpoint} ERROR: {error}")
        return False
    log(f"    {gen_endpoint} result: {str(gen_result)[:500]}")
    return extract_glb_from_result(gen_result, gen_endpoint)


def recipe_dust3r(client: Client, schema: dict) -> bool:
    pre_candidates = [name for name in schema if "preprocess" in name.lower()]
    processed = None
    if pre_candidates:
        pre_endpoint = pre_candidates[0]
        pre_assign = assign_images(schema[pre_endpoint], FRONT)
        try:
            pre_result = invoke(client, pre_endpoint, schema, pre_assign)
        except Exception as error:
            log(f"    {pre_endpoint} ERROR: {error}")
            pre_result = None
        if pre_result is not None:
            processed = first_file(pre_result)
            log(f"    {pre_endpoint} -> {processed}")

    gen_candidates = [name for name in schema if "generate" in name.lower()]
    if not gen_candidates:
        return False
    gen_endpoint = gen_candidates[0]
    gen_schema = schema[gen_endpoint]
    gen_assign = assign_images(gen_schema, FRONT)
    if processed:
        gen_imgs = image_params(gen_schema)
        for param in gen_imgs:
            pname = param.get("parameter_name")
            key = pname if pname is not None else gen_schema["parameters"].index(param)
            gen_assign[key] = processed
    try:
        gen_result = invoke(client, gen_endpoint, schema, gen_assign)
    except Exception as error:
        log(f"    {gen_endpoint} ERROR: {error}")
        return False
    log(f"    {gen_endpoint} result: {str(gen_result)[:500]}")
    return extract_glb_from_result(gen_result, gen_endpoint)


def try_generic(client: Client, schema: dict, single_image: Path) -> bool:
    for endpoint, endpoint_schema in schema.items():
        lowered = endpoint.lower()
        if "preprocess" in lowered:
            continue
        params = endpoint_schema.get("parameters", [])
        imgs = image_params(endpoint_schema)
        if not imgs:
            continue
        assignments = assign_images(endpoint_schema, single_image)
        try:
            result = invoke(client, endpoint, schema, assignments)
            log(f"  {endpoint} result: {str(result)[:1000]}")
            if extract_glb_from_result(result, endpoint):
                return True
        except Exception as error:
            log(f"  {endpoint} ERROR: {error}")
    return False


def process_space(space: str) -> bool:
    log(f"=== Candidate: {space} ===")
    stage, hardware, runtime_error = fetch_runtime(space)
    log(f"  runtime stage={stage} hardware={hardware} ({runtime_error})")
    try:
        client = Client(space, token=TOKEN)
    except Exception as error:
        log(f"  client creation failed: {error}")
        return False
    try:
        info = client._get_api_info()
    except Exception as error:
        log(f"  schema discovery failed: {error}")
        return False
    schema = info.get("named_endpoints", {}) if isinstance(info, dict) else {}
    log("  discovered schema:")
    log(schema_summary(schema))

    try:
        if space in ("microsoft/TRELLIS.2", "cpuai/TRELLIS-2"):
            success = recipe_trellis2(client, schema)
        elif space in ("trellis-community/TRELLIS", "vaibhavpandeyvpz/trellis-image-to-3d"):
            success = recipe_trellis(client, schema)
        elif space in ("3dpapercraft/TripoSR", "BalaAndegue/TripoSR", "orvixgamesai/TripoSR", "codemaker2015/TripoSR"):
            success = recipe_triposr_standard(client, schema)
        elif space == "batsyroger/pixelforge-triposr":
            success = recipe_pixelforge(client, schema)
        elif space == "WeReCooking2/Dust3R-TripoSR":
            success = recipe_dust3r(client, schema)
        else:
            success = try_generic(client, schema, FRONT)
    except Exception as error:
        log(f"  unhandled error: {error}")
        success = False
    log(f"  candidate {'SUCCEEDED' if success else 'failed'}")
    return success


def main() -> None:
    if RAW_GLB.exists():
        RAW_GLB.unlink()
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text("", encoding="utf-8")
    log("Starting avatar GLB generation (generation2)")
    log(f"HF token present: {bool(TOKEN)}")

    successes = []
    for space in CANDIDATES:
        if process_space(space):
            successes.append(space)

    if RAW_GLB.exists():
        log(f"RESULT: {RAW_GLB} created ({RAW_GLB.stat().st_size} bytes)")
    else:
        log("BLOCKER: all candidates failed; no GLB was created")
        log("No raw_avatar.glb present.")
    log(f"Successful candidates: {successes}")


if __name__ == "__main__":
    main()
