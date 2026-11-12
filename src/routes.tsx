import type { ReactNode } from "react"
import { SITE } from "./data/site.ts"
import { UPCOMING, VIDEOS, type Video } from "./data/videos.ts"
import { Home } from "./pages/Home.tsx"
import { NotFound } from "./pages/NotFound.tsx"
import { VideoPage } from "./pages/VideoPage.tsx"
import { Method } from "./pages/Method.tsx"
import { minutes } from "./data/format.ts"
import { articleFor } from "./data/articles.ts"
import { STANDALONE, type Standalone } from "./data/standalone.ts"
import { ArticlePage } from "./pages/ArticlePage.tsx"

/* The route table: every page the site serves. prerender.mjs writes one page per row,
   and a video's page joins it as a row built from content/videos/ (JN5). */

export interface Route {
  path: string
  title: string
  description: string
  /** Listed in the sitemap. The 404 page is a route and not a page to index. */
  index: boolean
  /** The video a page is about: prerender.mjs writes its og:image, its sitemap tags and its llms.txt line (JN9). */
  video?: Video
  /** The article on its own a page is (JN27): its sitemap date and its llms.txt line. */
  post?: Standalone
  render: () => ReactNode
}

/** A page's description until its article is approved: what the page holds, and only that. */
const holds = (video: Video) =>
  [`${video.title}: o vídeo de ${minutes(video.duration)} do canal Japode, com os capítulos`, video.terms.length && "os termos", video.sources.length && "as fontes"]
    .filter(Boolean)
    .join(", ") + " e os créditos das imagens."

export const ROUTES: Route[] = [
  {
    path: "/",
    title: SITE.title,
    description: SITE.description,
    index: true,
    render: () => <Home posts={VIDEOS.map((video) => ({ video, href: postHref(video) }))} upcoming={UPCOMING} articles={STANDALONE} />,
  },
  // one page per imported video (JN5)
  ...VIDEOS.map<Route>((video) => ({
    path: `/${video.slug}/`,
    title: `${video.title} — Japode`,
    // the approved article's opening sentence, once there is one (JN6)
    description: articleFor(video.slug)?.summary ?? holds(video),
    index: true,
    video,
    render: () => <VideoPage video={video} description={articleFor(video.slug)?.summary ?? holds(video)} />,
  })),
  // one page per approved article on its own, no video (JN27)
  ...STANDALONE.map<Route>((post) => ({
    path: `/${post.slug}/`,
    title: `${post.title} — Japode`,
    description: post.article.summary,
    index: true,
    post,
    render: () => <ArticlePage post={post} />,
  })),
  // how the videos are made, the corrections, and who makes them (JN22)
  {
    path: SITE.method,
    title: "Como fazemos — Japode",
    description: "Como cada vídeo do Japode vai do documento à página: as fontes, o roteiro, as imagens, as correções e quem faz.",
    index: true,
    render: () => <Method />,
  },
  {
    path: "/404/",
    title: "Página não encontrada — Japode",
    description: "Não há nada neste endereço.",
    index: false,
    render: () => <NotFound />,
  },
]

// a slug two pages claim would leave one of them unreachable: stop the build instead (JN27)
for (const [i, r] of ROUTES.entries()) {
  if (ROUTES.findIndex((o) => o.path === r.path) !== i) throw new Error(`two pages claim ${r.path}: rename content/articles/${r.path.slice(1, -1)}/`)
}

/** Where the home sends a post: its page once it has one (JN5), the video until then,
    so no row links an address that answers 404. */
export const postHref = (video: Video) => (ROUTES.some((r) => r.path === `/${video.slug}/`) ? `/${video.slug}/` : `https://youtu.be/${video.youtube}`)

export const routeFor = (path: string): Route => {
  const clean = path.endsWith("/") ? path : `${path}/`
  return ROUTES.find((r) => r.path === clean) ?? ROUTES.find((r) => r.path === "/404/")!
}
