import type { ReactNode } from "react"
import { SiteFooter, SiteNav } from "@viglet/viglet-design-system/site"
import { SITE } from "../data/site.ts"
import { Island } from "../islands.tsx"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="jn-skip" href="#main">
        Pular para o conteúdo
      </a>
      <SiteNav brand={{ href: "/", name: SITE.name, logo: "/logo.svg" }} actions={<Island name="theme-toggle" />} />
      <main id="main">{children}</main>
      <SiteFooter brand={{ href: "/", name: SITE.name, logo: "/logo.svg" }} links={[]} disclaimer={<>© 2026 {SITE.author}.</>} />
    </>
  )
}
