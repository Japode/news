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
    creator: author(),
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

/** The author as schema.org knows him: the same Person, under the same @id, that
    alegauss.github.io publishes (its AG15), so a search engine reads every page here that
    names him as that one person, the one who also builds Viglet and Cursarei. Copied from
    alegauss.github.io's src/pages/Home.tsx personJsonLd(); a change there is made here too.
    The photo is this site's own copy. */
export const PERSON_ID = "https://alegauss.github.io/#person"

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.author,
    alternateName: ["alegauss", "Alê Oliveira"],
    url: "https://alegauss.github.io/",
    image: absolute("/alexandre.jpg"),
    nationality: { "@type": "Country", name: "Brazil" },
    jobTitle: "Software developer",
    worksFor: { "@type": "Organization", name: "Viglet", url: "https://www.viglet.org", sameAs: ["https://github.com/openviglet"] },
    affiliation: [{ "@type": "Organization", name: "Japode", url: "https://japode.com", sameAs: ["https://github.com/Japode"] }],
    sameAs: [
      "https://github.com/alegauss",
      "https://www.linkedin.com/in/alegauss/",
      "https://stackoverflow.com/users/2497985/alegauss",
      "https://huggingface.co/alegauss",
      "https://dev.to/alegauss",
      "https://x.com/alegauss",
      "https://bsky.app/profile/alegauss.bsky.social",
    ],
    knowsAbout: ["Enterprise search", "Content management systems", "Claude Code", "Coding agents", "Windows desktop apps"],
  }
}

/** The author where a page credits him: the whole Person, so the page needs no other script. */
const author = () => {
  const { "@context": _, ...person } = personLd()
  return person
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
    author: author(),
    publisher,
  }
}

/** JSON for a <script> element: "</" cannot close it early. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c")
