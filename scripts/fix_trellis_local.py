#!/usr/bin/env python3
"""Headless Blender local fix for the authenticated TRELLIS portrait candidate."""
import json
import math
import os
import struct
import sys
from pathlib import Path

import bpy
from mathutils import Quaternion, Vector

PROJECT_ROOT = Path(__file__).resolve().parents[1]
INPUT_DEFAULT = "assets/avatar-ref/candidates/authenticated/trellis_portrait-DRAFT.glb"
OUT_DIR = PROJECT_ROOT / "assets" / "avatar-ref" / "candidates" / "authenticated" / "localfix"
PLAIN_NAME = "trellis_localfix.glb"
DRACO_NAME = "trellis_localfix_draco.glb"
TARGET_HEIGHT = 1.75
VIEWS = ("neg_y", "pos_y", "pos_x", "neg_x")
VIEW_DISTANCE = 2.8
TARGET_Z = 0.875


def log(message):
    print(f"[fix_trellis_local] {message}", flush=True)


def fail(message):
    print(f"[fix_trellis_local] ERROR: {message}", file=sys.stderr, flush=True)
    raise SystemExit(1)


def env_path(name, default_relative):
    value = os.environ.get(name)
    if value:
        path = Path(value).expanduser()
        if not path.is_absolute():
            path = Path.cwd() / path
        return path.resolve()
    return (PROJECT_ROOT / default_relative).resolve()


def triangle_count(mesh):
    return sum(max(0, len(poly.vertices) - 2) for poly in mesh.polygons)


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


