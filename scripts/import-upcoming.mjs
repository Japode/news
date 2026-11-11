// Copies a video in production from the private marketing repository into
// content/upcoming/<slug>.json (JN18), so the home can list it as "Em produção". Runs on
// the Alexandre's machine, like import-video.mjs.
//
//   node scripts/import-upcoming.mjs <marketing video folder> <slug>
//
// It reads the title from the folder's README.md heading ("# Git: o livro que nunca se
// apaga") and, once the Alexandre writes one, site.json's kicker and line (the one
// sentence the card shows). A folder whose build has written out/ is a cut video: that
// one goes through import-video.mjs, and its content/upcoming/ file is deleted then.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const fail = (why) => {
  console.error(`import-upcoming: ${why}`)
  process.exit(1)
}

const [folder, slug] = process.argv.slice(2)
if (!folder || !slug) fail("usage: import-upcoming.mjs <marketing video folder> <slug>")
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`the slug "${slug}" is not lowercase words joined by hyphens`)
const SRC = resolve(folder)
if (existsSync(join(SRC, "out"))) fail(`${SRC} has an out/ folder: the video is cut, so import it with import-video.mjs`)
if (existsSync(join(REPO, "content", "videos", slug))) fail(`content/videos/${slug} exists: the video is published`)

const readme = join(SRC, "README.md")
if (!existsSync(readme)) fail(`${readme} is missing`)
const title = readFileSync(readme, "utf8").match(/^#\s+(.+?)\s*$/m)?.[1] ?? fail(`${readme} has no "# Title" heading`)

// some of marketing's JSON is written by PowerShell, with a byte-order mark
const site = existsSync(join(SRC, "site.json")) ? JSON.parse(readFileSync(join(SRC, "site.json"), "utf8").replace(/^﻿/, "")) : {}
for (const field of ["kicker", "line"]) if (site[field] !== undefined && (typeof site[field] !== "string" || !site[field])) fail(`site.json's ${field} is not a non-empty string`)

const upcoming = {
  $comment: `Imported by scripts/import-upcoming.mjs from marketing/japode/${SRC.split(/[\\/]/).at(-1)}; never edited by hand.`,
  slug,
  title,
  ...(site.kicker ? { kicker: site.kicker } : {}),
  ...(site.line ? { line: site.line } : {}),
}

const OUT = join(REPO, "content", "upcoming")
mkdirSync(OUT, { recursive: true })
const path = join(OUT, `${slug}.json`)
const text = JSON.stringify(upcoming, null, 2) + "\n"
const changed = !existsSync(path) || readFileSync(path, "utf8") !== text
if (changed) writeFileSync(path, text)
console.log(`import-upcoming: ${slug} — "${title}"; ${changed ? `wrote content/upcoming/${slug}.json` : "nothing changed"}`)
