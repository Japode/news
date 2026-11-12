/* The visual gate (JN14): measures the built site against the artboards in design/.

     npm run visual            # after npm run build
     npm run visual -- --self  # proves the gate: the reference against itself, then a 1px shift

   Both sides are rendered live, in the same headless Chromium of the pinned Playwright: the
   reference page from design/<page>.html, the site from dist/ over a local server. So the
   comparison never depends on how one OS rasterises a font, and the PNGs in
   design/baseline/ stay the human-readable record of the canvas.

   design/regions.json names, per page, the regions to compare: a selector in the reference
   (which stays byte for byte the canvas's) and data-design="<name>" on the site.
   - tier "pixels": the two element screenshots must be the same size and differ in no
     pixel past pixelmatch's anti-aliasing threshold; the diff PNG goes to visual-report/.
   - tier "layout": the element's x, width, the gap above it, and its computed type,
     colour, background, border, radius and padding must match, lengths within 1px. The
     copy differs between the mock and the real article, so the height is not compared.
   A region is checked once "enforced" is true; the page tasks of block D turn theirs on. */

import { createServer } from "node:http"
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, extname, join, normalize } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { chromium } from "playwright"
import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..")
const DESIGN = join(REPO, "design")
const DIST = join(REPO, "dist")
const REPORT = join(REPO, "visual-report")
const SELF = process.argv.includes("--self")

const { pages } = JSON.parse(readFileSync(join(DESIGN, "regions.json"), "utf8"))

/** Computed properties a layout region must share with its artboard. */
const STYLE = [
  "fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "textTransform", "color",
  "backgroundColor", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
  "borderTopColor", "borderTopStyle", "borderRadius",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
]
const LENGTH = /^-?\d+(\.\d+)?px$/
const TOLERANCE = 1

// --- serving dist/ the way GitHub Pages does: /path/ is /path/index.html
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json", ".txt": "text/plain", ".xml": "application/xml" }
function serve(root) {
  const server = createServer((req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "")
    let file = join(root, path)
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html")
    if (!file.startsWith(root) || !existsSync(file)) {
      res.writeHead(404)
      return res.end()
    }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" })
    res.end(readFileSync(file))
  })
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)))
}

async function open(browser, url, width, css) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
  // the site is measured on its own: a request to another host (the Japode Ads banner,
  // drawn at random and never compared) would change the layout mid-capture
  if (url.startsWith("http://127.0.0.1")) await page.route((u) => u.hostname !== "127.0.0.1", (route) => route.abort())
  await page.goto(url, { waitUntil: "load" })
  if (css) await page.addStyleTag({ content: css })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((ok) => img.addEventListener("load", ok, { once: true })))))
  })
  return page
}

/** The box and computed style of the first element a selector matches, or null. */
const measure = (page, selector) =>
  page.evaluate(
    ({ selector, STYLE }) => {
      const el = document.querySelector(selector)
      if (!el) return null
      const box = el.getBoundingClientRect()
      // the nearest sibling before it that renders: a <script>, or a block a width hides, has no box
      let prev = el.previousElementSibling
      while (prev && prev.getClientRects().length === 0) prev = prev.previousElementSibling
      const cs = getComputedStyle(el)
      const style = Object.fromEntries(STYLE.map((p) => [p, cs[p]]))
      style.fontFamily = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim().toLowerCase()
      return {
        x: box.left + scrollX,
        width: box.width,
        // the space above it: only where the sibling before sits above, not beside it in a row
        gap: prev && prev.getBoundingClientRect().bottom <= box.top + 1 ? box.top - prev.getBoundingClientRect().bottom : null,
        style,
      }
    },
    { selector, STYLE },
  )

function compareLayout(ref, site) {
  const diffs = []
  for (const k of ["x", "width", "gap"]) {
    // the gap is to the element before; where either side has none (a kicker a video's
    // data lacks yet), there is no spacing to compare
    if (ref[k] === null || site[k] === null) continue
    if (ref[k] === null || site[k] === null || Math.abs(ref[k] - site[k]) > TOLERANCE) diffs.push(`${k} ${fmt(site[k])}, artboard ${fmt(ref[k])}`)
  }
  for (const p of STYLE) {
    const a = ref.style[p]
    const b = site.style[p]
    const same = LENGTH.test(a) && LENGTH.test(b) ? Math.abs(parseFloat(a) - parseFloat(b)) <= TOLERANCE : a === b
    if (!same) diffs.push(`${p} ${b}, artboard ${a}`)
  }
  return diffs
}
const fmt = (n) => (n === null ? "none" : `${Math.round(n * 10) / 10}px`)

/** Moves an element up by the fraction of a pixel its top sits at, so its glyphs land on
    the same sub-pixel grid on both sides. The content above a region differs (the mock
    copy against the real article), and a footer that starts at y .34 on one page and .17
    on the other rasterises its text a few pixels apart while being drawn identically. */
const snap = (page, selector) =>
  page.evaluate((selector) => {
    const el = document.querySelector(selector)
    const top = el.getBoundingClientRect().top + scrollY
    const frac = top - Math.floor(top)
    if (!frac) return
    if (getComputedStyle(el).position === "static") el.style.position = "relative"
    el.style.top = `${(parseFloat(getComputedStyle(el).top) || 0) - frac}px`
  }, selector)

