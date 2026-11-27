#!/usr/bin/env python3
"""Headless Blender cleanup for the Valkhyn avatar.

Run as:
    blender --background --python scripts/clean_avatar.py

Environment overrides:
    AVATAR_INPUT       Source glTF/glb (default: <repo>/assets/avatar-ref/raw_avatar.glb)
    AVATAR_OUTPUT      Destination glb (default: <repo>/public/models/avatar.glb)
    AVATAR_YAW_DEG     Extra yaw in degrees around the vertical axis (default: 180)
    AVATAR_SELF_CHECK  Set to 1 to run internal assertions and exit
"""

import math
import os
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Quaternion, Vector

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CHARCOAL = (0x16 / 255.0, 0x16 / 255.0, 0x1A / 255.0)
TARGET_TRIANGLES = 30000
MAX_TEXTURE_SIZE = 1024
MERGE_DISTANCE = 0.0001
TARGET_HEIGHT = 1.75


def log(message):
    print(f"[clean_avatar] {message}", flush=True)


def fail(message):
    print(f"[clean_avatar] ERROR: {message}", file=sys.stderr, flush=True)
    raise SystemExit(1)


def env_path(name, default_relative):
    value = os.environ.get(name)
    if value:
        path = Path(value).expanduser()
        if not path.is_absolute():
            path = Path.cwd() / path
        return path.resolve()
    return (PROJECT_ROOT / default_relative).resolve()


def srgb_luminance(rgb):
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]


MIN_LUMINANCE = srgb_luminance(CHARCOAL)


def lift_color(color):
    """Lift an RGBA color so its luminance is at least MIN_LUMINANCE."""
    rgb = [float(c) for c in color[:3]]
    alpha = float(color[3]) if len(color) > 3 else 1.0
    luminance = srgb_luminance(rgb)
    if luminance >= MIN_LUMINANCE:
        return (rgb[0], rgb[1], rgb[2], alpha)
    if luminance <= 1e-8:
        return (CHARCOAL[0], CHARCOAL[1], CHARCOAL[2], alpha)
    factor = MIN_LUMINANCE / luminance
    return (
        min(1.0, rgb[0] * factor),
        min(1.0, rgb[1] * factor),
        min(1.0, rgb[2] * factor),
        alpha,
    )


def lift_image_dark_pixels(image):
    """Lift dark pixels in an image in place."""
    if image is None or not image.has_data:
        return
    width, height = image.size
    if width <= 0 or height <= 0:
        return
    channels = max(1, int(image.channels))
    pixels = list(image.pixels)
    if not pixels:
        return
    changed = False
    for offset in range(0, len(pixels), channels):
        if channels == 1:
            value = float(pixels[offset])
            luminance = value
            if luminance < MIN_LUMINANCE:
                pixels[offset] = max(value, MIN_LUMINANCE)
                changed = True
            continue
        if channels == 2:
            continue
        if channels >= 3:
            rgb = [float(pixels[offset + i]) for i in range(3)]
            luminance = srgb_luminance(rgb)
            if luminance < MIN_LUMINANCE:
                if luminance <= 1e-8:
                    new_rgb = list(CHARCOAL)
                else:
                    factor = MIN_LUMINANCE / luminance
                    new_rgb = [min(1.0, c * factor) for c in rgb]
                for i in range(3):
                    pixels[offset + i] = new_rgb[i]
                changed = True
    if changed:
        image.pixels = pixels
        image.update()


def downscale_image(image, max_size=MAX_TEXTURE_SIZE):
    """Downscale an image in place, preserving aspect ratio."""
    if image is None or not image.has_data:
        return
    width, height = image.size
    if width <= 0 or height <= 0 or max(width, height) <= max_size:
        return
    if width >= height:
        new_width = max_size
        new_height = max(1, int(round(height * max_size / width)))
    else:
        new_height = max_size
        new_width = max(1, int(round(width * max_size / height)))
    try:
        image.scale(new_width, new_height)
    except Exception as exc:
        log(f"WARNING: could not scale image {image.name}: {exc}")
        return
    image.update()


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


def triangle_count(mesh):
    return sum(max(0, len(polygon.vertices) - 2) for polygon in mesh.polygons)


def collect_base_color_image_nodes(bsdf, node_tree):
    """Find Image Texture nodes feeding the Principled Base Color input."""
    base_socket = bsdf.inputs.get("Base Color")
    if base_socket is None:
        return []
    found = set()
    visited = set()

    def visit(socket):
        for link in node_tree.links:
            if link.to_socket is not socket:
                continue
            node = link.from_node
            if node in visited:
                continue
            visited.add(node)
            if node.type == "TEX_IMAGE" and getattr(node, "image", None) is not None:
                found.add(node)
            else:
                for input_socket in node.inputs:
                    visit(input_socket)

    visit(base_socket)
    return list(found)


