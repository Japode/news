import { renderToString } from "react-dom/server"
import { Layout } from "./components/Layout.tsx"
import { ROUTES, routeFor } from "./routes.tsx"
import { absolute } from "./data/site.ts"

export { ROUTES } from "./routes.tsx"
export { SITE } from "./data/site.ts"

export const render = (path: string) => renderToString(<Layout>{routeFor(path).render()}</Layout>)
export const canonicalUrl = (path: string) => absolute(path)
export const outputDir = (path: string) => path.replace(/^\/|\/$/g, "")
export const ROUTE_META = ROUTES.map(({ path, title, description }) => ({ path, title, description }))
