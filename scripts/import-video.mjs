// Copies one video's facts from the private marketing repository into content/videos/<slug>/
// (JN3). Runs on the Alexandre's machine, where marketing is checked out; the CI cannot
// read marketing, so what it builds from is the copy this writes, never a retyped one.
//
//   node scripts/import-video.mjs <marketing video folder> <slug> --youtube <id> --published <YYYY-MM-DD> [--title "<YouTube title>"]
//                                 [--short <id> --short-title "<the Short's title>"]
//
// It reads what the video's own build already wrote, and nothing it would have to guess:
//   narration/script.json            the lines in their written words (the voice's tags such as
//                                    [warmly] dropped, and `pronounce` left out: it is the voice's)
//                                    and the chapter titles
//   shots.json                       the title, the keywords with their `def` (the glossary) and,
//                                    through its shots, which footage is on screen
//   sources.json                     each clip's title, channel and the licence YouTube reports
//   out/<name>-pt-BR.description.txt the chapters with their times, and the primary sources
//   out/plan.json                    the length of the cut
//   out/thumbnail.pt-BR.jpg          the thumbnail, versioned here as the site's own image
//   site.json (optional, JN18)       what only the Alexandre decides: the kicker, the sponsor
//                                    tie ("none", "product", "competitor"), the numbers the video
//                                    states as { value, measures, source }, and each source's
//                                    { lang, published }, in the description's order
// What the build cannot know is a flag: the YouTube id, the date it was published, and
// the title when YouTube's differs from shots.json's.
//
// A video cut into Shorts as well (JN8) names each one with --short <cut>:<id>:<title>,
// repeated, in the order the page lists them: the Shorts go on the same page, not on
// pages of their own. <cut> is the Short's number in marketing: cut 1 is
// out/<name>-short-pt-BR.mp4 where that exists, and every cut <n> is otherwise
// out/shorts/<name>-short-<n>-pt-BR.mp4. <title> is YouTube's, and its trailing hashtags
// (#shorts) are dropped. Each facade image is a frame of that cut, taken with ffmpeg as
// short-<id>.jpg; a frame no Short names any more is deleted.
//
// scripts/scan-channel.mjs reads the channel and prints this command, with every flag, for
// each video the channel has changed.
//
// A second run with nothing changed changes no file: video.json is written only when its
// text differs, and the thumbnail only when its bytes do.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { spawnSync } from "node:child_process"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const fail = (why) => {
  console.error(`import-video: ${why}`)
  process.exit(1)
}

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    youtube: { type: "string" },
    published: { type: "string" },
    title: { type: "string" },
    short: { type: "string", multiple: true },
  },
})
const [folder, slug] = positionals
if (!folder || !slug) fail("usage: import-video.mjs <marketing video folder> <slug> --youtube <id> --published <YYYY-MM-DD> [--title <title>] [--short <cut>:<id>:<title> ...]")
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`the slug "${slug}" is not lowercase words joined by hyphens`)
if (!flags.youtube || !/^[\w-]{11}$/.test(flags.youtube)) fail("--youtube <id> is the 11-character id from youtu.be/<id>")
if (!flags.published || !/^\d{4}-\d{2}-\d{2}$/.test(flags.published)) fail("--published <YYYY-MM-DD> is the day the video went public")

/** YouTube's title without the hashtags it ends with ("… #shorts #ia"). */
const bare = (title) => {
  const words = title.trim().split(/\s+/)
  while (words.length > 1 && words.at(-1).startsWith("#")) words.pop()
  return words.join(" ")
}

const SRC = resolve(folder)
const name = basename(SRC)
const shortsWanted = (flags.short ?? []).map((spec) => {
  const m = spec.match(/^(\d+):([\w-]{11}):(.+)$/s)
  if (!m) fail(`--short "${spec}" is not <cut>:<11-character id>:<title>`)
  const cut = Number(m[1])
  const legacy = join(SRC, "out", `${name}-short-pt-BR.mp4`)
  const file = cut === 1 && existsSync(legacy) ? legacy : join(SRC, "out", "shorts", `${name}-short-${cut}-pt-BR.mp4`)
  if (!existsSync(file)) fail(`${file} is missing: no cut ${cut} of ${name}'s Shorts`)
  const title = bare(m[3])
  if (!title) fail(`--short "${spec}" has no title once its hashtags are dropped`)
  return { cut, youtube: m[2], title, file }
})
if (new Set(shortsWanted.map((s) => s.youtube)).size !== shortsWanted.length) fail("a Short is named twice")
if (new Set(shortsWanted.map((s) => s.cut)).size !== shortsWanted.length) fail("two Shorts name the same cut")
const need = (path) => {
  const full = join(SRC, path)
  if (!existsSync(full)) fail(`${full} is missing: run the video's own build first`)
  return full
}
// some of marketing's JSON is written by PowerShell, with a byte-order mark
const json = (path) => JSON.parse(readFileSync(need(path), "utf8").replace(/^﻿/, ""))
const pt = (field, where) => field?.["pt-BR"] ?? fail(`${where} has no pt-BR text`)
const written = (text) => text.replace(/\[[^\]]*\]\s*/g, "").trim()

