[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/romafitos/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/romafitos/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Palm City Heat — multi-panel cover maker

An offline browser app that turns a person's photo and a caption into
a neon-sunset multi-panel cover — the poster look of a coastal crime
saga, built for the
[make.fun bounty](https://make.fun/bounty/gta6-cover-art-01). Load a
photo, pick a layout and a grade, write the words, and export the
cover as a PNG in landscape, portrait, or square.

## What it does

- **Three-panel champion layout** ("Vice Hero + Story"): a large
  vivid hero photo, a labelled pier panel, and a procedurally drawn
  marina scene — skyline, slatted sun, water, reflection, and
  sailboats, all painted by canvas code from a seed. City seed 42.
- **Face-safe anchor cropping**: each photo's face anchor is placed
  at the panel centre and clamped, so heads stay whole at every
  export size. Hero anchor (0.46, 0.19); pier anchor (0.40, 0.22).
- **Vivid Sunset grade** plus four more grades (Sepia Duotone,
  Halftone Pop, Clean Daylight, Grain Noir) and five layouts.
- **Genre lettering**: a gradient title with outline and drop
  shadow, a script subtitle, a quote strip, panel labels with place,
  time, and tagline, badges (WANTED pill, EST. 2026 starburst,
  VOL. 06 chip, COLLECTOR'S EDITION ribbon), and a bottom strip
  with palm silhouettes, tagline, fine print, and barcode.
- **One-click export** of the current cover, or all three sizes at
  once. The preview and the export render through the same
  compositor, so what is seen is what the PNG holds.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests: every script, style, font, and
image is a file inside `app/`. The three display fonts (Anton,
Archivo Black, Pacifico) are shipped under the SIL Open Font
License, with each font's licence text beside it in `app/fonts/`.
The two sample photos in `app/samples/` were made for make.fun and
are free to use.

## Build the dossier

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output
directory and writes `dossier.json` with the vendored make.fun
library.

## Layout of the repo

- `app/index.html` — the editor shell
- `app/style.css` — the dark neon editorial theme
- `app/src/presets.js` — grades, layouts, sizes, champion settings
- `app/src/cover.js` — the compositor (panels, treatments, export)
- `app/src/lettering.js` — title, script, quote, labels, badges, strip
- `app/src/skyline.js` — seeded skyline backdrop and marina scene
- `app/src/halftone.js` — seeded RNG, halftone fields, palms, barcode
- `app/src/shots.js` — deterministic screenshot scenes
- `app/src/main.js` — editor wiring and the headless export hook
- `app/fonts/` — Anton, Archivo Black, Pacifico + OFL texts
- `app/samples/` — the kit's two sample photos
- `screenshots/` — the cover, the editor, and the portrait/square exports
- `vendor/makefun-app.ts` — the kit's dossier builder, unchanged

## License

MIT — see [LICENSE](LICENSE).
