import { SITE } from "../data/site.ts"
import { AUTHOR, RULES, STEPS } from "../data/method.ts"
import { ldJson, personLd } from "../data/structured.ts"
import { Island } from "../islands.tsx"

/* "Como fazemos", as its artboard draws it (JN22): how a video goes from a document to a
   page, the rules the site keeps, how corrections are handled, and who makes the videos.
   The copy is src/data/method.ts. The sponsorship section left on 2026-11-11 at the
   Alexandre's request; the band above the footer names the sponsor. Each run of copy is
   one string, so it shapes as the artboard's runs do (design/README.md). */

/* The author's links as icons: a globe for his site, GitHub's mark for GitHub. Inline,
   in the text colour, decorative to a screen reader, which reads the link's label. */
const ICONS = {
  site: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  github: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-1.97c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  ),
} as const

export function Method() {
  return (
    <div className="jn-method">
      <div className="jn-method-intro" data-design="intro">
        <h1>Como fazemos</h1>
        <p>Cada vídeo do Japode parte de documentos públicos. O vídeo e o texto contam o que esses documentos dizem, e a página mostra onde conferir.</p>
      </div>

      <section className="jn-method-steps" aria-labelledby="etapas" data-design="steps">
        <h2 id="etapas">Do documento à página</h2>
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span>{`Etapa ${i + 1}`}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="jn-method-columns">
        <div className="jn-method-main">
          <section aria-labelledby="regras" data-design="rules">
            <h2 id="regras">O que seguimos</h2>
            <ul className="jn-method-rules">
              {RULES.map((r) => (
                <li key={r.lead}>
                  <strong>{r.lead}</strong>
                  {r.text}
                </li>
              ))}
            </ul>
          </section>

          <section id="correcoes" aria-labelledby="correcoes-t" data-design="corrections">
            <h2 id="correcoes-t">Correções</h2>
            <p className="jn-method-lead">Quando um vídeo erra, a página dele ganha uma nota com a data, o que estava errado e o que está certo. A nota não some depois, e a descrição no YouTube recebe a mesma nota.</p>
            <div id="corrigir" className="jn-method-report">
              <h3>Envie uma correção</h3>
              <p>Diga em que vídeo, o que está errado e, se souber, onde está o certo. Cada correção é conferida antes de entrar na página.</p>
              <Island name="correction-form" />
            </div>
          </section>
        </div>

        <aside className="jn-method-author" aria-labelledby="autor-t" data-design="author">
          <section>
            <h2 id="autor-t">Quem faz</h2>
            {/* the photo beside the name and the links, the bio under both at full width */}
            <div className="jn-method-author-head">
              {AUTHOR.photo && <img src={AUTHOR.photo} alt={`Foto de ${SITE.author}`} width={88} height={88} />}
              <div>
                <p className="jn-method-author-name">{SITE.author}</p>
                <p className="jn-method-author-links">
                  {AUTHOR.links.map((l) => (
                    <a key={l.href} href={l.href} aria-label={l.label} title={l.label}>
                      {ICONS[l.icon]}
                    </a>
                  ))}
                </p>
              </div>
            </div>
            <p>
              {AUTHOR.bio.lead}
              <a href={AUTHOR.bio.claim.href}>{AUTHOR.bio.claim.text}</a>
              {AUTHOR.bio.tail}
            </p>
          </section>
        </aside>
      </div>

      {/* the author as the same schema.org Person alegauss.github.io publishes, by @id, so
          search engines read "Quem faz" as that one person; after the content, so the first
          element is still the intro */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(personLd()) }} />
    </div>
  )
}
