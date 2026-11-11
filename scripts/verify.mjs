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
// The titles' type (Plus Jakarta Sans, as the videos draw it) is served, not fallen back.
// (The theme key JN1 also checked left with the theme toggle in JN15.)
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
const rows = [...home.matchAll(/<article class="jn-card" id="([^"]+)"/g)].map((m) => m[1])
const newest = [...app.VIDEOS].sort((a, b) => b.published.localeCompare(a.published)).map((v) => v.slug)
check("JN4", rows.join() === newest.join(), `the home lists ${rows.join(", ") || "nothing"}, not ${newest.join(", ")} newest first`)
for (const v of app.VIDEOS) {
  const href = ROUTES.some((r) => r.path === `/${v.slug}/`) ? `/${v.slug}/` : `https://youtu.be/${v.youtube}`
  const row = home.slice(home.indexOf(`id="${v.slug}"`), home.indexOf("</article>", home.indexOf(`id="${v.slug}"`)))
  check("JN4", row.includes(`href="${href}"`), `the home row for ${v.slug} does not link ${href}`)
  check("JN4", existsSync(join(DIST, v.slug, "thumbnail.jpg")), `${v.slug}'s thumbnail is not served`)
}
check("JN4", SITE.youtube === "https://www.youtube.com/@japode" && home.includes(`href="${SITE.youtube}"`), "the home does not link the channel's address to subscribe")

// JN5 — every imported video has its page: the title as h1, the facade (a link to the
// video, and no YouTube iframe or script in the HTML, so nothing loads before a click),
// every chapter as a link to its second, every term and every credit.
for (const v of app.VIDEOS) {
  const path = `/${v.slug}/`
  if (!existsSync(join(DIST, v.slug, "index.html"))) {
    check("JN5", false, `${path} was not prerendered`)
    continue
  }
  const text = page(path)
  check("JN5", text.includes(`<h1>${html(v.title)}</h1>`), `${path} lacks its h1`)
  check("JN5", text.includes(`data-facade="${v.youtube}"`) && text.includes(`href="https://youtu.be/${v.youtube}"`), `${path} lacks the video's facade`)
  // an iframe or a script fetched from YouTube; the JSON-LD's embedUrl (JN9) is text, not a load
  check("JN5", !/<iframe|<script[^>]*\ssrc="[^"]*youtube/.test(text), `${path} loads YouTube before a click`)
  for (const c of v.chapters) check("JN5", text.includes(`href="https://youtu.be/${v.youtube}?t=${c.start}"`), `${path} lacks the chapter "${c.title}"`)
  for (const t of v.terms) check("JN5", text.includes(`<dt class="jn-term">${html(t.term)}</dt>`) && text.includes(html(t.def)), `${path} lacks the term "${t.term}"`)
  for (const c of v.credits) check("JN5", text.includes(`data-credit="${c.id}"`) && text.includes(html(c.channel)), `${path} lacks the credit for ${c.id}`)
  for (const s of v.sources) check("JN5", text.includes(`href="${html(s.url)}"`), `${path} lacks the source ${s.url}`)
}

