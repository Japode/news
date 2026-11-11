/* The facts a search engine reads from a video's page as data (JN9): a VideoObject with
   one Clip per chapter, so Google can show the key moments, and, once the article is
   approved, an Article. Built from the same imported facts the page shows, never typed. */

import { SITE, absolute } from "./site.ts"
import type { Video } from "./videos.ts"
import type { Article } from "./articles.ts"

/** 315 seconds as "PT5M15S". */
export const isoDuration = (seconds: number) => `PT${Math.floor(seconds / 60) ? `${Math.floor(seconds / 60)}M` : ""}${seconds % 60 ? `${seconds % 60}S` : ""}` || "PT0S"

export const thumbnailUrl = (video: Video) => absolute(`/${video.slug}/thumbnail.jpg`)

const publisher = {
  "@type": "Organization",
  name: SITE.name,
  url: absolute("/"),
  logo: { "@type": "ImageObject", url: absolute("/icon-512.png"), width: 512, height: 512 },
}

export function videoLd(video: Video, description: string) {
  const watch = `https://www.youtube.com/watch?v=${video.youtube}`
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description,
    thumbnailUrl: [thumbnailUrl(video)],
    uploadDate: video.published,
    duration: isoDuration(video.duration),
    embedUrl: `https://www.youtube.com/embed/${video.youtube}`,
    contentUrl: watch,
    inLanguage: "pt-BR",
    publisher,
    hasPart: video.chapters.map((c, i) => ({
      "@type": "Clip",
      name: c.title,
      startOffset: c.start,
      endOffset: video.chapters[i + 1]?.start ?? video.duration,
      url: `${watch}&t=${c.start}`,
    })),
  }
}

export function articleLd(video: Video, article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: video.title,
    description: article.summary,
    image: [thumbnailUrl(video)],
    datePublished: article.approved,
    inLanguage: "pt-BR",
    mainEntityOfPage: absolute(`/${video.slug}/`),
    author: { "@type": "Person", name: SITE.author },
    publisher,
  }
}

/** JSON for a <script> element: "</" cannot close it early. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c")
