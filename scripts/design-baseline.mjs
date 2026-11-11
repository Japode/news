/* Renders every page design/pages.json lists into design/baseline/<page>-<width>.png
   (JN13): headless Chromium from the pinned Playwright, at the artboard's width, device
   scale 1, the whole page, once the fonts and the images have loaded.

     node scripts/design-baseline.mjs

   The PNGs are the reference the visual gate measures the built site against. They are
   regenerated only together with a new export of the canvas, never to make a page pass. */

import { mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { chromium } from "playwright"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..")
const DESIGN = join(REPO, "design")
const { pages } = JSON.parse(readFileSync(join(DESIGN, "pages.json"), "utf8"))

mkdirSync(join(DESIGN, "baseline"), { recursive: true })
const browser = await chromium.launch()
try {
  for (const p of pages) {
    const page = await browser.newPage({ viewport: { width: p.width, height: 900 }, deviceScaleFactor: 1 })
    await page.goto(pathToFileURL(join(DESIGN, `${p.page}.html`)).href, { waitUntil: "load" })
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((ok) => img.addEventListener("load", ok, { once: true })))))
    })
    const missing = await page.evaluate(() => [...document.images].filter((img) => !img.naturalWidth).map((img) => img.getAttribute("src")))
    if (missing.length) throw new Error(`${p.page}.html shows images that did not load: ${missing.join(", ")}`)
    const family = await page.evaluate(() => document.fonts.check("700 16px 'Plus Jakarta Sans'"))
    if (!family) throw new Error(`${p.page}.html did not load Plus Jakarta Sans`)
    const out = join(DESIGN, "baseline", `${p.page}-${p.width}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`design/baseline/${p.page}-${p.width}.png`)
    await page.close()
  }
} finally {
  await browser.close()
}
