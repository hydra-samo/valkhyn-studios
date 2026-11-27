# Asset credits — VALKHYN portfolio

Atmosphere media only. No client work, invented projects or demos are represented here.
All files are stored locally under `public/`, so the site has no runtime dependency on a stock host.
Attribution is not required by either licence; the links below record provenance.

## Supplied media

The About portrait (`public/portrait/about.webp` and `about-600.webp`) was supplied
by the studio owner as a transparent PNG. It was resized to 4:5, flattened on the
brand abyssal slate `#060c09`, and exported as WebP at 1000w and 600w. No stock
licence applies.

## Stock video

### Mixkit — Stock Video Free License

Licence: https://mixkit.co/license/#videoFree (modal: https://mixkit.co/license/modal/videoFree/).
The item page states: “Download this free stock video clip for commercial or personal use, under the Mixkit Stock Video Free License.”
The Free License modal adds: “Items under the Mixkit Stock Video Free License can be used in your commercial and non-commercial projects, for free. You’re permitted to download, copy, modify, distribute, publicly perform and broadcast the Items. Your rights are non-exclusive, worldwide, sub-licensable and ongoing. Attribution is not required, however, we would appreciate it if you credit Mixkit where reasonably possible.”

| Local file | Source | Mixkit item |
| --- | --- | --- |
| `public/video/studio-process.mp4` / `.jpg` | https://assets.mixkit.co/videos/50610/50610-720.mp4 | “Computer screen view of the work on a video editing software” (item 50610) — https://mixkit.co/free-stock-video/computer-screen-view-of-the-work-on-a-video-editing-50610/ |

### Pexels — Pexels License

Licence: https://www.pexels.com/license/ — free for commercial use, attribution not required.

| Local file | Source | Pexels item |
| --- | --- | --- |
| `public/video/video-motion.mp4` / `.jpg` | https://videos.pexels.com/video-files/29237633/12617477_1920_1080_25fps.mp4 | “Digital artist using stylus on graphics tablet” (item 29237633) — https://www.pexels.com/video/digital-artist-using-stylus-on-graphics-tablet-29237633/ |
| `public/video/video-voice.mp4` / `.jpg` | https://videos.pexels.com/video-files/13283744/13283744-uhd_2560_1440_25fps.mp4 | “Close-up of a microphone and a pop filter in a recording studio” (item 13283744) — https://www.pexels.com/video/close-up-of-a-microphone-and-a-pop-filter-in-a-recording-studio-13283744/ |

Both replacement reels keep their real colours with only a light cleanup grade,
are trimmed to 8 seconds, scaled to 1280×720 / 25 fps, and exported without audio.
The first hero reel (`studio-process.mp4`) is the original Mixkit clip, unchanged.

> Licence note: Mixkit items 26527 and 13015 were evaluated but **not used** — their free 720p
> downloads are labelled “Free Download - 720p Version for Personal Use only”, and the
> Restricted License modal (https://mixkit.co/license/modal/videoRestricted/) states:
> “Items under the Mixkit Stock Video Restricted License can be used in personal projects only.”

## Stock photography — Pexels License

Licence: https://www.pexels.com/license/ — free for commercial use, attribution not required.

| Local file | Source | Subject |
| --- | --- | --- |
| `public/images/service-video.jpg` | https://images.pexels.com/photos/30229850/pexels-photo-30229850.jpeg?auto=compress&cs=tinysrgb&w=1600 | professional editing workspace with a control keyboard and scope monitor (item 30229850) — https://www.pexels.com/photo/professional-video-editing-workspace-with-keyboard-30229850/ |
| `public/images/service-motion.jpg` | frame from Pexels video item 29237633 (source above) | designer’s hand and stylus on a graphics tablet, kept in colour |
| `public/images/service-voice.jpg` | https://images.pexels.com/photos/10933702/pexels-photo-10933702.jpeg?auto=compress&cs=tinysrgb&w=1600 | condenser microphone on a boom in a treated studio (item 10933702) |
| `public/images/service-delivery.jpg` | https://images.pexels.com/photos/40097767/pexels-photo-40097767.jpeg?auto=compress&cs=tinysrgb&w=1600 | organised desk with external storage devices (item 40097767) — https://www.pexels.com/photo/organized-desk-with-external-storage-devices-40097767/ |

All four stills keep their real colours with only a light cleanup grade. Each has
two locally art-directed crops: a 16:9 file for desktop/tablet and a 4:3 file for
phones, selected by `<source media>` in `Services.tsx`. This keeps the subject
inside the frame at every breakpoint instead of relying on a hard `cover` crop.
No glow, gradient or green wash was added. No stock credit links are rendered in
the public footer.
