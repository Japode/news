import { SITE } from "../data/site.ts"

/* The chrome every page shares (JN16): one Header and one Footer, drawn from the
   artboards in design/ and styled by chrome.css. Every page renders these two and
   nothing else around its content, so the header and footer HTML is the same on every
   page (scripts/verify.mjs checks it), save the aria-current of the page you are on. */

const NAV = [
  { href: "/#todos", label: "Vídeos" },
  { href: "/#termos", label: "Termos" },
  { href: SITE.method, label: "Como fazemos" },
]

function NavLinks({ current }: { current?: string }) {
  return (
    <>
      {NAV.map((l) => (
        <a key={l.href} href={l.href} aria-current={l.href === current ? "page" : undefined}>
          {l.label}
        </a>
      ))}
    </>
  )
}

/** The header: the mark and the name, the nav and the subscribe button; on a phone the
    nav folds behind a 44px menu button, a <details> that needs no JavaScript. */
export function Header({ current }: { current?: string }) {
  return (
    <header className="jn-head" data-design="header">
      <div className="jn-head-row">
        <a className="jn-head-brand" href="/">
          <img src="/logo.svg" alt="" width={36} height={36} />
          <span>{SITE.name}</span>
        </a>
        <nav className="jn-head-nav" aria-label="Principal">
          <NavLinks current={current} />
          <a className="jn-head-subscribe" href={SITE.youtube}>
            Inscrever-se no canal
          </a>
        </nav>
        <details className="jn-head-menu">
          <summary aria-label="Abrir menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </summary>
          <nav aria-label="Menu">
            <NavLinks current={current} />
            <a href={SITE.youtube}>Inscrever-se no canal</a>
          </nav>
        </details>
      </div>
    </header>
  )
}

const FOOT = [
  { href: SITE.method, label: "Como fazemos" },
  { href: SITE.youtube, label: "Canal no YouTube" },
  { href: SITE.github, label: "GitHub" },
  // japode.com is the apps site, which links back here (JN12); never "the English version"
  { href: SITE.catalogue, label: "Aplicativos Japode (japode.com)" },
]

/** The black footer: who makes the site, how corrections work, where to go next. */
export function Footer() {
  return (
    <footer className="jn-foot" data-design="footer">
      <div className="jn-foot-main">
        <div className="jn-foot-about">
          <span className="jn-foot-brand">
            <img src="/logo.svg" alt="" width={28} height={28} />
            {SITE.name}
          </span>
          {/* one string, not text and a variable: React would split it into separate text
              nodes, which Chrome shapes apart, and the kerning across the seams would
              differ from the artboard's single run */}
          <p>{`Vídeos curtos em português sobre as ferramentas de quem programa. Feito por ${SITE.author}.`}</p>
        </div>
        <div className="jn-foot-corrections">
          <span className="jn-foot-heading">Correções</span>
          <p>
            Quando um vídeo erra, a correção aparece na página dele, com data e o que mudou. Viu um erro? <a href={SITE.corrections}>Envie uma correção</a>.
          </p>
        </div>
        <nav className="jn-foot-nav" aria-label="Rodapé">
          {FOOT.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="jn-foot-legal">{`© 2026 ${SITE.name}`}</div>
    </footer>
  )
}