const script = json("narration/script.json")
const shots = json("shots.json")
const clips = json("sources.json")
const plan = json("out/plan.json")
const description = readFileSync(need(`out/${name}-pt-BR.description.txt`), "utf8").replace(/\r\n/g, "\n")

/** The description's sections, by heading: a heading is a line followed by its body, up to a blank line. */
const sections = Object.fromEntries(
  description
    .split(/\n\s*\n/)
    .map((block) => block.split("\n"))
    .map(([head, ...body]) => [head.trim(), body]),
)

// Chapters: the times are the description's, the titles the script's, and the two must agree.
const numbers = Object.keys(script.chapters).sort((a, b) => Number(a) - Number(b))
const timed = (sections["Capítulos"] ?? fail("the description has no Capítulos section")).map((line) => {
  const m = line.match(/^(?:(\d+):)?(\d+):(\d{2})\s+(.+)$/)
  if (!m) fail(`the chapter line "${line}" is not "m:ss Title"`)
  return { start: Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]), title: m[4].trim() }
})
if (timed.length !== numbers.length + 1) fail(`the description lists ${timed.length} chapters, the script ${numbers.length} plus the introduction`)
numbers.forEach((n, i) => {
  const title = pt(script.chapters[n].title, `chapter ${n}'s title`)
  if (timed[i + 1].title !== title) fail(`chapter ${n} is "${title}" in the script and "${timed[i + 1].title}" in the description`)
})

// The narration, line by line, in the order it is spoken.
const narration = [
  { chapter: 0, text: written(pt(script.intro, "the intro")) },
  ...numbers.flatMap((n) =>
    ["card", "result"].filter((part) => script.chapters[n][part]).map((part) => ({ chapter: Number(n), text: written(pt(script.chapters[n][part], `chapter ${n}'s ${part}`)) })),
  ),
  ...(script.outro ? [{ chapter: numbers.length, text: written(pt(script.outro, "the outro")) }] : []),
]

// The glossary: each keyword the video defines on screen, once, in the order it appears.
const terms = []
for (const callout of Object.values(shots.callouts ?? {}).flat()) {
  if (callout.def && !terms.some((t) => t.term === callout.show)) terms.push({ term: callout.show, def: callout.def })
}

// The image credits: every YouTube clip a shot plays, once, in the order it first plays.
// page:<scene> and terminal:<scene> are the video's own filming, not footage to credit.
const credits = []
for (const shot of (shots.segments ?? []).flatMap((s) => s.shots)) {
  if (/^(page|terminal):/.test(shot.src) || credits.some((c) => c.id === shot.src)) continue
  const clip = clips[shot.src] ?? fail(`a shot plays ${shot.src}, which sources.json does not credit`)
  credits.push({ id: shot.src, title: clip.title, channel: clip.channel, channelUrl: clip.channelUrl, url: clip.url, license: clip.license })
}

// The primary sources: each line of the description's Fonte(s) section, with its address.
const sources = (sections["Fontes"] ?? sections["Fonte"] ?? []).map((line) => {
  const url = line.match(/https?:\/\/\S+/)?.[0] ?? fail(`the source "${line}" has no address`)
  return { text: line.replace(url, "").replace(/[:\s]+$/, "").trim(), url }
})

// The production credit (JN18): the line the build writes into the description, which
// says the narration and music are generated. Every video carries it, so a page can too.
const production = Object.keys(sections).find((head) => /^Narração\b/.test(head)) ?? fail("the description has no Narração line saying how the voice was made")

