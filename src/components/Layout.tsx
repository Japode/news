import type { ReactNode } from "react"
import { Footer, Header } from "../design/Chrome.tsx"

// Every page is its content between the one Header and the one Footer (JN16). The
// footer passes a visitor on (JN12) to japode.com, which links back here, to the
// channel and to the source; the header marks the page you are on.
export function Layout({ path, children }: { path: string; children: ReactNode }) {
  return (
    <>
      <a className="jn-skip" href="#main">
        Pular para o conteúdo
      </a>
      <Header current={path} />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
