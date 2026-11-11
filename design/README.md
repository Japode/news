# design/

The site's reference: the artboards of the claude.ai Design canvas "Japode news — proposta
de site", copied here as plain static pages, and a PNG of each page rendered from them. Every
page task of block D (JN13 to JN24) is measured against these files.

The canvas is private. The Alexandre has its link, which stays out of this public repo.

| File | What it is |
|---|---|
| `home.html`, `video.html`, `como-fazemos.html`, `video-mobile.html` | One page per artboard (Início, Página do vídeo, Como fazemos, Página do vídeo — celular) |
| `pages.json` | Each page's artboard, title and width (1280, or 390 for the phone) |
| `assets/fonts.css`, `assets/fonts/` | Plus Jakarta Sans, the same `@fontsource-variable` files the site ships, so the reference renders offline and with the site's font |
| `assets/viglet.svg` | Viglet's mark, copied from visibility's `marca/logo/viglet.svg`, never redrawn |
| `baseline/<page>-<width>.png` | The page rendered by headless Chromium at its width, device scale 1, full height |

The pages keep the artboards' markup and inline styles byte for byte. The export removes only
the canvas runtime (`support.js`, `<x-dc>`, `<helmet>`, the `data-dc-script` block). It
replaces Google Fonts with `assets/fonts.css`. It points the uploaded images at the repo's own
files: `public/logo.svg`, the thumbnails in `content/videos/` and `assets/viglet.svg`. It
also rewrites the links between artboards to the exported pages.

## When the canvas changes

1. Save the canvas's files with the Artifact tool (`read` with the paths `project/canvas.json`
   and every `project/*.dc.html`). That gives a folder holding `project/`.
2. `npm run design:export -- <that folder>` rewrites the pages, `pages.json` and the font copy.
   A new artboard, or an image uploaded to the canvas, stops the export until
   `scripts/design-export.mjs` maps it (`PAGES`, `BLOBS`).
3. `npm run design:baseline` renders the PNGs again with the Chromium of the pinned
   `playwright` in `package.json`.
4. Commit the export and the baselines together, as one design change.

A baseline is regenerated only with a new export of the canvas, never to make a failing page
pass. When the site and a baseline disagree, the site is the one to fix, unless the canvas
itself changed.