def is_special_material(material, bsdf):
    """Detect glossy/metal/lens/sunglasses materials that must not be washed out."""
    name = (material.name or "").lower()
    keywords = (
        "metal",
        "gloss",
        "glass",
        "lens",
        "sunglass",
        "chrome",
        "mirror",
        "visor",
        "reflect",
    )
    if any(keyword in name for keyword in keywords):
        return True

    def socket_value(socket_name, default=0.0):
        socket = bsdf.inputs.get(socket_name)
        if socket is None or socket.is_linked:
            return default
        try:
            value = socket.default_value
            if hasattr(value, "__len__") and not isinstance(value, str):
                value = value[0] if len(value) else default
            return float(value)
        except (TypeError, ValueError):
            return default

    if socket_value("Metallic") >= 0.35:
        return True
    if socket_value("Transmission Weight") >= 0.05:
        return True
    if socket_value("Coat Weight") >= 0.5:
        return True

    for node in material.node_tree.nodes:
        if node.type == "TEX_IMAGE" and getattr(node, "image", None) is not None:
            image_name = (node.image.name or "").lower()
            if any(keyword in image_name for keyword in keywords):
                return True
    return False


def process_materials():
    processed_images = set()
    for material in list(bpy.data.materials):
        if not material.use_nodes or material.node_tree is None:
            continue
        bsdf = None
        for node in material.node_tree.nodes:
            if node.type == "BSDF_PRINCIPLED":
                bsdf = node
                break
        if bsdf is None:
            continue

        special = is_special_material(material, bsdf)
        if special:
            log(f"Skipping washout fix for special material: {material.name}")
            continue

        base_socket = bsdf.inputs.get("Base Color")
        if base_socket is not None:
            image_nodes = collect_base_color_image_nodes(bsdf, material.node_tree)
            if image_nodes:
                for image_node in image_nodes:
                    image = image_node.image
                    if image is not None and image.name not in processed_images:
                        lift_image_dark_pixels(image)
                        processed_images.add(image.name)
            else:
                base_socket.default_value = lift_color(base_socket.default_value)

        roughness_socket = bsdf.inputs.get("Roughness")
        if roughness_socket is not None and not roughness_socket.is_linked:
            roughness_socket.default_value = 0.68

        specular_socket = bsdf.inputs.get("Specular IOR Level")
        if specular_socket is not None and not specular_socket.is_linked:
            specular_socket.default_value = 0.3

        ior_socket = bsdf.inputs.get("IOR")
        if ior_socket is not None and not ior_socket.is_linked:
            ior_socket.default_value = 1.45


def downscale_textures():
    for image in list(bpy.data.images):
        downscale_image(image, MAX_TEXTURE_SIZE)


def run_self_check():
    assert abs(srgb_luminance(lift_color((0.0, 0.0, 0.0, 1.0))[:3]) - MIN_LUMINANCE) < 1e-9
    assert lift_color((0.0, 0.0, 0.0, 1.0))[:3] == CHARCOAL
    assert lift_color((1.0, 1.0, 1.0, 1.0))[:3] == (1.0, 1.0, 1.0)
    log("Self-check passed")
    raise SystemExit(0)


