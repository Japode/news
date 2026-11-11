/* Copies the artboards of the claude.ai Design canvas into design/ as plain static pages
   (JN13), so a build can be compared with them on any machine, offline.

     node scripts/design-export.mjs <folder>

   <folder> holds the canvas as the Artifact tool saves it: project/canvas.json and one
   project/<Name>.dc.html per artboard. Each page keeps the artboard's markup and inline
   styles byte for byte; only the canvas runtime goes (support.js, <x-dc>, <helmet>, the
   data-dc-script block), Google Fonts gives way to the local copy of the font the site
   ships, the uploaded images point at the repo's own files, and the links between
   artboards point at the exported pages. design/pages.json records each page's width. */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..")
const DESIGN = join(REPO, "design")
const FONTS = join(REPO, "node_modules", "@fontsource-variable", "plus-jakarta-sans")

const src = process.argv[2]
if (!src) {
  console.error("usage: node scripts/design-export.mjs <folder holding project/canvas.json>")
  process.exit(2)
}
const project = existsSync(join(src, "project")) ? join(src, "project") : src
const canvas = JSON.parse(readFileSync(join(project, "canvas.json"), "utf8"))

/** Artboard file to exported page name, in the canvas's own order. */
const PAGES = { "Main.dc.html": "home", "Video.dc.html": "video", "ComoFazemos.dc.html": "como-fazemos", "VideoMobile.dc.html": "video-mobile" }

/** The canvas's uploaded assets, by blob id, and the repo file each one is a copy of. */
const BLOBS = {
  e823e65fcd0c38a4a40dccad6e716b8d: "public/logo.svg",
  ed7f50d3a0e5363b27181acd903ac5ad: "content/videos/scion-anthropic/thumbnail.jpg",
  "01d6019a19f868792a772bcfb25b961a": "content/videos/o-que-e-docker/thumbnail.jpg",
  eee55799d6d830aa82c8d2942a2e010f: "design/assets/viglet.svg",
}

for (const name of canvas.order) {
  if (!PAGES[name]) {
    console.error(`${name} is an artboard this script does not know: add it to PAGES`)
    process.exit(1)
  }
}

mkdirSync(join(DESIGN, "assets", "fonts"), { recursive: true })

// Viglet's mark, which no other file in the repo holds yet: copied, never redrawn
const VIGLET_MARK = join(REPO, "..", "..", "alegauss", "visibility", "marca", "logo", "viglet.svg")
if (existsSync(VIGLET_MARK)) copyFileSync(VIGLET_MARK, join(DESIGN, "assets", "viglet.svg"))
else if (!existsSync(join(DESIGN, "assets", "viglet.svg"))) throw new Error(`Viglet's mark is neither at ${VIGLET_MARK} nor in design/assets/`)

// the font: the same files the site ships, renamed to the family the artboards ask for
const fontCss = readFileSync(join(FONTS, "index.css"), "utf8")
const faces = [...fontCss.matchAll(/@font-face\s*{[^}]*}/g)].map((m) => m[0]).filter((f) => /font-style:\s*normal/.test(f))
const fontFiles = faces.flatMap((f) => [...f.matchAll(/\.\/files\/([^)]+\.woff2)/g)].map((m) => m[1]))
for (const file of fontFiles) copyFileSync(join(FONTS, "files", file), join(DESIGN, "assets", "fonts", file))
copyFileSync(join(FONTS, "LICENSE"), join(DESIGN, "assets", "fonts", "LICENSE"))
const fontVersion = JSON.parse(readFileSync(join(FONTS, "package.json"), "utf8")).version
writeFileSync(
  join(DESIGN, "assets", "fonts.css"),
  `/* Plus Jakarta Sans ${fontVersion} from @fontsource-variable, the files the site ships (JN13). */\n` +
    faces
      .map((f) => f.replace(/font-family:\s*'[^']+'/, "font-family: 'Plus Jakarta Sans'").replace(/\.\/files\//g, "fonts/").replace(/\s*font-display:[^;]+;/, ""))
      .join("\n") +
    "\n",
)

const pages = []
for (const name of canvas.order) {
  const page = PAGES[name]
  const board = canvas.boards[name]
  let html = readFileSync(join(project, name), "utf8")

  html = html
    .replace(/<script src="\.\/support\.js"><\/script>\n?/, '<meta name="viewport" content="width=device-width, initial-scale=1">\n<link rel="stylesheet" href="assets/fonts.css">\n')
    .replace(/<script type="text\/x-dc"[\s\S]*?<\/script>\n?/, "")
    .replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n?/g, "")
    .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^"]*">\n?/g, "")
    .replace(/<\/?x-dc>\n?/g, "")
    .replace(/<\/?helmet>\n?/g, "")
    .replace(/\/_blob\/([0-9a-f]{32})/g, (whole, id) => {
      if (!BLOBS[id]) throw new Error(`${name} uses the upload ${id}, which BLOBS does not map to a repo file`)
      return relative(DESIGN, join(REPO, BLOBS[id])).replaceAll("\\", "/")
    })
    .replace(/(href=")([A-Za-z]+)\.dc\.html/g, (whole, attr, board) => `${attr}${PAGES[`${board}.dc.html`] ?? board}.html`)

  writeFileSync(join(DESIGN, `${page}.html`), html)
  pages.push({ page, artboard: name, title: board.title, width: board.w, height: board.h })
}

writeFileSync(join(DESIGN, "pages.json"), JSON.stringify({ canvas: canvas.title, pages }, null, 2) + "\n")
console.log(`design/: ${pages.map((p) => `${p.page}.html (${p.width})`).join(", ")}`)
