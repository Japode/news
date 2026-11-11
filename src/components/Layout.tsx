import type { ReactNode } from "react"
import { SITE } from "../data/site.ts"

// The interim chrome, on the site's own design system (JN15): the mark and the name, and
// a footer that passes a visitor on (JN12) to japode.com, which links back here, to the
// channel and to the source. JN16 replaces both with the artboard's header and footer.
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
      <header className="jn-header">
        <div className="jn-container jn-header-row">
          <a className="jn-brand" href="/">
            <img src="/logo.svg" alt="" width={36} height={36} />
            {SITE.name}
          </a>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="jn-footer">
        <div className="jn-container jn-footer-row">
          <span>© 2026 {SITE.author}.</span>
          <nav aria-label="Rodapé">
            {FOOT.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  )
}
