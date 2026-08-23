#!/usr/bin/env python3
"""Remove background from all portrait frames, output transparent PNGs."""
import os
import sys
from pathlib import Path
from rembg import remove
from PIL import Image
import io

SRC = Path("public/portrait-sequence")
DST = Path("public/portrait-cutout")
DST.mkdir(exist_ok=True)

frames = sorted(SRC.glob("frame-*.png"))
print(f"Processing {len(frames)} frames...")

for i, f in enumerate(frames):
    out = DST / f.name
    if out.exists():
        print(f"  [{i+1}/{len(frames)}] skip {f.name}")
        continue
    print(f"  [{i+1}/{len(frames)}] {f.name}...", end=" ", flush=True)
    img = Image.open(f)
    result = remove(img)
    result.save(out, "PNG")
    print("done")

print(f"\nAll done. {len(list(DST.glob('*.png')))} cutout frames in {DST}")