/** The element's whole pixels only: its box, snapped to the grid, cut to whole rows and
    columns, so a fractional height does not end the capture on a row blended with whatever
    sits below it, which differs between the artboard and the site. */
async function whole(page, selector) {
  const box = await page.evaluate((selector) => {
    const r = document.querySelector(selector).getBoundingClientRect()
    return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), width: Math.floor(r.width), height: Math.floor(r.height) }
  }, selector)
  return page.screenshot({ clip: box, fullPage: true })
}

async function comparePixels(refPage, refSel, sitePage, siteSel, out) {
  await snap(refPage, refSel)
  await snap(sitePage, siteSel)
  const a = PNG.sync.read(await whole(refPage, refSel))
  const b = PNG.sync.read(await whole(sitePage, siteSel))
  if (a.width !== b.width || a.height !== b.height) return [`size ${b.width}x${b.height}, artboard ${a.width}x${a.height}`]
  const diff = new PNG({ width: a.width, height: a.height })
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 })
  if (!n) return []
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, PNG.sync.write(diff))
  return [`${n} pixels differ (${out.slice(REPO.length + 1).replaceAll("\\", "/")})`]
}

/** Runs every region of every page; the site side is `siteUrl(page)` and its selector `siteSel(region)`. */
async function run(browser, { siteUrl, siteSel, all, siteCss }) {
  const failures = []
  const pending = []
  for (const p of pages) {
    const regions = p.regions.filter((r) => all || r.enforced)
    pending.push(...p.regions.filter((r) => !all && !r.enforced).map((r) => `${p.page}@${p.width} ${r.name} (${r.task})`))
    if (!regions.length) continue
    const ref = await open(browser, pathToFileURL(join(DESIGN, `${p.page}.html`)).href, p.width)
    const site = await open(browser, siteUrl(p), p.width, siteCss?.(p))
    for (const r of regions) {
      const where = `${p.page}@${p.width} ${r.name} (${r.task})`
      const a = await measure(ref, r.ref)
      if (!a) {
        failures.push(`${where}: the selector ${r.ref} matches nothing in design/${p.page}.html`)
        continue
      }
      const b = await measure(site, siteSel(r))
      if (!b) {
        failures.push(`${where}: the site has no ${siteSel(r)} on ${p.route}`)
        continue
      }
      const diffs = r.tier === "pixels" ? await comparePixels(ref, r.ref, site, siteSel(r), join(REPORT, `${p.page}-${p.width}-${r.name}.png`)) : compareLayout(a, b)
      for (const d of diffs) failures.push(`${where}: ${d}`)
    }
    await ref.close()
    await site.close()
  }
  return { failures, pending }
}

rmSync(REPORT, { recursive: true, force: true })
const browser = await chromium.launch()
let code = 0
try {
  if (SELF) {
    // 1. every region of every artboard, against itself: nothing may differ
    const same = await run(browser, { all: true, siteUrl: (p) => pathToFileURL(join(DESIGN, `${p.page}.html`)).href, siteSel: (r) => r.ref })
    // 2. the same, with the header moved 1px right: the header must fail in both tiers' terms
    const shifted = await run(browser, {
      all: true,
      siteUrl: (p) => pathToFileURL(join(DESIGN, `${p.page}.html`)).href,
      siteSel: (r) => r.ref,
      siteCss: () => "body > div > header { margin-left: 1px; }",
    })
    const caught = shifted.failures.filter((f) => / header \(/.test(f))
    const stray = shifted.failures.filter((f) => !/ header \(/.test(f))
    if (same.failures.length) console.error(`visual --self: the reference differs from itself\n  ${same.failures.join("\n  ")}`)
    if (caught.length !== pages.length) console.error(`visual --self: a 1px shift of the header was caught on ${caught.length} of ${pages.length} pages`)
    if (stray.length) console.error(`visual --self: the shift reported regions it did not touch\n  ${stray.join("\n  ")}`)
    code = same.failures.length || caught.length !== pages.length || stray.length ? 1 : 0
    if (!code) console.log(`visual --self: ${pages.reduce((n, p) => n + p.regions.length, 0)} regions match their artboard, and a 1px shift is caught on every page`)
  } else {
    if (!existsSync(join(DIST, "index.html"))) throw new Error("dist/ is not built: run npm run build first")
    const server = await serve(DIST)
    const base = `http://127.0.0.1:${server.address().port}`
    try {
      const { failures, pending } = await run(browser, { siteUrl: (p) => base + p.route, siteSel: (r) => `[data-design="${r.name}"]` })
      if (failures.length) {
        console.error(`visual: ${failures.length} difference(s) from the artboards\n  ${failures.join("\n  ")}`)
        code = 1
      } else console.log(`visual: every enforced region matches its artboard${pending.length ? `; ${pending.length} not enforced yet` : ""}`)
    } finally {
      server.close()
    }
  }
} finally {
  await browser.close()
}
process.exit(code)
