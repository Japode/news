// Writes every page of the site (JN1), and the files built from the same route table:
// the social tags, sitemap.xml, robots.txt and llms.txt (JN9).
//
// Runs after `vite build` (dist/, holding the index.html template and the client assets)
// and `vite build --ssr src/entry-server.tsx` (dist-server/). For each route in the
// table, the prerendered page; then 404.html and the PNG icons, drawn from
// public/logo.svg, which is the one source of the mark here: a copy of
// marca/logo/japode.svg in the visibility repository, never redrawn.

import { execFileSync } from "node:child_process"
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"
import * as app from "../dist-server/entry-server.js"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const DIST = join(REPO, "dist")
const { SITE } = app

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** The day (YYYY-MM-DD) the newest commit touched these paths, or null outside git. */
function lastAuthoredChange(cwd, paths) {
  try {
    const day = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...paths], { cwd, encoding: "utf8" }).trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null
  } catch {
    return null
  }
}

/** Replaces one anchor in the template, or stops the build: a lost anchor is a page
    that would ship without its title, description or content. */
function fill(html, anchor, value, what) {
  if (!(typeof anchor === "string" ? html.includes(anchor) : anchor.test(html))) throw new Error(`prerender: index.html no longer contains ${what}`)
  return html.replace(anchor, () => value)
}

// One page per route (JN1): the template with the route's title, description, canonical
// link and Open Graph tags, and the page rendered into #root. Ported from the Viglet
// design system's prerenderSite when the site left it (JN15).
const template = readFileSync(join(DIST, "index.html"), "utf8")
const written = app.ROUTE_META.map((route) => {
  const url = app.canonicalUrl(route.path)
  const head = [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
  ].join("\n    ")
  let html = fill(template, /<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`, "a <title>")
  html = fill(html, /<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(route.description)}" />`, 'a <meta name="description">')
  html = fill(html, "</head>", `  ${head}\n  </head>`, "</head>")
  html = fill(html, '<div id="root"></div>', `<div id="root">${app.render(route.path)}</div>`, 'the <div id="root"> mount point')
  const dir = app.outputDir(route.path)
  mkdirSync(join(DIST, dir), { recursive: true })
  writeFileSync(join(DIST, dir, "index.html"), html)
  const file = dir ? `${dir}/index.html` : "index.html"
  console.log(`prerendered ${route.path.padEnd(12)} -> ${file}`)
  return file
})

// The social card (JN9): a video's page shows its own 1280x720 thumbnail and says it is a
// video; every other page shows the mark. The page was written with og:type website, which
// a video's page replaces, or the build stops rather than ship two types.
const abs = (path) => `${SITE.origin}${path}`
for (const route of app.ROUTES) {
  const file = join(DIST, app.outputDir(route.path), "index.html")
  let html = readFileSync(file, "utf8")
  const image = route.video
    ? [abs(`/${route.video.slug}/thumbnail.jpg`), 1280, 720]
    : [abs("/icon-512.png"), 512, 512]
  if (route.video) {
    if (!html.includes('<meta property="og:type" content="website" />')) throw new Error(`prerender: ${route.path} has no og:type to replace`)
    html = html.replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="video.other" />')
  }
  const tags = [
    `<meta property="og:image" content="${esc(image[0])}" />`,
    `<meta property="og:image:width" content="${image[1]}" />`,
    `<meta property="og:image:height" content="${image[2]}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta name="twitter:card" content="${route.video ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:image" content="${esc(image[0])}" />`,
  ]
  writeFileSync(file, html.replace("</head>", `  ${tags.join("\n    ")}\n  </head>`))
}

// The 404 route is a page, but no search engine should list it.
const notFound = join(DIST, "404", "index.html")
writeFileSync(notFound, readFileSync(notFound, "utf8").replace("</head>", `  <meta name="robots" content="noindex" />\n  </head>`))
// GitHub Pages serves /404.html for any path it does not have.
copyFileSync(notFound, join(DIST, "404.html"))

// Each video's thumbnail, beside the page it belongs to: /<slug>/thumbnail.jpg (JN4).
for (const v of app.VIDEOS) {
  mkdirSync(join(DIST, v.slug), { recursive: true })
  copyFileSync(join(REPO, "content", "videos", v.slug, "thumbnail.jpg"), join(DIST, v.slug, "thumbnail.jpg"))
  // and the frame each Short's facade shows (JN8)
  for (const s of v.shorts ?? []) copyFileSync(join(REPO, "content", "videos", v.slug, `short-${s.youtube}.jpg`), join(DIST, v.slug, `short-${s.youtube}.jpg`))
}

// The PNG icons a manifest and an iOS home screen ask for, from the one SVG.
const logo = readFileSync(join(REPO, "public", "logo.svg"), "utf8")
for (const [file, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  writeFileSync(join(DIST, file), new Resvg(logo, { fitTo: { mode: "width", value: size } }).render().asPng())
}

// sitemap.xml (JN9): every indexed route, the 404 left out. lastmod is the day the
// authored tree last changed in git, as japode.com dates it, not the build clock: for a
// video's page, its own content/videos/<slug>/; for the others, the whole site. A video's
// page carries the video sitemap tags, so Google can list the video with its thumbnail.
const siteDate = lastAuthoredChange(REPO, ["src", "public", "index.html", "content"])
const url = (route) => {
  const v = route.video
  const own = v ? `content/videos/${v.slug}` : route.post ? `content/articles/${route.post.slug}` : null
  const lastmod = own ? lastAuthoredChange(REPO, [own]) ?? siteDate : siteDate
  const video = v
    ? [
        "    <video:video>",
        `      <video:thumbnail_loc>${esc(abs(`/${v.slug}/thumbnail.jpg`))}</video:thumbnail_loc>`,
        `      <video:title>${esc(v.title)}</video:title>`,
        `      <video:description>${esc(route.description)}</video:description>`,
        `      <video:player_loc>${esc(`https://www.youtube.com/embed/${v.youtube}`)}</video:player_loc>`,
        `      <video:duration>${v.duration}</video:duration>`,
        `      <video:publication_date>${v.published}</video:publication_date>`,
        "    </video:video>",
      ]
    : []
  return ["  <url>", `    <loc>${esc(abs(route.path))}</loc>`, ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []), ...video, "  </url>"].join("\n")
}
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n` +
    app.ROUTES.filter((r) => r.index).map(url).join("\n") +
    `\n</urlset>\n`,
)
writeFileSync(join(DIST, "robots.txt"), ["User-agent: *", "Allow: /", "", `Sitemap: ${abs("/sitemap.xml")}`, ""].join("\n"))

// llms.txt (JN9): the site for a language model, in the llmstxt.org shape: what the
// channel is, then every video with its page and the line that says what it holds.
writeFileSync(
  join(DIST, "llms.txt"),
  [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `O canal no YouTube: ${SITE.youtube}`,
    "",
    "## Vídeos",
    "",
    ...app.ROUTES.filter((r) => r.video).map((r) => `- [${r.video.title}](${abs(r.path)}): ${r.description}`),
    "",
    // the articles on their own (JN27), when there are any
    ...(app.ROUTES.some((r) => r.post) ? ["## Artigos", "", ...app.ROUTES.filter((r) => r.post).map((r) => `- [${r.post.title}](${abs(r.path)}): ${r.description}`), ""] : []),
  ].join("\n"),
)

console.log(`prerendered ${written.length} pages`)
