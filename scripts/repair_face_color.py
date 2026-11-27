#!/usr/bin/env python3
"""Headless Blender repair of face corner colors on the Valkhyn avatar.

Samples the real portrait (assets/avatar-ref/cropped/portrait_clean.png) and
replaces only the COLOR_0 corner-color attribute inside the front face region.
Geometry, transforms, materials, Draco settings and triangle count are kept.

Run as:
    blender --background --python scripts/repair_face_color.py

Environment overrides:
    AVATAR_INPUT   Source glb (default: public/models/avatar.glb)
    AVATAR_OUTPUT  Destination glb (default: assets/avatar-ref/candidates/facefix/facefix.glb)
    PORTRAIT_PATH  Source portrait (default: assets/avatar-ref/cropped/portrait_clean.png)
"""

import math
import os
import sys
from collections import defaultdict, OrderedDict
from pathlib import Path

import bpy
from mathutils import Vector
from PIL import Image, ImageFilter

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "public" / "models" / "avatar.glb"
DEFAULT_OUTPUT = PROJECT_ROOT / "assets" / "avatar-ref" / "candidates" / "facefix" / "facefix.glb"
DEFAULT_PORTRAIT = PROJECT_ROOT / "assets" / "avatar-ref" / "cropped" / "portrait_clean.png"

# Face region in imported Blender coordinates (conservative).
Z_IN_LO, Z_IN_HI = 1.32, 1.36
Z_OUT_LO, Z_OUT_HI = 1.64, 1.68
X_FADE_LO, X_FADE_HI = 0.18, 0.24
Y_FADE_LO, Y_FADE_HI = -0.02, -0.08  # weight 0 at -0.02, 1 at -0.08

# Orthographic projection of 3D face box -> portrait face bbox.
FACE_X_MIN, FACE_X_MAX = -0.22, 0.22
FACE_Z_MIN, FACE_Z_MAX = 1.35, 1.70
IMG_X_MIN, IMG_X_MAX = 400, 619
IMG_Y_MIN, IMG_Y_MAX = 100, 279  # y decreases upward


def log(message):
    print(f"[repair_face_color] {message}", flush=True)


def fail(message):
    print(f"[repair_face_color] ERROR: {message}", file=sys.stderr, flush=True)
    raise SystemExit(1)


def env_path(name, default):
    value = os.environ.get(name)
    if value:
        path = Path(value).expanduser()
        if not path.is_absolute():
            path = Path.cwd() / path
        return path.resolve()
    return Path(default).resolve()


def smoothstep(a, b, x):
    if b - a == 0:
        return 1.0 if x >= a else 0.0
    t = (x - a) / (b - a)
    t = max(0.0, min(1.0, t))
    return t * t * (3.0 - 2.0 * t)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    try:
        bpy.ops.object.delete(use_global=False)
    except TypeError:
        bpy.ops.object.delete()
    for collection in list(bpy.data.collections):
        if collection.name != "Collection":
            try:
                bpy.data.collections.remove(collection)
            except Exception:
                pass
    for data_collection in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.images,
        bpy.data.textures,
        bpy.data.lights,
        bpy.data.cameras,
    ):
        for block in list(data_collection):
            if getattr(block, "users", 0) == 0:
                try:
                    data_collection.remove(block)
                except Exception:
                    pass


def triangle_count(mesh):
    return sum(max(0, len(polygon.vertices) - 2) for polygon in mesh.polygons)


def sample_portrait(smoothed, x, y):
    w, h = smoothed.size
    x = max(0.0, min(w - 1.0, x))
    y = max(0.0, min(h - 1.0, y))
    x0 = int(math.floor(x))
    y0 = int(math.floor(y))
    x1 = min(w - 1, x0 + 1)
    y1 = min(h - 1, y0 + 1)
    fx = x - x0
    fy = y - y0

    def px(ix, iy):
        r, g, b, a = smoothed.getpixel((ix, iy))
        return (r / 255.0, g / 255.0, b / 255.0, a / 255.0)

    c00 = px(x0, y0)
    c10 = px(x1, y0)
    c01 = px(x0, y1)
    c11 = px(x1, y1)
    out = [0.0] * 4
    for c in range(4):
        v = (
            c00[c] * (1 - fx) * (1 - fy)
            + c10[c] * fx * (1 - fy)
            + c01[c] * (1 - fx) * fy
            + c11[c] * fx * fy
        )
        out[c] = v
    return out