def apply_object_transform(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    except Exception as exc:
        log(f"WARNING: could not apply transforms to {obj.name}: {exc}")


def parse_glb_counts(path):
    data = path.read_bytes()
    off = 12
    json_bytes = None
    while off < len(data):
        if off + 8 > len(data):
            break
        chunk_len, chunk_type = struct.unpack("<II", data[off:off + 8])
        off += 8
        if chunk_len < 0 or off + chunk_len > len(data):
            break
        chunk_data = data[off:off + chunk_len]
        off += chunk_len
        if chunk_len % 4:
            pad = 4 - (chunk_len % 4)
            if off + pad <= len(data):
                off += pad
        if chunk_type == 0x4E4F534A:
            json_bytes = chunk_data
    if json_bytes is None:
        return None
    text = json_bytes.decode("utf-8").rstrip(" \t\r\n\0")
    g = json.loads(text)
    return {
        "meshes": len(g.get("meshes", []) or []),
        "materials": len(g.get("materials", []) or []),
        "textures": len(g.get("textures", []) or []),
        "images": len(g.get("images", []) or []),
        "nodes": len(g.get("nodes", []) or []),
    }


def main():
    input_path = env_path("AVATAR_INPUT", INPUT_DEFAULT)
    yaw_deg = float(os.environ.get("AVATAR_YAW_DEG", "0"))
    target_tris_env = os.environ.get("AVATAR_TARGET_TRIS", "").strip()
    target_tris = int(target_tris_env) if target_tris_env else 0

    if not input_path.is_file():
        fail(f"input not found: {input_path}")

    log(f"Input: {input_path}")
    log(f"Yaw: {yaw_deg} degrees")
    log(f"Target tris: {target_tris if target_tris > 0 else 'unset (keep all)'}")

    clear_scene()

    log("Importing glTF")
    bpy.ops.import_scene.gltf(filepath=str(input_path), import_pack_images=True)

    mesh_objects = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not mesh_objects:
        fail("import produced no mesh objects")
    mesh_objects.sort(key=lambda o: o.name)
    log(f"Mesh objects: {[o.name for o in mesh_objects]}")

    for obj in mesh_objects:
        apply_object_transform(obj)

    xs, ys, zs = [], [], []
    for obj in mesh_objects:
        for v in obj.data.vertices:
            xs.append(v.co.x)
            ys.append(v.co.y)
            zs.append(v.co.z)
    if not xs:
        fail("meshes have no vertices")
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)
    center_x = (min_x + max_x) * 0.5
    center_y = (min_y + max_y) * 0.5
    height = max_z - min_z
    if height <= 1e-9:
        fail("mesh has zero height")
    scale = TARGET_HEIGHT / height

    log(f"Pre-normalize bbox: x=[{min_x:.6f},{max_x:.6f}] y=[{min_y:.6f},{max_y:.6f}] z=[{min_z:.6f},{max_z:.6f}] height={height:.6f}")

    for obj in mesh_objects:
        mesh = obj.data
        for v in mesh.vertices:
            v.co.x = (v.co.x - center_x) * scale
            v.co.y = (v.co.y - center_y) * scale
            v.co.z = (v.co.z - min_z) * scale
        mesh.update()

    yaw_radians = math.radians(yaw_deg)
    yaw_quaternion = Quaternion((0.0, 0.0, 1.0), yaw_radians)
    for obj in mesh_objects:
        bpy.context.view_layer.update()
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = yaw_quaternion @ obj.rotation_quaternion.copy()
        bpy.context.view_layer.update()
    for obj in mesh_objects:
        apply_object_transform(obj)

    for obj in mesh_objects:
        mesh = obj.data
        result = mesh.validate(verbose=True, clean_customdata=False)
        mesh.update()
        if result:
            fail(f"mesh {obj.name} was invalid; validate repaired geometry (not silently accepted)")
        log(f"Validated mesh {obj.name}: OK")

    for obj in mesh_objects:
        for v in obj.data.vertices:
            if not all(math.isfinite(c) for c in v.co):
                fail(f"non-finite vertex coordinate in {obj.name}: {v.co}")

    total_tris = sum(triangle_count(o.data) for o in mesh_objects)
    log(f"Triangle count before optional decimation: {total_tris}")
    if target_tris > 0 and total_tris > target_tris:
        ratio = target_tris / total_tris
        log(f"Decimating with ratio {ratio:.6f}")
        for obj in mesh_objects:
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            mod = obj.modifiers.new(name="LocalFixDecimate", type="DECIMATE")
            mod.decimate_type = "COLLAPSE"
            mod.ratio = ratio
            mod.use_collapse_triangulate = True
            mod.use_dissolve_boundaries = False
            mod.delimit = {"UV", "SEAM", "MATERIAL", "NORMAL"}
            bpy.ops.object.modifier_apply(modifier=mod.name)
            obj.data.update()
    elif target_tris > 0:
        log(f"Mesh already at or below target ({total_tris} tris); skipping decimation")

    # Restore exact height/base after optional decimation (decimation can perturb z).
    if target_tris > 0:
        zs = [v.co.z for obj in mesh_objects for v in obj.data.vertices]
        if zs:
            min_z = min(zs)
            max_z = max(zs)
            height = max_z - min_z
            if height > 1e-9:
                scale_z = TARGET_HEIGHT / height
                for obj in mesh_objects:
                    for v in obj.data.vertices:
                        v.co.z = (v.co.z - min_z) * scale_z
                    obj.data.update()
                log("Restored exact height after decimation")

    xs, ys, zs = [], [], []
    for obj in mesh_objects:
        for v in obj.data.vertices:
            xs.append(v.co.x)
            ys.append(v.co.y)
            zs.append(v.co.z)
    final_min_x, final_max_x = min(xs), max(xs)
    final_min_y, final_max_y = min(ys), max(ys)
    final_min_z, final_max_z = min(zs), max(zs)
    final_tris = sum(triangle_count(o.data) for o in mesh_objects)

    log(f"Final bbox: x=[{final_min_x:.6f},{final_max_x:.6f}] y=[{final_min_y:.6f},{final_max_y:.6f}] z=[{final_min_z:.6f},{final_max_z:.6f}]")
    log(f"Final triangle count: {final_tris}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    plain_path = OUT_DIR / PLAIN_NAME
    draco_path = OUT_DIR / DRACO_NAME

    for p in (plain_path, draco_path):
        if p.exists():
            p.unlink()

    log("Exporting plain GLB (no Draco)")
    bpy.ops.export_scene.gltf(
        filepath=str(plain_path),
        check_existing=False,
        export_format="GLB",
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_apply=False,
        export_yup=True,
        export_image_format="AUTO",
        export_draco_mesh_compression_enable=False,
    )
    if not plain_path.is_file():
        fail(f"plain export did not create file: {plain_path}")

    log("Exporting Draco-compressed GLB")
    bpy.ops.export_scene.gltf(
        filepath=str(draco_path),
        check_existing=False,
        export_format="GLB",
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_apply=False,
        export_yup=True,
        export_image_format="AUTO",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        export_draco_color_quantization=0,
        export_draco_generic_quantization=12,
    )
    if not draco_path.is_file():
        fail(f"draco export did not create file: {draco_path}")

    log("Rendering preview PNGs")
    scene = bpy.context.scene

    for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES"):
        try:
            scene.render.engine = eng
            log(f"Render engine: {eng}")
            break
        except Exception:
            continue

    scene.render.resolution_x = 900
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    try:
        scene.render.film_transparent = False
    except Exception:
        pass

    world = bpy.data.worlds.get("LocalFixWorld")
    if world is None:
        world = bpy.data.worlds.new("LocalFixWorld")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node is None:
        bg_node = world.node_tree.nodes.new("ShaderNodeBackground")
    bg_node.inputs[0].default_value = (0.12, 0.12, 0.12, 1.0)
    try:
        bg_node.inputs[1].default_value = 1.0
    except Exception:
        pass

    def add_light(name, loc, energy, size=2.0):
        ld = bpy.data.lights.new(name, "AREA")
        ld.energy = energy
        ld.size = size
        ld.color = (1.0, 1.0, 1.0)
        obj = bpy.data.objects.new(name, ld)
        scene.collection.objects.link(obj)
        obj.location = loc
        return obj

    add_light("KeyLight", (2.5, -2.5, 3.0), 1200, 2.0)
    add_light("FillLight", (-2.5, 2.5, 2.0), 400, 2.0)
    add_light("RimLight", (0.0, 2.5, 3.5), 300, 2.0)

    cam_data = bpy.data.cameras.new("LocalFixCam")
    cam_obj = bpy.data.objects.new("LocalFixCam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_data.lens = 50
    try:
        cam_data.clip_start = 0.1
        cam_data.clip_end = 100.0
    except Exception:
        pass

    target_empty = bpy.data.objects.new("LocalFixTarget", None)
    scene.collection.objects.link(target_empty)
    target_empty.location = (0.0, 0.0, TARGET_Z)

    constraint = cam_obj.constraints.new(type="TRACK_TO")
    constraint.target = target_empty
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"

    view_positions = {
        "neg_y": (0.0, -VIEW_DISTANCE, TARGET_Z),
        "pos_y": (0.0, VIEW_DISTANCE, TARGET_Z),
        "pos_x": (VIEW_DISTANCE, 0.0, TARGET_Z),
        "neg_x": (-VIEW_DISTANCE, 0.0, TARGET_Z),
    }

    for view in VIEWS:
        cam_obj.location = view_positions[view]
        bpy.context.view_layer.update()
        out_png = OUT_DIR / f"{view}.png"
        scene.render.filepath = str(out_png)
        bpy.ops.render.render(write_still=True)
        if not out_png.is_file():
            fail(f"render did not create file: {out_png}")
        log(f"Rendered {out_png}")

    plain_counts = parse_glb_counts(plain_path)
    draco_counts = parse_glb_counts(draco_path)

    log("=" * 70)
    log("SUMMARY")
    log(f"Yaw applied: {yaw_deg} degrees")
    log(f"Final triangle count: {final_tris}")
    log(f"Final bbox min: ({final_min_x:.6f}, {final_min_y:.6f}, {final_min_z:.6f})")
    log(f"Final bbox max: ({final_max_x:.6f}, {final_max_y:.6f}, {final_max_z:.6f})")
    log(f"Blender images: {len(bpy.data.images)}; textures: {len(bpy.data.textures)}")
    log(f"Plain GLB: {plain_path}")
    log(f"  size: {plain_path.stat().st_size} bytes")
    log(f"  glb meshes/materials/textures/images/nodes: {plain_counts}")
    log(f"Draco GLB: {draco_path}")
    log(f"  size: {draco_path.stat().st_size} bytes")
    log(f"  glb meshes/materials/textures/images/nodes: {draco_counts}")
    log(f"Previews: {', '.join(str(OUT_DIR / (v + '.png')) for v in VIEWS)}")
    log("=" * 70)

    assert plain_path.is_file() and plain_path.stat().st_size > 0
    assert draco_path.is_file() and draco_path.stat().st_size > 0
    for v in VIEWS:
        assert (OUT_DIR / f"{v}.png").is_file()
    assert abs((final_max_z - final_min_z) - TARGET_HEIGHT) < 1e-5
    assert abs(final_min_z) < 1e-5
    if abs(yaw_deg) < 1e-9 and target_tris == 0:
        assert abs((final_min_x + final_max_x) * 0.5) < 1e-5
        assert abs((final_min_y + final_max_y) * 0.5) < 1e-5
    assert final_tris > 0
    assert len(bpy.data.images) >= 1
    if plain_counts is not None:
        assert plain_counts["images"] >= 1
        assert plain_counts["textures"] >= 1
    if draco_counts is not None:
        assert draco_counts["images"] >= 1
        assert draco_counts["textures"] >= 1
    log("Self-check: PASSED")


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:
        fail(f"unhandled exception: {exc!r}")
