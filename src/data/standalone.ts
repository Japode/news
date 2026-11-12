/* Articles on their own (JN27): a text with no video, written in this repo rather than
   imported, in content/articles/<slug>/:

     article.md    the same front matter as a video's article: `approved: YYYY-MM-DD`
                   puts it on the site, and without it the article is a draft on no page.
                   Then the opening paragraph (its first sentence is the summary) and one
                   `##` section per part. Every paragraph that states a number links its
                   source, and a `[n]` becomes a link to the sources box.
     article.json  { "title", "kicker"?, "sources": [{ "text", "url", "lang"?, "published"? }] }
                   with at least one source: an article claims nothing beyond its sources.

   The Alexandre approves an article before it ships, as with a video's (CLAUDE.md). A
   file that does not fit stops the build with its slug and field. Newest first. */

import { parse, type Article } from "./articles.ts"
import type { Source } from "./videos.ts"

export interface Standalone {
  slug: string
  title: string
  kicker?: string
  sources: Source[]
  article: Article
}

const META = import.meta.glob("../../content/articles/*/article.json", { eager: true, import: "default" })
const TEXT = import.meta.glob("../../content/articles/*/article.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const nonEmpty = (v: unknown) => typeof v === "string" && v.trim() !== ""

function check(slug: string, meta: Record<string, unknown>): string | null {
  if (!SLUG.test(slug)) return `the folder "${slug}" is not lowercase words joined by hyphens`
  if (!nonEmpty(meta.title)) return "title is not a non-empty string"
  if (meta.kicker !== undefined && !nonEmpty(meta.kicker)) return "kicker is not a non-empty string"
  const sources = meta.sources as Source[]
  if (!Array.isArray(sources) || sources.length === 0) return "sources lists nothing: an article claims nothing beyond its sources"
  for (const [i, s] of sources.entries()) {
    if (!nonEmpty(s?.text) || !/^https?:\/\//.test(s?.url ?? "")) return `sources[${i}] is not { text, url }`
    if (s.lang !== undefined && !/^[a-z]{2}(-[A-Z]{2})?$/.test(s.lang)) return `sources[${i}].lang is not a language tag`
    if (s.published !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(s.published)) return `sources[${i}].published is not YYYY-MM-DD`
  }
  return null
}

export const STANDALONE: Standalone[] = Object.entries(TEXT)
  .flatMap(([file, source]) => {
    const slug = file.split("/").at(-2)!
    const metaFile = file.replace(/article\.md$/, "article.json")
    const meta = META[metaFile] as Record<string, unknown> | undefined
    if (!meta) throw new Error(`${file}: content/articles/${slug}/ has no article.json with its title and sources`)
    const why = check(slug, meta)
    if (why) throw new Error(`${metaFile}: ${why}`)
    const article = parse(file, source)
    if (!article) return [] // a draft: in the repository and on no page
    return [{ slug, title: meta.title as string, kicker: meta.kicker as string | undefined, sources: meta.sources as Source[], article }]
  })
  .sort((a, b) => b.article.approved.localeCompare(a.article.approved) || a.slug.localeCompare(b.slug))
