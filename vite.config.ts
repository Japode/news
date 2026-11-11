import { readFileSync } from "node:fs"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// `vite dev` would serve index.html with an empty #root, since pages only exist once
// prerender.mjs fills the template. This renders the route on each request instead,
// through the same SSR entry, so dev shows the page the build would write.
function devPrerender(): Plugin {
  return {
    name: "dev-prerender",
    apply: "serve",
    configureServer(server) {
      return () =>
        server.middlewares.use(async (req, res, next) => {
          const url = req.originalUrl ?? "/"
          const path = url.split("?")[0]
          if (req.method !== "GET" || !req.headers.accept?.includes("text/html") || /\.\w+$/.test(path)) return next()
          try {
            const app = await server.ssrLoadModule("/src/entry-server.tsx")
            const { siteThemeScript } = await server.ssrLoadModule("@viglet/viglet-design-system/site")
            const route = app.ROUTE_META.find((r: { path: string }) => r.path === (path.endsWith("/") ? path : `${path}/`))
            let html = await server.transformIndexHtml(url, readFileSync("index.html", "utf8"))
            html = html
              .replace("<!--theme-script-->", `<script>${siteThemeScript(app.SITE.themeKey)}</script>`)
              .replace("<title>Japode</title>", `<title>${(route?.title ?? "Japode").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</title>`)
              .replace('<div id="root"></div>', `<div id="root">${app.render(path)}</div>`)
            res.statusCode = route ? 200 : 404
            res.setHeader("content-type", "text/html; charset=utf-8")
            res.end(html)
          } catch (err) {
            server.ssrFixStacktrace(err as Error)
            next(err)
          }
        })
    },
  }
}

// The client build writes dist/ with the index.html template; `vite build --ssr`
// writes dist-server/, and scripts/prerender.mjs fills the template once per route.
export default defineConfig({
  plugins: [react(), tailwindcss(), devPrerender()],
  build: { outDir: "dist", emptyOutDir: true },
})
