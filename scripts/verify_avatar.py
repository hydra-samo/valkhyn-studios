#!/usr/bin/env python3
"""Verify a Valkhyn avatar GLB (stdlib only).

Usage:
    ./scripts/verify_avatar.py [path/to/avatar.glb]

Default path: <repo>/public/models/avatar.glb
"""

import json
import struct
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PATH = REPO_ROOT / "public" / "models" / "avatar.glb"
DRACO_EXT = "KHR_draco_mesh_compression"
GLB_MAGIC = 0x46546C67
JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942
VALID_MODES = {0, 1, 2, 3, 4, 5, 6}
TRIANGLES_MODE = 4


def fail(message):
    print(f"verify_avatar: ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def parse_glb(path):
    data = path.read_bytes()
    if len(data) < 12:
        fail("file too small to be a GLB")
    magic, version, length = struct.unpack("<III", data[:12])
    if magic != GLB_MAGIC:
        fail(f"bad GLB magic: 0x{magic:08x}")
    if version != 2:
        fail(f"unsupported glTF version: {version} (expected 2)")
    if length != len(data):
        fail(f"GLB header length {length} != file size {len(data)}")
    off = 12
    json_bytes = None
    bin_bytes = None
    chunk_index = 0
    while off < len(data):
        if off + 8 > len(data):
            fail("truncated chunk header")
        chunk_len, chunk_type = struct.unpack("<II", data[off:off + 8])
        off += 8
        if chunk_len < 0 or off + chunk_len > len(data):
            fail(f"invalid chunk {chunk_index} length {chunk_len}")
        chunk_data = data[off:off + chunk_len]
        off += chunk_len
        # GLB chunks are padded to 4 bytes
        if chunk_len % 4:
            pad = 4 - (chunk_len % 4)
            if off + pad <= len(data) and data[off:off + pad] == b"\x00" * pad:
                off += pad
        if chunk_type == JSON_CHUNK:
            if json_bytes is not None:
                fail("duplicate JSON chunk")
            json_bytes = chunk_data
        elif chunk_type == BIN_CHUNK:
            if bin_bytes is not None:
                fail("duplicate BIN chunk")
            bin_bytes = chunk_data
        else:
            fail(f"unknown chunk type 0x{chunk_type:08x}")
        chunk_index += 1
    if json_bytes is None:
        fail("missing JSON chunk")
    try:
        text = json_bytes.decode("utf-8").rstrip(" \t\r\n\0")
        gltf = json.loads(text)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        fail(f"invalid JSON chunk: {exc}")
    if not isinstance(gltf, dict):
        fail("glTF JSON root is not an object")
    return data, gltf


def as_list(gltf, key):
    value = gltf.get(key, [])
    if value is None:
        return []
    if not isinstance(value, list):
        fail(f"{key} is not an array")
    return value


def nonneg_int(value, label):
    if not isinstance(value, int) or isinstance(value, bool):
        fail(f"{label} is not an integer: {value!r}")
    if value < 0:
        fail(f"{label} is negative: {value}")
    return value


def main():
    if len(sys.argv) > 2:
        fail("usage: verify_avatar.py [path/to/avatar.glb]")
    if len(sys.argv) == 2:
        path = Path(sys.argv[1]).expanduser()
        if not path.is_absolute():
            path = Path.cwd() / path
    else:
        path = DEFAULT_PATH
    path = path.resolve()

    if not path.is_file():
        fail(f"GLB does not exist: {path}")

    size_bytes = path.stat().st_size
    data, gltf = parse_glb(path)

    meshes = as_list(gltf, "meshes")
    materials = as_list(gltf, "materials")
    textures = as_list(gltf, "textures")
    images = as_list(gltf, "images")
    nodes = as_list(gltf, "nodes")
    accessors = as_list(gltf, "accessors")

    extensions_used = gltf.get("extensionsUsed", [])
    extensions_required = gltf.get("extensionsRequired", [])
    if extensions_used is None:
        extensions_used = []
    if extensions_required is None:
        extensions_required = []
    if not isinstance(extensions_used, list):
        fail("extensionsUsed is not an array")
    if not isinstance(extensions_required, list):
        fail("extensionsRequired is not an array")

    draco_in_used = DRACO_EXT in extensions_used
    draco_in_required = DRACO_EXT in extensions_required

    # Primitive enumeration
    primitive_count = 0
    triangles = 0
    position_accessor_indices = []
    position_minmax = []
    seen_pos_accessors = set()
    for mi, mesh in enumerate(meshes):
        if not isinstance(mesh, dict):
            fail(f"mesh {mi} is not an object")
        primitives = mesh.get("primitives", [])
        if primitives is None:
            primitives = []
        if not isinstance(primitives, list):
            fail(f"mesh {mi}.primitives is not an array")
        for pi, prim in enumerate(primitives):
            if not isinstance(prim, dict):
                fail(f"mesh {mi} primitive {pi} is not an object")
            primitive_count += 1
            mode = prim.get("mode", TRIANGLES_MODE)
            if not isinstance(mode, int) or isinstance(mode, bool) or mode not in VALID_MODES:
                fail(f"mesh {mi} primitive {pi} has invalid mode: {mode!r}")
            # referential: material
            mat = prim.get("material")
            if mat is not None:
                nonneg_int(mat, f"mesh {mi} primitive {pi} material")
                if mat >= len(materials):
                    fail(f"mesh {mi} primitive {pi} material index {mat} out of range")
            # draco extension on primitive
            prim_exts = prim.get("extensions") or {}
            if not isinstance(prim_exts, dict):
                fail(f"mesh {mi} primitive {pi} extensions is not an object")
            has_draco_prim = DRACO_EXT in prim_exts

            attrs = prim.get("attributes") or {}
            if not isinstance(attrs, dict):
                fail(f"mesh {mi} primitive {pi} attributes is not an object")

            # POSITION accessor tracking (all primitives that declare it)
            pos_idx = attrs.get("POSITION")
            if pos_idx is not None:
                nonneg_int(pos_idx, f"mesh {mi} primitive {pi} POSITION")
                if pos_idx >= len(accessors):
                    fail(f"mesh {mi} primitive {pi} POSITION accessor {pos_idx} out of range")
                if pos_idx not in seen_pos_accessors:
                    seen_pos_accessors.add(pos_idx)
                    position_accessor_indices.append(pos_idx)
                    acc = accessors[pos_idx]
                    if isinstance(acc, dict):
                        mn = acc.get("min")
                        mx = acc.get("max")
                        if mn is not None or mx is not None:
                            position_minmax.append({
                                "accessor": pos_idx,
                                "min": mn,
                                "max": mx,
                            })

            if mode != TRIANGLES_MODE:
                continue

            # triangle counting
            indices = prim.get("indices")
            if indices is not None:
                nonneg_int(indices, f"mesh {mi} primitive {pi} indices")
                if indices >= len(accessors):
                    fail(f"mesh {mi} primitive {pi} indices accessor {indices} out of range")
                idx_count = accessors[indices].get("count", 0) if isinstance(accessors[indices], dict) else 0
                nonneg_int(idx_count, f"accessor {indices} count")
                triangles += idx_count // 3
            else:
                if pos_idx is None:
                    # no position, cannot count
                    continue
                pos_count = accessors[pos_idx].get("count", 0) if isinstance(accessors[pos_idx], dict) else 0
                nonneg_int(pos_count, f"accessor {pos_idx} count")
                triangles += pos_count // 3

    # node mesh references
    for ni, node in enumerate(nodes):
        if not isinstance(node, dict):
            fail(f"node {ni} is not an object")
        nm = node.get("mesh")
        if nm is not None:
            nonneg_int(nm, f"node {ni} mesh")
            if nm >= len(meshes):
                fail(f"node {ni} mesh index {nm} out of range")

    # accessors validation
    for ai, acc in enumerate(accessors):
        if not isinstance(acc, dict):
            fail(f"accessor {ai} is not an object")
        c = acc.get("count", 0)
        nonneg_int(c, f"accessor {ai} count")

    # impossible counts checks
    if primitive_count != sum(len(m.get("primitives", []) or []) for m in meshes if isinstance(m, dict)):
        fail("primitive count mismatch")
    # total counts non-negative (already)
    for label, val in (("meshes", len(meshes)), ("materials", len(materials)),
                       ("textures", len(textures)), ("images", len(images)),
                       ("nodes", len(nodes)), ("primitives", primitive_count)):
        nonneg_int(val, label)

    # draco assertion
    if not draco_in_used:
        fail(f"{DRACO_EXT} missing from extensionsUsed")
    if not draco_in_required:
        fail(f"{DRACO_EXT} missing from extensionsRequired")
    # require at least one primitive actually uses draco
    draco_prim_count = 0
    for mesh in meshes:
        if not isinstance(mesh, dict):
            continue
        for prim in (mesh.get("primitives") or []):
            if isinstance(prim, dict) and isinstance(prim.get("extensions"), dict) and DRACO_EXT in prim["extensions"]:
                draco_prim_count += 1
    if draco_prim_count == 0:
        fail(f"{DRACO_EXT} not used by any mesh primitive")

    if triangles <= 0:
        fail("triangle count is zero")

    size_mb = size_bytes / (1024 * 1024)

    # aggregate position min/max (component-wise) if possible
    agg_min = None
    agg_max = None
    for entry in position_minmax:
        mn = entry.get("min")
        mx = entry.get("max")
        if isinstance(mn, list):
            if agg_min is None:
                agg_min = list(mn)
            else:
                agg_min = [min(agg_min[i], mn[i]) if i < len(mn) and i < len(agg_min) else agg_min[i] for i in range(len(agg_min))]
        if isinstance(mx, list):
            if agg_max is None:
                agg_max = list(mx)
            else:
                agg_max = [max(agg_max[i], mx[i]) if i < len(mx) and i < len(agg_max) else agg_max[i] for i in range(len(agg_max))]

    print(f"File: {path}")
    print(f"Size: {size_bytes} bytes ({size_mb} MB)")
    print(f"glTF version: {gltf.get('asset', {}).get('version') if isinstance(gltf.get('asset'), dict) else None}")
    print(f"extensionsUsed: {extensions_used}")
    print(f"extensionsRequired: {extensions_required}")
    print(f"Draco in used: {draco_in_used}; in required: {draco_in_required}; primitives using Draco: {draco_prim_count}")
    print(f"Meshes: {len(meshes)}")
    print(f"Materials: {len(materials)}")
    print(f"Textures: {len(textures)}")
    print(f"Images: {len(images)}")
    print(f"Nodes: {len(nodes)}")
    print(f"Primitives: {primitive_count}")
    print(f"Triangles: {triangles}")
    if position_minmax:
        print("POSITION accessor min/max:")
        for entry in position_minmax:
            print(f"  accessor {entry['accessor']}: min={entry['min']} max={entry['max']}")
        if agg_min is not None:
            print(f"  aggregate min={agg_min} max={agg_max}")
    else:
        print("POSITION accessor min/max: none")

    summary = {
        "file": str(path),
        "bytes": size_bytes,
        "size_mb": size_mb,
        "version": 2,
        "asset_version": gltf.get("asset", {}).get("version") if isinstance(gltf.get("asset"), dict) else None,
        "extensions_used": extensions_used,
        "extensions_required": extensions_required,
        "draco_in_used": draco_in_used,
        "draco_in_required": draco_in_required,
        "draco_primitives": draco_prim_count,
        "meshes": len(meshes),
        "materials": len(materials),
        "textures": len(textures),
        "images": len(images),
        "nodes": len(nodes),
        "primitives": primitive_count,
        "triangles": triangles,
        "position_accessors": position_minmax,
        "position_min": agg_min,
        "position_max": agg_max,
        "ok": True,
    }
    print(json.dumps(summary, separators=(",", ":")))


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:  # noqa: BLE001
        print(f"verify_avatar: ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