// What only the Alexandre can decide (JN18), from the video's site.json in marketing:
// the kicker, how the video relates to the sponsor, the numbers it states with their
// sources, and each source's language and date. Optional until he writes it; checked
// in full once it exists, so a typo there stops the import rather than the page.
const site = existsSync(join(SRC, "site.json")) ? json("site.json") : null
if (site) {
  if (typeof site.kicker !== "string" || !site.kicker) fail("site.json has no kicker")
  if (!["none", "product", "competitor"].includes(site.sponsorTie)) fail('site.json\'s sponsorTie is not "none", "product" or "competitor"')
  for (const [i, f] of (site.facts ?? []).entries()) {
    if (typeof f.value !== "string" || typeof f.measures !== "string" || !Number.isInteger(f.source)) fail(`site.json's facts[${i}] is not { value, measures, source }`)
    if (!sources[f.source]) fail(`site.json's facts[${i}] names source ${f.source}, and the description lists ${sources.length}`)
  }
  for (const [i, s] of (site.sources ?? []).entries()) {
    if (!sources[i]) fail(`site.json describes source ${i}, and the description lists ${sources.length}`)
    if (s.lang !== undefined && !/^[a-z]{2}(-[A-Z]{2})?$/.test(s.lang)) fail(`site.json's sources[${i}].lang is not a language tag`)
    if (s.published !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(s.published)) fail(`site.json's sources[${i}].published is not YYYY-MM-DD`)
    Object.assign(sources[i], s.lang ? { lang: s.lang } : {}, s.published ? { published: s.published } : {})
  }
}

const video = {
  $comment: `Imported by scripts/import-video.mjs from marketing/japode/${name}; never edited by hand.`,
  slug,
  title: flags.title ? bare(flags.title) : shots.title,
  youtube: flags.youtube,
  published: flags.published,
  duration: Math.round(plan.length),
  chapters: timed,
  narration,
  terms,
  sources,
  credits,
  ...(shortsWanted.length ? { shorts: shortsWanted.map(({ cut, youtube, title }) => ({ youtube, title, cut })) } : {}),
  production,
  ...(site ? { kicker: site.kicker, sponsorTie: site.sponsorTie, ...(site.facts?.length ? { facts: site.facts } : {}) } : {}),
}

const OUT = join(REPO, "content", "videos", slug)
mkdirSync(OUT, { recursive: true })
const changed = []
const put = (file, data) => {
  const path = join(OUT, file)
  if (existsSync(path) && Buffer.compare(readFileSync(path), Buffer.from(data)) === 0) return
  writeFileSync(path, data)
  changed.push(file)
}
put("video.json", JSON.stringify(video, null, 2) + "\n")
put("thumbnail.jpg", readFileSync(need("out/thumbnail.pt-BR.jpg")))
const frames = shortsWanted.map((s) => `short-${s.youtube}.jpg`)
for (const s of shortsWanted) {
  // one frame of the Short, a second in, scaled to 720 px tall, written to stdout so `put`
  // compares it before anything on disk changes
  const frame = spawnSync("ffmpeg", ["-v", "error", "-ss", "1", "-i", s.file, "-frames:v", "1", "-vf", "scale=-2:720", "-q:v", "3", "-f", "mjpeg", "-"], { maxBuffer: 1 << 26 })
  if (frame.error || frame.status !== 0 || !frame.stdout.length) fail(`ffmpeg could not take a frame of the Short ${s.youtube}: ${frame.error?.message ?? frame.stderr}`)
  put(`short-${s.youtube}.jpg`, frame.stdout)
}
// a frame no Short names any more (short.jpg, from before a video had several) goes
for (const f of readdirSync(OUT).filter((f) => /^short(-[\w-]{11})?\.jpg$/.test(f) && !frames.includes(f))) {
  rmSync(join(OUT, f))
  changed.push(`-${f}`)
}

const others = readdirSync(OUT).filter((f) => !["video.json", "thumbnail.jpg", "article.md", ...frames].includes(f))
if (others.length) console.warn(`import-video: content/videos/${slug}/ also holds ${others.join(", ")}, which no import writes`)
console.log(
  `import-video: ${slug} — ${timed.length} chapters, ${terms.length} terms, ${sources.length} sources, ${credits.length} credits, ${shortsWanted.length} Shorts; ` +
    (changed.length ? `wrote ${changed.join(", ")}` : "nothing changed"),
)
