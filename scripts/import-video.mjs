// Copies one video's facts from the private marketing repository into content/videos/<slug>/
// (JN3). Runs on the Alexandre's machine, where marketing is checked out; the CI cannot
// read marketing, so what it builds from is the copy this writes, never a retyped one.
//
//   node scripts/import-video.mjs <marketing video folder> <slug> --youtube <id> --published <YYYY-MM-DD> [--title "<YouTube title>"]
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
// What the build cannot know is a flag: the YouTube id, the date it was published, and
// the title when YouTube's differs from shots.json's.
//
// A second run with nothing changed changes no file: video.json is written only when its
// text differs, and the thumbnail only when its bytes do.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const fail = (why) => {
  console.error(`import-video: ${why}`)
  process.exit(1)
}

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: { youtube: { type: "string" }, published: { type: "string" }, title: { type: "string" } },
})
const [folder, slug] = positionals
if (!folder || !slug) fail("usage: import-video.mjs <marketing video folder> <slug> --youtube <id> --published <YYYY-MM-DD> [--title <title>]")
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`the slug "${slug}" is not lowercase words joined by hyphens`)
if (!flags.youtube || !/^[\w-]{11}$/.test(flags.youtube)) fail("--youtube <id> is the 11-character id from youtu.be/<id>")
if (!flags.published || !/^\d{4}-\d{2}-\d{2}$/.test(flags.published)) fail("--published <YYYY-MM-DD> is the day the video went public")

const SRC = resolve(folder)
const name = basename(SRC)
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

const video = {
  $comment: `Imported by scripts/import-video.mjs from marketing/japode/${name}; never edited by hand.`,
  slug,
  title: flags.title ?? shots.title,
  youtube: flags.youtube,
  published: flags.published,
  duration: Math.round(plan.length),
  chapters: timed,
  narration,
  terms,
  sources,
  credits,
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

const others = readdirSync(OUT).filter((f) => !["video.json", "thumbnail.jpg", "article.md"].includes(f))
if (others.length) console.warn(`import-video: content/videos/${slug}/ also holds ${others.join(", ")}, which no import writes`)
console.log(
  `import-video: ${slug} — ${timed.length} chapters, ${terms.length} terms, ${sources.length} sources, ${credits.length} credits; ` +
    (changed.length ? `wrote ${changed.join(", ")}` : "nothing changed"),
)
