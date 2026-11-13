// Reads the Japode channel on YouTube and says what the site is missing from it: a video
// published there and not here, a Short not on its video's page, a title YouTube changed.
// Runs on the Alexandre's machine, like import-video.mjs, because a video's facts and its
// Shorts' cuts come from marketing, which the CI cannot read.
//
//   node scripts/scan-channel.mjs                    report, change nothing
//   node scripts/scan-channel.mjs --json             the same plan, as JSON
//   node scripts/scan-channel.mjs --apply            run import-video.mjs for every video the plan changes
//   node scripts/scan-channel.mjs --apply --new <youtube id>:<marketing folder>:<slug>
//                                                    and import a new video, once its folder and slug are chosen
//   [--marketing <dir>]  marketing's japode folder, D:\Git\viglet\marketing\japode by default
//   [--feed <file>]      a saved copy of the feed instead of fetching it
//
// What it reads:
//   the channel's feed      youtube.com/feeds/videos.xml?channel_id=…: the newest 15 uploads,
//                           public ones only; a link to /shorts/ is a Short
//   content/videos/*        what the site has, and the marketing folder each came from
//   marketing/<video>/out   shots.json's title, and each Short's cut: out/<name>-short-pt-BR.mp4
//                           is cut 1, out/shorts/<name>-short-<n>-pt-BR.txt holds cut n's
//                           title and the full video's address ("O vídeo completo: …")
//
// A Short on YouTube is matched to its cut by title, because YouTube's title is often
// rewritten after the cut: the match is the cut whose title shares the most words, and one
// that shares too few, or ties, is reported for a person to decide instead of applied.
// A new video is never imported without --new: its slug is the site's address, and the
// Alexandre chooses it.

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { spawnSync } from "node:child_process"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHANNEL = "UC8vYs--SLUt_vbwRwStUNxg"
const fail = (why) => {
  console.error(`scan-channel: ${why}`)
  process.exit(1)
}

const { values: flags } = parseArgs({
  options: {
    marketing: { type: "string", default: "D:\\Git\\viglet\\marketing\\japode" },
    feed: { type: "string" },
    json: { type: "boolean" },
    apply: { type: "boolean" },
    new: { type: "string", multiple: true },
  },
})
const MARKETING = resolve(flags.marketing)
if (!existsSync(MARKETING)) fail(`${MARKETING} does not exist: pass --marketing <marketing's japode folder>`)

// --- the channel ------------------------------------------------------------------------

