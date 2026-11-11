/* The videos, as scripts/import-video.mjs copied them from marketing into
   content/videos/<slug>/video.json (JN3). Each file is checked against the Video type
   when the build loads it, so one that does not fit stops the build with its slug and
   field, instead of becoming a page with a hole in it. Newest first. */

export interface Chapter {
  /** Seconds from the start, as the YouTube description lists it. */
  start: number
  title: string
}

export interface NarrationLine {
  /** 0 is the introduction; the outro carries the last chapter's number. */
  chapter: number
  /** The line in its written words, without the voice's tags. */
  text: string
}

export interface Term {
  term: string
  /** The one-line definition the video draws under the term. */
  def: string
}

export interface Source {
  text: string
  url: string
  /** The source's language, as a BCP 47 tag ("en"), so a page can say "Em inglês" (JN18). */
  lang?: string
  /** YYYY-MM-DD, the day the source was published (JN18). */
  published?: string
}

/** One row of "Os números do vídeo" (JN18): a number the video states, what it measures,
    and the index in `sources` of the document it comes from. */
export interface Fact {
  value: string
  measures: string
  source: number
}

/** Whether a video touches the sponsor's business (JN18), which its page must say:
    "product" or "competitor" puts a notice at the top of the page. */
export type SponsorTie = "none" | "product" | "competitor"

export interface Credit {
  /** The YouTube id of the clip. */
  id: string
  title: string
  channel: string
  channelUrl: string
  url: string
  license: string
}

export interface Video {
  slug: string
  title: string
  youtube: string
  /** YYYY-MM-DD, the day the video went public. */
  published: string
  /** Seconds. */
  duration: number
  chapters: Chapter[]
  narration: NarrationLine[]
  terms: Term[]
  sources: Source[]
  credits: Credit[]
  /** The Short cut from the same video, shown on this page and never on one of its own. */
  short?: { youtube: string; title: string }
  /** The subject line above the title ("Controle de versão"), from marketing's site.json (JN18). */
  kicker?: string
  /** The numbers the video states, each with its source (JN18). */
  facts?: Fact[]
  /** The production credit the YouTube description carries ("Narração e música geradas com ElevenLabs."). */
  production?: string
  /** How the video relates to the sponsor (JN18). */
  sponsorTie?: SponsorTie
}

/** A video in production (JN18): a marketing folder with no cut yet, shown as a card. */
export interface Upcoming {
  slug: string
  title: string
  kicker?: string
  /** One line on what the video tells, from marketing's site.json. */
  line?: string
}

type Shape = "string" | "number" | { [field: string]: Shape } | [Shape]

const CHECK: { [K in Exclude<keyof Video, "short" | "kicker" | "facts" | "production" | "sponsorTie">]: Shape } = {
  slug: "string",
  title: "string",
  youtube: "string",
  published: "string",
  duration: "number",
  chapters: [{ start: "number", title: "string" }],
  narration: [{ chapter: "number", text: "string" }],
  terms: [{ term: "string", def: "string" }],
  sources: [{ text: "string", url: "string" }],
  credits: [{ id: "string", title: "string", channel: "string", channelUrl: "string", url: "string", license: "string" }],
}

function fits(value: unknown, shape: Shape, at: string): string | null {
  if (typeof shape === "string") return typeof value === shape && (shape !== "string" || value !== "") ? null : `${at} is not a non-empty ${shape}`
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) return `${at} is not a list`
    for (const [i, item] of value.entries()) {
      const why = fits(item, shape[0], `${at}[${i}]`)
      if (why) return why
    }
    return null
  }
  if (typeof value !== "object" || value === null) return `${at} is not an object`
  for (const [field, inner] of Object.entries(shape)) {
    const why = fits((value as Record<string, unknown>)[field], inner, at ? `${at}.${field}` : field)
    if (why) return why
  }
  return null
}

/** The fields JN18 added, checked when present: a video imported before them has none. */
function optional(v: Video): string | null {
  if (v.kicker !== undefined && fits(v.kicker, "string", "kicker")) return "kicker is not a non-empty string"
  if (v.production !== undefined && fits(v.production, "string", "production")) return "production is not a non-empty string"
  if (v.sponsorTie !== undefined && !["none", "product", "competitor"].includes(v.sponsorTie)) return `sponsorTie is "${v.sponsorTie}", not none, product or competitor`
  if (v.facts !== undefined) {
    const why = fits(v.facts, [{ value: "string", measures: "string", source: "number" }], "facts")
    if (why) return why
    const bad = v.facts.findIndex((f) => !Number.isInteger(f.source) || !v.sources[f.source])
    if (bad >= 0) return `facts[${bad}].source names no source`
  }
  for (const [i, s] of v.sources.entries()) {
    if (s.lang !== undefined && !/^[a-z]{2}(-[A-Z]{2})?$/.test(s.lang)) return `sources[${i}].lang is not a language tag`
    if (s.published !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(s.published)) return `sources[${i}].published is not YYYY-MM-DD`
  }
  return null
}

/** Checks one imported file, and refuses it with the field that does not fit. */
export function toVideo(file: string, data: unknown): Video {
  const why =
    fits(data, CHECK, "") ??
    optional(data as Video) ??
    ((data as Video).short === undefined ? null : fits((data as Video).short, { youtube: "string", title: "string" }, "short")) ??
    (/^\d{4}-\d{2}-\d{2}$/.test((data as Video).published) ? null : "published is not YYYY-MM-DD") ??
    (file.split("/").at(-2) === (data as Video).slug ? null : `slug is not its folder's name`)
  if (why) throw new Error(`${file}: ${why}; run scripts/import-video.mjs again rather than editing it`)
  return data as Video
}

const FILES = import.meta.glob("../../content/videos/*/video.json", { eager: true, import: "default" })

export const VIDEOS: Video[] = Object.entries(FILES)
  .map(([file, data]) => toVideo(file, data))
  .sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug))

/* The videos in production (JN18), as scripts/import-upcoming.mjs copied each one from
   marketing into content/upcoming/<slug>.json: a title, and a line once the Alexandre
   writes one. A slug that is also a published video stops the build: it would be listed
   twice. */
const UPCOMING_FILES = import.meta.glob("../../content/upcoming/*.json", { eager: true, import: "default" })

export const UPCOMING: Upcoming[] = Object.entries(UPCOMING_FILES).map(([file, data]) => {
  const u = data as Upcoming
  const why =
    fits(u, { slug: "string", title: "string" }, "") ??
    (u.kicker !== undefined && fits(u.kicker, "string", "kicker") ? "kicker is not a non-empty string" : null) ??
    (u.line !== undefined && fits(u.line, "string", "line") ? "line is not a non-empty string" : null) ??
    (file.endsWith(`/${u.slug}.json`) ? null : "slug is not its file's name") ??
    (VIDEOS.some((v) => v.slug === u.slug) ? `${u.slug} is published already: delete content/upcoming/${u.slug}.json` : null)
  if (why) throw new Error(`${file}: ${why}; run scripts/import-upcoming.mjs again rather than editing it`)
  return u
})
