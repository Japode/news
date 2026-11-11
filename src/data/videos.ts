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
}

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
}

type Shape = "string" | "number" | { [field: string]: Shape } | [Shape]

const CHECK: { [K in Exclude<keyof Video, "short">]: Shape } = {
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

/** Checks one imported file, and refuses it with the field that does not fit. */
export function toVideo(file: string, data: unknown): Video {
  const why =
    fits(data, CHECK, "") ??
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
