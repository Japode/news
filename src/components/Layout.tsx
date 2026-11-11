import type { ReactNode } from "react"
import { SiteFooter, SiteNav } from "@viglet/viglet-design-system/site"
import { SITE } from "../data/site.ts"
import { Island } from "../islands.tsx"

// The footer passes a visitor on (JN12): to japode.com, the English catalogue of the
// Japode products, which links back here; to the channel; and to the source.
const FOOT = [
  { href: SITE.catalogue, label: "Os produtos da Japode" },
  { href: SITE.youtube, label: "Canal no YouTube" },
  { href: SITE.github, label: "GitHub" },
]

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="jn-skip" href="#main">
        Pular para o conteúdo
      </a>
      <SiteNav brand={{ href: "/", name: SITE.name, logo: "/logo.svg" }} actions={<Island name="theme-toggle" />} />
      <main id="main">{children}</main>
      <SiteFooter brand={{ href: "/", name: SITE.name, logo: "/logo.svg" }} links={FOOT} disclaimer={<>© 2026 {SITE.author}.</>} />
    </>
  )
}
