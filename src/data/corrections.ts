/* A video's corrections (JN20): content/videos/<slug>/corrections.json, a list of
   { date, wrong, right }. Corrections are editorial, so they live in this repo, not in
   marketing; a page without the file has none. An article on its own (JN27) keeps its
   file in content/articles/<slug>/. The page prints each one and never
   drops it, so a correction once made stays on the page. */

export interface Correction {
  /** YYYY-MM-DD, the day the page was corrected. */
  date: string
  wrong: string
  right: string
}

const FILES = import.meta.glob(["../../content/videos/*/corrections.json", "../../content/articles/*/corrections.json"], { eager: true, import: "default" })

const BY_SLUG = new Map(
  Object.entries(FILES).map(([file, data]) => {
    const list = data as Correction[]
    const ok = Array.isArray(list) && list.every((c) => /^\d{4}-\d{2}-\d{2}$/.test(c?.date) && typeof c.wrong === "string" && c.wrong && typeof c.right === "string" && c.right)
    if (!ok) throw new Error(`${file}: a correction is { date: YYYY-MM-DD, wrong, right }`)
    return [file.split("/").at(-2)!, list] as const
  }),
)

/** A video's corrections, oldest first; empty when it has none. */
export const correctionsFor = (slug: string): Correction[] => [...(BY_SLUG.get(slug) ?? [])].sort((a, b) => a.date.localeCompare(b.date))
