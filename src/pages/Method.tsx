import { SITE } from "../data/site.ts"
import { SPONSOR } from "../data/sponsor.ts"
import { AUTHOR, RULES, SPONSORSHIP, STEPS } from "../data/method.ts"
import { ldJson, personLd } from "../data/structured.ts"
import { Island } from "../islands.tsx"

/* "Como fazemos", as its artboard draws it (JN22): how a video goes from a document to a
   page, the rules the site keeps, how the sponsorship works, how corrections are handled,
   and who makes the videos. The copy is src/data/method.ts; the sponsorship's numbered
   rules show only once the Alexandre approves them. Each run of copy is one string, so
   it shapes as the artboard's runs do (design/README.md). */

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

          <section id="patrocinio" aria-labelledby="patrocinio-t" data-design="sponsorship">
            <h2 id="patrocinio-t">Patrocínio</h2>
            <p className="jn-method-lead">
              {"O Japode tem oferecimento da "}
              <a href={SPONSOR.url}>{SPONSOR.name}</a>
              {`, que faz o Viglet Turing, o Viglet Shio e o Viglet Dumont. A ${SPONSOR.name} é do ${SITE.author}, o autor do canal, e toda página diz isso no mesmo lugar, logo acima do rodapé.`}
            </p>
            {SPONSORSHIP.approved && (
              <ol className="jn-method-numbered">
                {SPONSORSHIP.rules.map((rule, i) => (
                  <li key={rule}>
                    <span>{String(i + 1)}</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            )}
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
            {AUTHOR.photo && <img src={AUTHOR.photo} alt={`Foto de ${SITE.author}`} width={96} height={96} />}
            <p className="jn-method-author-name">{SITE.author}</p>
            <p>
              {AUTHOR.bio.lead}
              <a href={AUTHOR.bio.claim.href}>{AUTHOR.bio.claim.text}</a>
              {AUTHOR.bio.tail}
            </p>
            <p className="jn-method-author-links">
              {AUTHOR.links.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
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