def luminance(rgb):
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]


def project(x, z):
    xn = (x - FACE_X_MIN) / (FACE_X_MAX - FACE_X_MIN)
    zn = (z - FACE_Z_MIN) / (FACE_Z_MAX - FACE_Z_MIN)
    xn = max(0.0, min(1.0, xn))
    zn = max(0.0, min(1.0, zn))
    ix = IMG_X_MIN + xn * (IMG_X_MAX - IMG_X_MIN)
    iy = IMG_Y_MAX - zn * (IMG_Y_MAX - IMG_Y_MIN)
    return ix, iy


def process_mesh(mesh, smoothed, changed_counter):
    if not mesh.color_attributes:
        return
    # Find corner color attribute (COLOR_0 imported as 'Color').
    ca = None
    for cand in mesh.color_attributes:
        if cand.domain == "CORNER":
            ca = cand
            break
    if ca is None:
        return

    loops = list(mesh.loops)
    n = len(loops)
    original = [tuple(ca.data[i].color) for i in range(n)]
    weights = [0.0] * n
    targets = [original[i] for i in range(n)]

    # Compute per-loop weight + sampled target.
    for i, loop in enumerate(loops):
        v = mesh.vertices[loop.vertex_index]
        x, y, z = v.co.x, v.co.y, v.co.z
        # conservative region weight
        w = smoothstep(Z_IN_LO, Z_IN_HI, z) * (1.0 - smoothstep(Z_OUT_LO, Z_OUT_HI, z))
        w *= 1.0 - smoothstep(X_FADE_LO, X_FADE_HI, abs(x))
        w *= smoothstep(Y_FADE_LO, Y_FADE_HI, y)
        if w <= 1e-6:
            weights[i] = 0.0
            continue
        olum = luminance(original[i][:3])
        # Preserve already-present dark sunglasses band.
        is_sunglasses = (
            olum < 0.15
            and 1.50 <= z <= 1.62
            and y <= -0.08
            and abs(x) < 0.20
        )
        if is_sunglasses:
            weights[i] = 0.0
            continue
        ix, iy = project(x, z)
        sampled = sample_portrait(smoothed, ix, iy)
        slum = luminance(sampled[:3])
        # Do not paint sunglasses onto skin.
        if slum < 0.12 and olum > 0.20:
            weights[i] = 0.0
            continue
        weights[i] = w
        # preserve alpha from original
        targets[i] = (sampled[0], sampled[1], sampled[2], original[i][3])

    # Vertex-neighborhood smoothing of targets (only among region loops).
    vertex_to_loops = defaultdict(list)
    for i, loop in enumerate(loops):
        vertex_to_loops[loop.vertex_index].append(i)

    smoothed_targets = list(targets)
    for vidx, lis in vertex_to_loops.items():
        region_lis = [i for i in lis if weights[i] > 0.0]
        if len(region_lis) < 2:
            continue
        avg_rgb = [0.0, 0.0, 0.0]
        avg_a = 0.0
        for i in region_lis:
            for c in range(3):
                avg_rgb[c] += targets[i][c]
            avg_a += targets[i][3]
        cnt = len(region_lis)
        avg_rgb = [c / cnt for c in avg_rgb]
        avg_a /= cnt
        for i in region_lis:
            smoothed_targets[i] = (avg_rgb[0], avg_rgb[1], avg_rgb[2], avg_a)

    # Apply with boundary blend.
    for i, loop in enumerate(loops):
        if weights[i] <= 1e-6:
            continue
        w = weights[i]
        orig = original[i]
        tgt = smoothed_targets[i]
        new_color = (
            orig[0] * (1.0 - w) + tgt[0] * w,
            orig[1] * (1.0 - w) + tgt[1] * w,
            orig[2] * (1.0 - w) + tgt[2] * w,
            orig[3] * (1.0 - w) + tgt[3] * w,
        )
        if any(abs(new_color[c] - orig[c]) > 1e-6 for c in range(4)):
            changed_counter[0] += 1
        ca.data[i].color = new_color

    mesh.update()


