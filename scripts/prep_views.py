#!/usr/bin/env python3
"""Prepare normalized 1024x1024 transparent avatar views from the turnaround sheet."""

from pathlib import Path

from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
TURNAROUND = ROOT / "assets" / "avatar-ref" / "turnaround.jpg"
PORTRAIT = ROOT / "assets" / "avatar-ref" / "portrait.webp"
OUT_DIR = ROOT / "assets" / "avatar-ref" / "cropped"
CANVAS = 1024
SAFE_AREA = CANVAS * 0.9  # 921.6 px: 5% margin on every side
ALPHA_NOISE_THRESHOLD = 12
MIN_MARGIN = 48
INSET = 2


def clean_matte(image: Image.Image) -> Image.Image:
    """Zero out near-transparent matte noise while preserving soft edges."""
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    red, green, blue, alpha = image.split()
    alpha = alpha.point(lambda value: 0 if value < ALPHA_NOISE_THRESHOLD else value)
    return Image.merge("RGBA", (red, green, blue, alpha))


def trim_and_center(image: Image.Image, out_path: Path) -> None:
    image = clean_matte(image)

    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= ALPHA_NOISE_THRESHOLD else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise RuntimeError(f"No non-transparent pixels found for {out_path}")

    # Trim strictly to the alpha bounding box first.
    trimmed = image.crop(bbox)
    source_width, source_height = trimmed.size

    # Scale to fit inside the 90% safe area, preserving aspect ratio.
    scale = min(SAFE_AREA / source_width, SAFE_AREA / source_height)
    target_width = max(1, int(round(source_width * scale)))
    target_height = max(1, int(round(source_height * scale)))
    resized = trimmed.resize((target_width, target_height), Image.LANCZOS)
    resized = clean_matte(resized)

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    paste_x = (CANVAS - resized.width) // 2
    paste_y = (CANVAS - resized.height) // 2
    canvas.paste(resized, (paste_x, paste_y), resized)
    canvas.save(out_path, "PNG")

    verify_output(out_path)


def verify_output(out_path: Path) -> None:
    with Image.open(out_path) as saved:
        saved = saved.convert("RGBA")
        alpha = saved.getchannel("A").point(
            lambda value: 255 if value >= ALPHA_NOISE_THRESHOLD else 0
        )
        bbox = alpha.getbbox()
        if bbox is None:
            raise RuntimeError(f"No non-transparent pixels after save: {out_path}")
        left, top, right, bottom = bbox
        margins = (left, top, CANVAS - right, CANVAS - bottom)
        if any(margin < MIN_MARGIN for margin in margins):
            raise RuntimeError(
                f"Insufficient margin in {out_path}: bbox={bbox}, margins={margins}"
            )
        print(
            f"verified: {out_path.name} bbox={bbox} "
            f"margins(left,top,right,bottom)={margins}"
        )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    written = []

    with Image.open(TURNAROUND) as source:
        source = source.convert("RGB")
        width, height = source.size
        top_height = height // 2
        top = source.crop((0, 0, width, top_height))
        column_width = top.width // 4
        names = ["front", "side", "three_quarter", "back"]

        for index, name in enumerate(names):
            left = index * column_width + INSET
            right = (index + 1) * column_width - INSET
            column = top.crop((left, INSET, right, top_height - INSET))
            removed = remove(column)
            out_path = OUT_DIR / f"{name}.png"
            trim_and_center(removed, out_path)
            written.append(out_path)

    with Image.open(PORTRAIT) as source:
        portrait = source.convert("RGBA")
        out_path = OUT_DIR / "portrait_clean.png"
        trim_and_center(portrait, out_path)
        written.append(out_path)

    for path in written:
        print(f"written: {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()