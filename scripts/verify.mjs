// Checks the built site against the roadmap's "done when" lines, so a regression fails
// the build instead of shipping. Run after scripts/prerender.mjs:
//
//   node scripts/verify.mjs
//
// Each check names the task it holds. It reads dist/ and the sources, nothing else.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import * as app from "../dist-server/entry-server.js"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const DIST = join(REPO, "dist")
const { SITE, ROUTES } = app
const failures = []
const check = (task, ok, what) => {
  if (!ok) failures.push(`${task}: ${what}`)
}

const read = (path) => readFileSync(join(DIST, path), "utf8")
// React separates adjacent text with <!-- -->; a check reads the text a visitor sees
const page = (route) => read(join(app.outputDir(route), "index.html")).replaceAll("<!-- -->", "")
// React's escaping, apostrophe included
const html = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;")
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]))

// JN1 — every route is static HTML that reads without JavaScript, in Portuguese, born on
// the final origin, with the channel's mark (visibility's japode.svg, unchanged) as favicon.
check("JN1", SITE.origin === "https://japode.com.br", `the canonical origin is ${SITE.origin}, not https://japode.com.br`)
for (const r of ROUTES) {
  const file = join(app.outputDir(r.path), "index.html")
  check("JN1", existsSync(join(DIST, file)), `${r.path} was not prerendered`)
  if (!existsSync(join(DIST, file))) continue
  const text = page(r.path)
  check("JN1", /<div id="root">\s*\S/.test(text), `${r.path} has an empty #root, so it needs JavaScript to read`)
  check("JN1", text.includes(`<link rel="canonical" href="${SITE.origin}${r.path}" />`), `${r.path} is not canonical on ${SITE.origin}`)
  check("JN1", /<html lang="pt-BR"/.test(text), `${r.path} is not <html lang="pt-BR">`)
  check("JN1", text.includes(`<title>${html(r.title)}</title>`), `${r.path} lacks its own title`)
  check("JN1", text.includes('<link rel="icon" type="image/svg+xml" href="/logo.svg" />'), `${r.path} does not use the mark as favicon`)
}
check("JN1", page("/").includes(html(SITE.description)), "the home page HTML lacks the site's description")
check("JN1", page("/404/").includes('<meta name="robots" content="noindex" />'), "the 404 page can be indexed")
check("JN1", existsSync(join(DIST, "404.html")), "404.html is missing, so GitHub Pages serves its own")
for (const keep of ["logo.svg", "site.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"]) {
  check("JN1", existsSync(join(DIST, keep)), `${keep} is not served`)
}
const manifest = JSON.parse(read("site.webmanifest"))
for (const icon of manifest.icons) check("JN1", existsSync(join(DIST, icon.src.replace(/^\//, ""))), `the manifest names ${icon.src}, which is not built`)
// The mark is copied, never redrawn: where the visibility repository is on this machine,
// the copy must still be byte for byte its japode.svg. The CI has no such checkout.
const MARK = resolve(REPO, "..", "..", "alegauss", "visibility", "marca", "logo", "japode.svg")
if (existsSync(MARK)) check("JN1", readFileSync(MARK, "utf8") === readFileSync(join(REPO, "public", "logo.svg"), "utf8"), "public/logo.svg differs from visibility's marca/logo/japode.svg")
check("JN1", !existsSync(join(DIST, "docs")) && !existsSync(join(DIST, "scripts")), "docs/ or scripts/ is published")
// The site's theme key is its own, so a choice made on japode.com does not leak here, and
// the titles' type (Plus Jakarta Sans, as the videos draw it) is served, not fallen back.
check("JN1", SITE.themeKey === "japode-news-theme", `the theme key is ${SITE.themeKey}, not japode-news-theme`)
check("JN1", walk(join(DIST, "assets")).some((f) => /plus-jakarta-sans-latin-wght-normal-.*\.woff2$/.test(f)), "Plus Jakarta Sans is not shipped")

// JN2 — the deploy builds (so a failed check here stops it) and publishes the build
// output alone, and the domain file rides with it, naming the origin the pages are
// canonical on. Whether japode.com.br answers is the push's to show, not the build's.
const workflow = readFileSync(join(REPO, ".github", "workflows", "deploy.yml"), "utf8")
check("JN2", /npm run build/.test(workflow), "deploy.yml does not run npm run build")
check("JN2", /path:\s*\.?\/?dist\b/.test(workflow), "deploy.yml does not upload dist/")
check("JN2", /branches:\s*\[main\]/.test(workflow), "deploy.yml does not deploy on a push to main")
check("JN2", existsSync(join(DIST, ".nojekyll")), ".nojekyll is not served")
check("JN2", existsSync(join(DIST, "CNAME")) && read("CNAME").trim() === new URL(SITE.origin).host, `CNAME does not name ${new URL(SITE.origin).host}`)

// JN3 — every imported video is in the build (src/data/videos.ts refused none, or there
// would be no build to verify), with the thumbnail the import copied beside it.
const VIDEOS_DIR = join(REPO, "content", "videos")
const imported = existsSync(VIDEOS_DIR) ? readdirSync(VIDEOS_DIR).filter((d) => existsSync(join(VIDEOS_DIR, d, "video.json"))) : []
check("JN3", imported.sort().join() === app.VIDEOS.map((v) => v.slug).sort().join(), `content/videos/ holds ${imported.join(", ")}, the build loaded ${app.VIDEOS.map((v) => v.slug).join(", ")}`)
for (const v of app.VIDEOS) check("JN3", existsSync(join(VIDEOS_DIR, v.slug, "thumbnail.jpg")), `${v.slug} has no thumbnail.jpg`)

// JN4 — the home reads as a blog: no landing-page hero, every imported video listed
// newest first, each row linking its page (or the video until the page exists), with
// its thumbnail served, and the subscribe link on the channel's address.
const home = page("/")
check("JN4", !home.includes("vg-site-hero"), "the home page still carries the landing-page hero")
const rows = [...home.matchAll(/<article class="jn-post" id="([^"]+)"/g)].map((m) => m[1])
const newest = [...app.VIDEOS].sort((a, b) => b.published.localeCompare(a.published)).map((v) => v.slug)
check("JN4", rows.join() === newest.join(), `the home lists ${rows.join(", ") || "nothing"}, not ${newest.join(", ")} newest first`)
for (const v of app.VIDEOS) {
  const href = ROUTES.some((r) => r.path === `/${v.slug}/`) ? `/${v.slug}/` : `https://youtu.be/${v.youtube}`
  const row = home.slice(home.indexOf(`id="${v.slug}"`), home.indexOf("</article>", home.indexOf(`id="${v.slug}"`)))
  check("JN4", row.includes(`href="${href}"`), `the home row for ${v.slug} does not link ${href}`)
  check("JN4", existsSync(join(DIST, v.slug, "thumbnail.jpg")), `${v.slug}'s thumbnail is not served`)
}
check("JN4", SITE.youtube === "https://www.youtube.com/channel/UC8vYs--SLUt_vbwRwStUNxg" && home.includes(`href="${SITE.youtube}"`), "the home does not link the channel's address to subscribe")

if (failures.length) {
  console.error(`verify: ${failures.length} check(s) failed\n  ${failures.join("\n  ")}`)
  process.exit(1)
}
console.log("verify: every check passed")