const xml = flags.feed
  ? readFileSync(flags.feed, "utf8")
  : await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`).then((r) => (r.ok ? r.text() : fail(`the feed answered ${r.status}`)))
const unxml = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
const tag = (entry, name) => entry.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]
// the day a video went public is São Paulo's, which is the day the site says
const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" })
const feed = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
  youtube: tag(e, "yt:videoId"),
  title: unxml(tag(e, "title") ?? ""),
  published: day.format(new Date(tag(e, "published"))),
  short: /<link rel="alternate" href="https:\/\/www\.youtube\.com\/shorts\//.test(e),
}))
if (!feed.length) fail("the feed lists no video")

/** A title without the hashtags it ends with ("… #shorts #ia"), as import-video.mjs keeps it. */
const bare = (title) => {
  const words = title.trim().split(/\s+/)
  while (words.length > 1 && words.at(-1).startsWith("#")) words.pop()
  return words.join(" ")
}
const words = (t) =>
  new Set(
    bare(t)
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 1),
  )
/** How alike two titles are, 0 to 1: the words they share over the words they have. */
const alike = (a, b) => {
  const [x, y] = [words(a), words(b)]
  const shared = [...x].filter((w) => y.has(w)).length
  return x.size + y.size ? (2 * shared) / (x.size + y.size) : 0
}
const LIKE = 0.4

// --- the site ---------------------------------------------------------------------------

const json = (path) => JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""))
const VIDEOS_DIR = join(REPO, "content", "videos")
const site = readdirSync(VIDEOS_DIR)
  .filter((d) => existsSync(join(VIDEOS_DIR, d, "video.json")))
  .map((d) => {
    const v = json(join(VIDEOS_DIR, d, "video.json"))
    const folder = v.$comment?.match(/marketing\/japode\/([^;\s]+)/)?.[1] ?? fail(`content/videos/${d}/video.json does not say which marketing folder it came from`)
    // an import from before a video had several Shorts names one, as `short`, and it is cut 1
    const shorts = v.shorts ?? (v.short ? [{ ...v.short, cut: 1 }] : [])
    return { slug: v.slug, folder, youtube: v.youtube, title: v.title, published: v.published, shorts, legacy: Boolean(v.short) }
  })

// --- marketing --------------------------------------------------------------------------

const cuts = new Map() // folder → [{ cut, title?, parent? }]
for (const name of readdirSync(MARKETING)) {
  const out = join(MARKETING, name, "out")
  if (!existsSync(out)) continue
  const list = []
  if (existsSync(join(out, `${name}-short-pt-BR.mp4`))) list.push({ cut: 1 })
  const dir = join(out, "shorts")
  for (const f of existsSync(dir) ? readdirSync(dir) : []) {
    const m = f.match(new RegExp(`^${name}-short-(\\d+)-pt-BR\\.txt$`))
    if (!m) continue
    const text = readFileSync(join(dir, f), "utf8").replace(/\r\n/g, "\n")
    const title = text.match(/^Título[^\n]*\n([^\n]+)/m)?.[1]
    const parent = text.match(/youtu\.be\/([\w-]{11})/)?.[1]
    const cut = Number(m[1])
    const at = list.findIndex((c) => c.cut === cut)
    if (at >= 0) list.splice(at, 1)
    list.push({ cut, title: title && bare(title), parent })
  }
  cuts.set(name, list.sort((a, b) => a.cut - b.cut))
}
const shotsTitle = (name) => {
  const path = join(MARKETING, name, "shots.json")
  return existsSync(path) ? json(path).title : undefined
}

// --- the plan ---------------------------------------------------------------------------

const plan = { changes: [], fresh: [], undecided: [], notes: [] }
const byId = new Map(feed.map((f) => [f.youtube, f]))
const change = (slug) => {
  let c = plan.changes.find((x) => x.slug === slug)
  if (!c) {
    const v = site.find((x) => x.slug === slug)
    c = { slug, folder: v.folder, youtube: v.youtube, published: v.published, title: v.title, shorts: v.shorts.map((s) => ({ ...s })), why: [] }
    if (v.legacy) c.why.push("its Short is in the older single-Short form")
    plan.changes.push(c)
  }
  return c
}
const imported = new Set(site.map((v) => v.folder))

// the full videos
for (const f of feed.filter((x) => !x.short)) {
  const v = site.find((x) => x.youtube === f.youtube)
  if (v) {
    if (bare(f.title) !== v.title) change(v.slug).why.push(`the title is now "${bare(f.title)}" on YouTube, was "${v.title}"`)
    continue
  }
  // a new video: the folder one of whose Shorts points at it, else the closest title among the folders not imported yet
  const named = [...cuts].find(([, list]) => list.some((c) => c.parent === f.youtube))?.[0]
  const ranked = [...cuts.keys()]
    .filter((n) => !imported.has(n))
    .map((n) => ({ folder: n, score: alike(f.title, shotsTitle(n) ?? n) }))
    .sort((a, b) => b.score - a.score)
  plan.fresh.push({ youtube: f.youtube, title: bare(f.title), published: f.published, folder: named ?? (ranked[0]?.score >= LIKE ? ranked[0].folder : undefined), candidates: ranked.slice(0, 3) })
}
// a video with a change takes YouTube's title, whichever change it was
for (const c of plan.changes) {
  const f = byId.get(c.youtube)
  if (f) c.title = bare(f.title)
}

// the Shorts
const parentOf = (folder) => site.find((v) => v.folder === folder)?.slug ?? plan.fresh.find((n) => n.folder === folder)?.youtube
for (const f of feed.filter((x) => x.short)) {
  const owner = site.find((v) => v.shorts.some((s) => s.youtube === f.youtube))
  if (owner) {
    const s = owner.shorts.find((x) => x.youtube === f.youtube)
    if (bare(f.title) !== s.title) {
      const c = change(owner.slug)
      c.shorts.find((x) => x.youtube === f.youtube).title = bare(f.title)
      c.why.push(`the Short ${f.youtube} is now "${bare(f.title)}" on YouTube`)
    }
    continue
  }
  // the cuts no Short on the site took yet, each with how close its title is
  const free = [...cuts].flatMap(([folder, list]) =>
    list
      .filter((c) => c.title && !site.some((v) => v.folder === folder && v.shorts.some((s) => s.cut === c.cut)))
      .map((c) => ({ folder, cut: c.cut, title: c.title, score: alike(f.title, c.title) })),
  )
  free.sort((a, b) => b.score - a.score)
  const [best, next] = free
  if (!best || best.score < LIKE || (next && best.score - next.score < 0.1)) {
    plan.undecided.push({ youtube: f.youtube, title: bare(f.title), why: best ? `its title is close to no cut alone (${free.slice(0, 2).map((c) => `${c.folder} cut ${c.cut}: ${c.score.toFixed(2)}`).join(", ")})` : "no cut in marketing is free", candidates: free.slice(0, 3) })
    continue
  }
  const parent = parentOf(best.folder)
  const v = site.find((x) => x.slug === parent)
  if (!v) {
    plan.undecided.push({ youtube: f.youtube, title: bare(f.title), why: `it is cut ${best.cut} of ${best.folder}, whose video is not on the site yet`, candidates: [best] })
    continue
  }
  const c = change(v.slug)
  c.shorts.push({ youtube: f.youtube, title: bare(f.title), cut: best.cut })
  c.shorts.sort((a, b) => a.cut - b.cut)
  c.why.push(`a new Short, ${f.youtube} "${bare(f.title)}", is cut ${best.cut} (titles ${best.score.toFixed(2)} alike)`)
}
// an old single-Short import is migrated even when nothing else changed
for (const v of site.filter((x) => x.legacy)) change(v.slug)

// what the feed cannot settle
const oldest = feed.map((f) => f.published).sort()[0]
for (const v of site.filter((x) => x.published >= oldest && !byId.has(x.youtube))) plan.notes.push(`${v.slug} (${v.youtube}) is not in the feed although it is newer than its oldest entry: private, deleted or re-uploaded?`)
const UPCOMING = join(REPO, "content", "upcoming")
for (const f of existsSync(UPCOMING) ? readdirSync(UPCOMING).filter((x) => x.endsWith(".json")) : []) {
  const u = json(join(UPCOMING, f))
  const folder = u.$comment?.match(/marketing\/japode\/([^;\s]+)/)?.[1]
  if (folder && !existsSync(join(MARKETING, folder))) plan.notes.push(`content/upcoming/${f} names marketing/japode/${folder}, which no longer exists`)
  else if (folder && cuts.has(folder)) plan.notes.push(`content/upcoming/${f}: ${folder} is cut now; once on YouTube it is a new video here, and the file goes`)
}

// --- the imports ------------------------------------------------------------------------

const argsFor = (c) => [
  join(REPO, "scripts", "import-video.mjs"),
  join(MARKETING, c.folder),
  c.slug,
  "--youtube",
  c.youtube,
  "--published",
  c.published,
  "--title",
  c.title,
  ...c.shorts.flatMap((s) => ["--short", `${s.cut}:${s.youtube}:${s.title}`]),
]
const chosen = (flags.new ?? []).map((spec) => {
  const [youtube, folder, slug] = spec.split(":")
  const n = plan.fresh.find((x) => x.youtube === youtube) ?? fail(`--new ${spec}: ${youtube} is no new video in the feed`)
  if (!cuts.has(folder)) fail(`--new ${spec}: marketing/japode/${folder} has no out/ folder`)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug ?? "")) fail(`--new ${spec}: the slug is not lowercase words joined by hyphens`)
  return { slug, folder, youtube, published: n.published, title: n.title, shorts: [], why: ["a new video"] }
})

if (flags.json) {
  console.log(JSON.stringify({ ...plan, imports: plan.changes.map((c) => ({ slug: c.slug, args: argsFor(c).slice(1) })) }, null, 2))
} else {
  console.log(`scan-channel: the feed lists ${feed.length} uploads, the newest on ${feed.map((f) => f.published).sort().at(-1)}`)
  for (const c of plan.changes) console.log(`\n${c.slug} — ${c.why.join("; ")}\n  node ${argsFor(c).map((a) => (/[\s"]/.test(a) ? JSON.stringify(a) : a)).join(" ")}`)
  for (const n of plan.fresh)
    console.log(
      `\nNEW ${n.youtube} "${n.title}" (${n.published}) — marketing folder ${n.folder ?? "unknown"}; candidates ${n.candidates.map((c) => `${c.folder} ${c.score.toFixed(2)}`).join(", ") || "none"}` +
        `\n  import with: --apply --new ${n.youtube}:${n.folder ?? "<folder>"}:<slug>`,
    )
  for (const u of plan.undecided) console.log(`\nUNDECIDED Short ${u.youtube} "${u.title}" — ${u.why}`)
  for (const n of plan.notes) console.log(`\nNOTE ${n}`)
  if (!plan.changes.length && !plan.fresh.length && !plan.undecided.length) console.log("scan-channel: the site has everything the feed lists")
}

if (flags.apply) {
  // the new videos first: a Short of theirs is then found on the site by the next scan
  for (const c of [...chosen, ...plan.changes]) {
    const run = spawnSync(process.execPath, argsFor(c), { stdio: "inherit" })
    if (run.status !== 0) fail(`the import of ${c.slug} failed`)
  }
  if (chosen.length) console.log("scan-channel: new videos imported; scan again for their Shorts")
}
