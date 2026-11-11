import type { ReactNode } from "react"
import { SITE } from "./data/site.ts"
import { Home } from "./pages/Home.tsx"
import { NotFound } from "./pages/NotFound.tsx"

/* The route table: every page the site serves. prerender.mjs writes one page per row,
   and a video's page joins it as a row built from content/videos/ (JN5). */

export interface Route {
  path: string
  title: string
  description: string
  /** Listed in the sitemap. The 404 page is a route and not a page to index. */
  index: boolean
  render: () => ReactNode
}

export const ROUTES: Route[] = [
  {
    path: "/",
    title: SITE.title,
    description: SITE.description,
    index: true,
    render: () => <Home />,
  },
  {
    path: "/404/",
    title: "Página não encontrada — Japode",
    description: "Não há nada neste endereço.",
    index: false,
    render: () => <NotFound />,
  },
]

export const routeFor = (path: string): Route => {
  const clean = path.endsWith("/") ? path : `${path}/`
  return ROUTES.find((r) => r.path === clean) ?? ROUTES.find((r) => r.path === "/404/")!
}