def main():
    input_path = env_path("AVATAR_INPUT", DEFAULT_INPUT)
    output_path = env_path("AVATAR_OUTPUT", DEFAULT_OUTPUT)
    portrait_path = env_path("PORTRAIT_PATH", DEFAULT_PORTRAIT)

    if not input_path.is_file():
        fail(f"input not found: {input_path}")
    if not portrait_path.is_file():
        fail(f"portrait not found: {portrait_path}")

    log(f"Input: {input_path}")
    log(f"Output: {output_path}")
    log(f"Portrait: {portrait_path}")

    # Load + smooth portrait.
    portrait = Image.open(portrait_path).convert("RGBA")
    smoothed = portrait.filter(ImageFilter.GaussianBlur(radius=2))
    log(f"Portrait size: {portrait.size}")

    clear_scene()

    log("Importing glTF (read-only source)")
    bpy.ops.import_scene.gltf(
        filepath=str(input_path),
        import_pack_images=True,
        merge_vertices=False,
    )

    mesh_objects = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not mesh_objects:
        fail("import produced no mesh objects")

    # Triangle count before (sum over meshes).
    initial_triangles = sum(triangle_count(o.data) for o in mesh_objects)
    log(f"Initial triangle count: {initial_triangles}")

    changed_counter = [0]
    for obj in mesh_objects:
        process_mesh(obj.data, smoothed, changed_counter)

    log(f"Changed corner colors: {changed_counter[0]}")

    # Self-checks (assert-based).
    final_triangles = sum(triangle_count(o.data) for o in mesh_objects)
    assert final_triangles == initial_triangles, (
        f"triangle count changed: {initial_triangles} -> {final_triangles}"
    )
    assert changed_counter[0] >= 0

    output_path.parent.mkdir(parents=True, exist_ok=True)

    props = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
    draco_candidates = (
        "export_draco_mesh_compression_enable",
        "export_draco_mesh_compression_enabled",
        "draco_mesh_compression_enable",
    )
    draco_key = next((key for key in draco_candidates if key in props), None)
    if draco_key is None:
        fail("Blender glTF exporter does not expose a known Draco enable property")

    export_kwargs = {
        "filepath": str(output_path),
        "check_existing": False,
        "export_format": "GLB",
        "export_texcoords": True,
        "export_normals": True,
        "export_materials": "EXPORT",
        "export_apply": False,
        "export_yup": True,
        draco_key: True,
    }
    optional_draco_settings = {
        "export_draco_mesh_compression_level": 6,
        "export_draco_position_quantization": 14,
        "export_draco_normal_quantization": 10,
        "export_draco_texcoord_quantization": 12,
        "export_draco_color_quantization": 0,
        "export_draco_generic_quantization": 12,
    }
    for key, value in optional_draco_settings.items():
        if key in props:
            export_kwargs[key] = value

    log("Exporting binary glTF with Draco compression")
    bpy.ops.export_scene.gltf(**export_kwargs)

    if not output_path.is_file():
        fail(f"export did not create output file: {output_path}")

    size_bytes = output_path.stat().st_size
    assert size_bytes > 0

    log(f"Output file: {output_path}")
    log(f"Output size: {size_bytes} bytes ({size_bytes / (1024 * 1024):.6f} MB)")
    log(f"Final triangle count: {final_triangles}")
    log(f"Changed corner colors: {changed_counter[0]}")
    print(
        f"SUMMARY: file={output_path} size_bytes={size_bytes} "
        f"triangles={final_triangles} changed_corner_colors={changed_counter[0]}"
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:
        print(f"[repair_face_color] ERROR: {exc}", file=sys.stderr, flush=True)
        raise SystemExit(1)