def main():
    if os.environ.get("AVATAR_SELF_CHECK") == "1":
        run_self_check()

    input_path = env_path("AVATAR_INPUT", "assets/avatar-ref/raw_avatar.glb")
    output_path = env_path("AVATAR_OUTPUT", "public/models/avatar.glb")
    yaw_deg = float(os.environ.get("AVATAR_YAW_DEG", "180"))

    if not input_path.is_file():
        fail(f"raw input not found: {input_path}")

    log(f"Input: {input_path}")
    log(f"Output: {output_path}")
    log(f"Yaw correction: {yaw_deg} degrees")

    clear_scene()

    log("Importing glTF")
    bpy.ops.import_scene.gltf(
        filepath=str(input_path),
        import_pack_images=True,
        merge_vertices=False,
    )

    all_objects = list(bpy.context.scene.objects)
    if yaw_deg:
        yaw_radians = math.radians(yaw_deg)
        yaw_quaternion = Quaternion((0.0, 0.0, 1.0), yaw_radians)
        for obj in all_objects:
            if obj.type in {"MESH", "ARMATURE"}:
                bpy.context.view_layer.update()
                before = (obj.matrix_world @ Vector((0.0, 1.0, 0.0))) - (obj.matrix_world @ Vector((0.0, 0.0, 0.0)))
                obj.rotation_mode = "QUATERNION"
                obj.rotation_quaternion = yaw_quaternion @ obj.rotation_quaternion.copy()
                bpy.context.view_layer.update()
                after = (obj.matrix_world @ Vector((0.0, 1.0, 0.0))) - (obj.matrix_world @ Vector((0.0, 0.0, 0.0)))
                log(f"Yaw {yaw_deg}: {obj.name} world +Y {tuple(round(v, 4) for v in before)} -> {tuple(round(v, 4) for v in after)}")
    for obj in all_objects:
        apply_object_transform(obj)

    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not mesh_objects:
        fail("import produced no mesh objects")

    mesh_objects.sort(key=lambda obj: obj.name)

    log(f"Joining {len(mesh_objects)} mesh object(s)")
    for obj in mesh_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objects[0]
    bpy.ops.object.join()
    avatar = bpy.context.view_layer.objects.active
    if avatar is None or avatar.type != "MESH":
        fail("mesh join failed")

    log("Cleaning mesh geometry")
    bpy.ops.object.select_all(action="DESELECT")
    avatar.select_set(True)
    bpy.context.view_layer.objects.active = avatar
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.delete_loose(use_verts=True, use_edges=True, use_faces=False)
    bpy.ops.mesh.remove_doubles(
        threshold=MERGE_DISTANCE,
        use_unselected=True,
        use_centroid=True,
    )
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    avatar.data.update()

    mesh = avatar.data
    vertices = mesh.vertices
    if not vertices:
        fail("mesh has no vertices")
    xs = [v.co.x for v in vertices]
    ys = [v.co.y for v in vertices]
    zs = [v.co.z for v in vertices]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)
    center_x = (min_x + max_x) * 0.5
    center_y = (min_y + max_y) * 0.5
    height = max_z - min_z
    if height <= 1e-9:
        fail("mesh has zero height")
    scale = TARGET_HEIGHT / height
    for vertex in vertices:
        vertex.co.x = (vertex.co.x - center_x) * scale
        vertex.co.y = (vertex.co.y - center_y) * scale
        vertex.co.z = (vertex.co.z - min_z) * scale
    mesh.update()

    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")

    log(f"Triangle count before decimation: {triangle_count(mesh)}")

    log("Fixing materials and textures")
    process_materials()
    downscale_textures()

    current_triangles = triangle_count(avatar.data)
    if current_triangles > TARGET_TRIANGLES and current_triangles > 0:
        ratio = TARGET_TRIANGLES / current_triangles
        log(f"Decimating with ratio {ratio:.6f}")
        modifier = avatar.modifiers.new(name="CleanAvatarDecimate", type="DECIMATE")
        modifier.decimate_type = "COLLAPSE"
        modifier.ratio = ratio
        modifier.use_collapse_triangulate = True
        modifier.use_dissolve_boundaries = False
        modifier.delimit = {"UV", "SEAM", "MATERIAL", "NORMAL"}
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        avatar.data.update()
    elif current_triangles <= TARGET_TRIANGLES:
        log(f"Mesh already at or below target ({current_triangles} triangles); skipping decimation")

    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")

    # Validate and repair mesh geometry before export.
    log("Validating mesh geometry before export")
    mesh = avatar.data
    validate = getattr(mesh, "validate", None)
    if callable(validate):
        validation_result = None
        for attempt in range(2):
            try:
                validation_result = validate(verbose=True, clean_customdata=(attempt > 0))
            except TypeError:
                validation_result = validate()
            mesh.update()
            if not validation_result:
                break
            log(f"Mesh validation corrected invalid geometry on pass {attempt + 1}")
        else:
            fail("mesh remained invalid after validation/cleanup")
    else:
        # Fallback for Blender builds without Mesh.validate.
        bm = bmesh.new()
        bm.from_mesh(mesh)
        if not bm.is_valid:
            for face in list(bm.faces):
                if len(face.verts) < 3:
                    bm.faces.remove(face)
            bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.0)
            bm.to_mesh(mesh)
            mesh.update()
            bm.free()
            bm = bmesh.new()
            bm.from_mesh(mesh)
            if not bm.is_valid:
                bm.free()
                fail("mesh remained invalid after fallback cleanup")
            bm.free()
        else:
            bm.free()

    # Finite-coordinate check.
    for vertex in mesh.vertices:
        if not all(math.isfinite(component) for component in vertex.co):
            fail(f"mesh contains non-finite vertex coordinates: {vertex.co}")

    final_triangles = triangle_count(avatar.data)
    log(f"Final triangle count: {final_triangles}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    props = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
    draco_candidates = (
        "export_draco_mesh_compression_enable",
        "export_draco_mesh_compression_enabled",
        "draco_mesh_compression_enable",
    )
    draco_key = next((key for key in draco_candidates if key in props), None)
    if draco_key is None:
        fail(
            "Blender glTF exporter does not expose a known Draco enable property; "
            "refusing to export uncompressed"
        )

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
    log(f"Output file: {output_path}")
    log(f"Output size: {size_bytes} bytes ({size_bytes / (1024 * 1024):.6f} MB)")
    log(f"Final triangle count: {final_triangles}")


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:
        fail(f"unhandled exception: {exc!r}")
