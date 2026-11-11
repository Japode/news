/* A video's article: content/videos/<slug>/article.md, written from the narration and the
   sources, rendered to HTML at build time (JN6). It tells the video's story in
   paragraphs: an opening that answers the search the video targets, then one `##`
   section per chapter, under the chapter's own title.

   The Alexandre approves an article before its page ships (CLAUDE.md), and the build
   holds that rule too: the file opens with front matter, and only one carrying
   `approved: YYYY-MM-DD` is put on the page. A draft without it is in the repository
   and nowhere on the site, so a push cannot publish it by accident.

   ---
   approved: 2026-11-12
   ---
   O Scion é ... (the opening; its first sentence is the summary)

   ## Trinta mil por dia
   ... */

import { marked } from "marked"

export interface Article {
  /** The day the Alexandre approved it, YYYY-MM-DD. */
  approved: string
  html: string
  /** The opening's first sentence, as plain text: the home row's summary and the page's description. */
  summary: string
  /** The `##` headings, in order. */
  headings: string[]
}

const FILES = import.meta.glob("../../content/videos/*/article.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>

const plain = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim()

function parse(file: string, source: string): Article | null {
  const m = source.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`${file}: an article opens with front matter (--- approved: YYYY-MM-DD ---)`)
  const approved = m[1].match(/^approved:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1]
  if (!approved) return null
  const body = m[2].trim()
  const opening = body.split(/\n\s*\n/)[0]
  if (!opening || opening.startsWith("#")) throw new Error(`${file}: the article opens with a paragraph, before its first heading`)
  const summary = plain(opening).match(/^.+?[.!?](?=\s|$)/)?.[0] ?? plain(opening)
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((h) => h[1].trim())
  return { approved, html: marked.parse(body, { async: false }), summary, headings }
}

const ARTICLES = new Map(
  Object.entries(FILES).flatMap(([file, source]) => {
    const article = parse(file, source)
    return article ? [[file.split("/").at(-2)!, article] as const] : []
  }),
)

/** The approved article of a video, or null while it has none. */
export const articleFor = (slug: string): Article | null => ARTICLES.get(slug) ?? null