// JN6 — an approved article is on its page with every chapter after the introduction as
// an h2, in the video's order, and every paragraph that states a number links where the
// number came from. A draft (no `approved:` date) is on no page.
for (const v of app.VIDEOS) {
  if (!existsSync(join(VIDEOS_DIR, v.slug, "article.md")) || !existsSync(join(DIST, v.slug, "index.html"))) continue
  const text = page(`/${v.slug}/`)
  const article = app.articleFor(v.slug)
  if (!article) {
    check("JN6", !text.includes('class="jn-article"'), `${v.slug}'s article is a draft and is on its page`)
    continue
  }
  const titles = v.chapters.slice(1).map((c) => c.title)
  check("JN6", article.headings.join(" | ") === titles.join(" | "), `${v.slug}'s article headings are "${article.headings.join(" | ")}", not the chapters "${titles.join(" | ")}"`)
  for (const t of titles) check("JN6", text.includes(`<h2>${html(t)}</h2>`), `${v.slug}'s page lacks the h2 "${t}"`)
  for (const p of article.html.match(/<p>[\s\S]*?<\/p>/g) ?? []) {
    check("JN6", !/\d/.test(p.replace(/<a [^>]*>[\s\S]*?<\/a>/g, "")) || /<a href="https?:/.test(p), `${v.slug}: a paragraph states a number with no link to its source: ${p.replace(/<[^>]+>/g, "").slice(0, 80)}…`)
  }
  // the home shows a summary only as the lead's dek (JN19): the newest video's
  if (v === app.VIDEOS[0]) check("JN6", page("/").includes(html(article.summary)), `the home's lead for ${v.slug} lacks the article's summary`)
}

// JN8 — a video cut into a Short as well shows it on the same page, as a facade that
// links the Short on YouTube, with its frame served; the Short has no page of its own.
for (const v of app.VIDEOS.filter((x) => x.short)) {
  const text = page(`/${v.slug}/`)
  check("JN8", text.includes(`data-facade="${v.short.youtube}"`) && text.includes(`href="https://www.youtube.com/shorts/${v.short.youtube}"`), `/${v.slug}/ lacks the Short's facade`)
  check("JN8", existsSync(join(DIST, v.slug, "short.jpg")), `${v.slug}'s Short frame is not served`)
  check("JN8", !ROUTES.some((r) => r.path.includes(v.short.youtube)), `the Short ${v.short.youtube} has a page of its own`)
}

// JN9 — each video's page carries a VideoObject with every field Google reads and a Clip
// per chapter, an Article once the article is approved, its thumbnail as the social card
// and og:type video.other; the sitemap lists every indexed route (the 404 never) with the
// video tags, robots.txt names it, and llms.txt lists every video with its page.
const sitemap = read("sitemap.xml")
for (const r of ROUTES) {
  check("JN9", sitemap.includes(`<loc>${SITE.origin}${r.path}</loc>`) === r.index, r.index ? `the sitemap lacks ${r.path}` : `the sitemap lists ${r.path}`)
}
check("JN9", read("robots.txt").includes(`Sitemap: ${SITE.origin}/sitemap.xml`), "robots.txt does not name the sitemap")
const llms = read("llms.txt")
for (const v of app.VIDEOS) {
  const path = `/${v.slug}/`
  if (!existsSync(join(DIST, v.slug, "index.html"))) continue
  const text = read(join(v.slug, "index.html"))
  const ld = [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
  const vo = ld.find((x) => x["@type"] === "VideoObject")
  check("JN9", Boolean(vo), `${path} has no VideoObject`)
  if (vo) {
    for (const field of ["name", "description", "thumbnailUrl", "uploadDate", "duration", "embedUrl"]) check("JN9", Boolean(vo[field]?.length), `${path}'s VideoObject lacks ${field}`)
    check("JN9", /^PT(\d+M)?(\d+S)?$/.test(vo.duration ?? "") && vo.uploadDate === v.published, `${path}'s VideoObject has a duration or date that is not the video's`)
    check("JN9", vo.hasPart?.length === v.chapters.length && vo.hasPart.every((c, i) => c["@type"] === "Clip" && c.name === v.chapters[i].title && c.startOffset === v.chapters[i].start && c.endOffset > c.startOffset && c.url), `${path}'s VideoObject lacks a Clip per chapter`)
  }
  const article = app.articleFor(v.slug)
  const al = ld.find((x) => x["@type"] === "Article")
  check("JN9", Boolean(al) === Boolean(article), article ? `${path} has no Article JSON-LD` : `${path} has an Article JSON-LD for a draft`)
  if (al) for (const field of ["headline", "datePublished", "author", "publisher"]) check("JN9", Boolean(al[field]), `${path}'s Article lacks ${field}`)
  check("JN9", text.includes(`<meta property="og:image" content="${SITE.origin}/${v.slug}/thumbnail.jpg" />`) && text.includes('<meta property="og:type" content="video.other" />'), `${path}'s social card is not its thumbnail as a video`)
  check("JN9", sitemap.includes(`<video:player_loc>https://www.youtube.com/embed/${v.youtube}</video:player_loc>`), `the sitemap lacks ${path}'s video tags`)
  check("JN9", llms.includes(`(${SITE.origin}${path})`), `llms.txt lacks ${path}`)
}

// JN12 — every page's footer links japode.com, the apps site, which links back
// (relabelled "Aplicativos Japode" in JN16: japode.com is not this site in English).
for (const r of ROUTES) {
  const text = page(r.path)
  const footer = text.slice(text.lastIndexOf("<footer"))
  check("JN12", footer.includes(`href="${SITE.catalogue}"`) && footer.includes("Aplicativos Japode (japode.com)"), `${r.path}'s footer does not link japode.com`)
}

// JN16 — one header and one footer: every page carries the same HTML for both, save the
// aria-current that marks the page you are on.
const chrome = (path) => {
  const text = page(path).replace(/ aria-current="page"/g, "")
  const header = text.match(/<header class="jn-head"[\s\S]*?<\/header>/)?.[0]
  const footer = text.match(/<footer class="jn-foot"[\s\S]*?<\/footer>/)?.[0]
  return { header, footer }
}
const homeChrome = chrome("/")
check("JN16", Boolean(homeChrome.header && homeChrome.footer), "the home page lacks the site's header or footer")
for (const r of ROUTES) {
  const c = chrome(r.path)
  check("JN16", c.header === homeChrome.header, `${r.path}'s header differs from the home page's`)
  check("JN16", c.footer === homeChrome.footer, `${r.path}'s footer differs from the home page's`)
}

// JN13 — the artboards are in the repo as the reference, each with its baseline, and the
// reference is never published with the site.
const DESIGN = join(REPO, "design")
const designPages = JSON.parse(readFileSync(join(DESIGN, "pages.json"), "utf8")).pages
for (const p of designPages) {
  check("JN13", existsSync(join(DESIGN, `${p.page}.html`)), `design/${p.page}.html is missing`)
  check("JN13", existsSync(join(DESIGN, "baseline", `${p.page}-${p.width}.png`)), `design/baseline/${p.page}-${p.width}.png is missing`)
}
check("JN13", designPages.length === 4, `design/pages.json lists ${designPages.length} artboards, not the canvas's 4`)
check("JN13", !existsSync(join(DIST, "design")) && !walk(DIST).some((f) => f.endsWith(".png") && f.includes("baseline")), "the design reference is published with the site")

// JN14 — the visual gate has a region map that names real artboards, owning tasks and
// tiers, and the deploy runs it after the build.
const regions = JSON.parse(readFileSync(join(DESIGN, "regions.json"), "utf8")).pages
for (const p of regions) {
  check("JN14", designPages.some((d) => d.page === p.page && d.width === p.width), `design/regions.json names ${p.page}@${p.width}, which design/pages.json does not`)
  check("JN14", ROUTES.some((r) => r.path === p.route) || p.regions.every((r) => !r.enforced), `design/regions.json enforces regions on ${p.route}, which the site does not serve`)
  for (const r of p.regions) check("JN14", /^JN\d+$/.test(r.task) && ["pixels", "layout"].includes(r.tier) && typeof r.enforced === "boolean", `design/regions.json's ${p.page} ${r.name} lacks a task, a tier or an enforced flag`)
}
check("JN14", /npm run visual/.test(readFileSync(join(REPO, ".github", "workflows", "deploy.yml"), "utf8")), "deploy.yml does not run the visual gate")

// JN15 — the site draws itself with its own design system: no Viglet design system in
// the dependencies, the build or the sources, and no colour spelled outside the tokens.
const pkg = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8"))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }
check("JN15", !deps["@viglet/viglet-design-system"] && !deps.tailwindcss, "package.json still depends on the Viglet design system or Tailwind")
const SRC = join(REPO, "src")
const sources = walk(SRC).filter((f) => /\.(css|ts|tsx)$/.test(f))
for (const f of [...sources, join(REPO, "vite.config.ts"), join(REPO, "index.html"), ...walk(join(REPO, "scripts"))]) {
  const text = readFileSync(f, "utf8")
  const name = f.slice(REPO.length + 1).replaceAll("\\", "/")
  if (name === "scripts/verify.mjs") continue
  check("JN15", !text.includes("@viglet/viglet-design-system") && !/\bvg-site\b|data-tone=/.test(text), `${name} still uses the Viglet design system`)
}
const TOKENS = join(SRC, "design", "tokens.css")
for (const f of sources.filter((f) => f !== TOKENS)) {
  const hex = readFileSync(f, "utf8").match(/#[0-9a-fA-F]{3,8}\b/)
  check("JN15", !hex, `${f.slice(REPO.length + 1).replaceAll("\\", "/")} spells the colour ${hex?.[0]} outside src/design/tokens.css`)
}
check("JN15", page("/").includes('href="/assets/') && walk(join(DIST, "assets")).some((f) => f.endsWith(".css") && readFileSync(f, "utf8").includes("--green-text")), "the built CSS does not carry the site's tokens")

// JN17 — every page names its sponsor, says Viglet is the author's and that it has no
// say over the topics, outside the content; Viglet's mark is visibility's, unchanged.
for (const r of ROUTES) {
  const text = page(r.path)
  const band = text.match(/<aside class="jn-sponsor"[\s\S]*?<\/aside>/)?.[0] ?? ""
  check("JN17", band.includes("A Viglet é do autor do Japode e não escolhe nem revisa a pauta."), `${r.path} lacks the sponsor band and its disclosure`)
  check("JN17", text.indexOf('<aside class="jn-sponsor"') > text.indexOf("</main>"), `${r.path} puts the sponsor band inside the content`)
  check("JN17", !/github\.com\/openviglet|github\.com\/viglet/i.test(band), `${r.path}'s sponsor band links GitHub`)
}
const VIGLET_MARK = resolve(REPO, "..", "..", "alegauss", "visibility", "marca", "logo", "viglet.svg")
if (existsSync(VIGLET_MARK)) check("JN17", readFileSync(VIGLET_MARK, "utf8") === readFileSync(join(REPO, "public", "viglet.svg"), "utf8"), "public/viglet.svg differs from visibility's marca/logo/viglet.svg")
check("JN17", existsSync(join(DIST, "viglet.svg")), "Viglet's mark is not served")

// JN18 — every video says how its voice was made; a number it states points at one of
// its sources (src/data/videos.ts refuses the build otherwise, and this names the task);
// every video in production in content/upcoming/ is loaded, and none is published.
for (const v of app.VIDEOS) {
  check("JN18", /ElevenLabs/.test(v.production ?? ""), `${v.slug} has no production credit: run scripts/import-video.mjs again`)
  for (const [i, f] of (v.facts ?? []).entries()) check("JN18", Boolean(v.sources[f.source]), `${v.slug}'s fact ${i} names no source`)
}
const UPCOMING_DIR = join(REPO, "content", "upcoming")
const upcomingFiles = existsSync(UPCOMING_DIR) ? readdirSync(UPCOMING_DIR).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)) : []
check("JN18", upcomingFiles.sort().join() === app.UPCOMING.map((u) => u.slug).sort().join(), `content/upcoming/ holds ${upcomingFiles.join(", ")}, the build loaded ${app.UPCOMING.map((u) => u.slug).join(", ")}`)

if (failures.length) {
  console.error(`verify: ${failures.length} check(s) failed\n  ${failures.join("\n  ")}`)
  process.exit(1)
}
console.log("verify: every check passed")
