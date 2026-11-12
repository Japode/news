import { SITE } from "../data/site.ts"
import type { Standalone } from "../data/standalone.ts"
import { readingMinutes, shortDate } from "../data/format.ts"
import { correctionsFor } from "../data/corrections.ts"
import { ldJson, standaloneLd } from "../data/structured.ts"
import { SourceLine, articleHtml } from "./VideoPage.tsx"

/* An article on its own (JN27): the video page without the video. The same breadcrumb,
   kicker, title, dek and byline bar; the sources box, the text with every [n] linking it,
   the corrections and how the text was made; the ficha in the aside. Styled by the video
   page's classes, so both read as one site. Nothing here is written for one article:
   every line comes from content/articles/<slug>/. */

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function ArticlePage({ post }: { post: Standalone }) {
  const { article, sources } = post
  const corrections = correctionsFor(post.slug)
  return (
    <div className="jn-video jn-standalone">
      <nav className="jn-video-crumbs" aria-label="Você está em">
        <a href="/">Início</a>
        {" / "}
        <a href="/#artigos">Artigos</a>
        {post.kicker ? ` / ${post.kicker}` : ""}
      </nav>

      <div className="jn-video-head">
        {post.kicker && <p className="jn-kicker">{post.kicker}</p>}
        <h1>{post.title}</h1>
        <p className="jn-video-dek">{article.summary}</p>
      </div>

      <div className="jn-video-byline">
        <span>
          {"Por "}
          <strong>{SITE.author}</strong>
        </span>
        <span>
          {"Publicado em "}
          <time dateTime={article.approved}>{shortDate(article.approved)}</time>
        </span>
        <span>{`Texto de ${readingMinutes(article.words)} min`}</span>
        <a href="#fontes">{sources.length === 1 ? "1 fonte primária" : `${sources.length} fontes primárias`}</a>
        <a className="jn-video-byline-quiet" href="#correcoes">
          {corrections.length ? plural(corrections.length, "correção", "correções") : "Sem correções"}
        </a>
      </div>

      <div className="jn-video-columns">
        <div className="jn-video-main">
          <section id="fontes" className="jn-sources" aria-labelledby="fontes-t">
            <h2 id="fontes-t">De onde vêm os fatos</h2>
            <p>{sources.length === 1 ? "Os fatos deste texto vêm de um documento:" : `Os fatos deste texto vêm de ${sources.length} documentos:`}</p>
            {sources.map((s, i) => (
              <SourceLine key={s.url} source={s} n={i + 1} />
            ))}
          </section>

          <article className="jn-article" dangerouslySetInnerHTML={{ __html: articleHtml(article.html, null) }} />

          <section id="correcoes" className="jn-video-notes" aria-labelledby="correcoes-t">
            <div>
              <h2 id="correcoes-t">Correções</h2>
              {corrections.length ? (
                <ul>
                  {corrections.map((c) => (
                    <li key={`${c.date}${c.wrong}`}>
                      <time dateTime={c.date}>{shortDate(c.date)}</time>
                      {`: estava “${c.wrong}”; o certo é “${c.right}”.`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {"Nenhuma até agora. Se este texto for corrigido, a data e o que mudou aparecem aqui. Viu um erro? "}
                  <a href={SITE.corrections}>Envie uma correção</a>.
                </p>
              )}
            </div>
            <div>
              <h2>Como este texto foi feito</h2>
              <p>
                {`Escrito a partir das fontes acima, sem acrescentar fatos, e aprovado por ${SITE.author} em ${shortDate(article.approved)}. `}
                <a href={SITE.method}>Mais sobre o método</a>
              </p>
            </div>
          </section>
        </div>

        <aside className="jn-video-aside" aria-label="Sobre este texto">
          <section className="jn-ficha" aria-labelledby="ficha-t">
            <h2 id="ficha-t" className="jn-video-label">
              Ficha
            </h2>
            <dl>
              <dt>Autor</dt>
              <dd>{SITE.author}</dd>
              <dt>Publicado</dt>
              <dd>{shortDate(article.approved)}</dd>
              <dt>Fontes</dt>
              <dd>{plural(sources.length, "primária", "primárias")}</dd>
              <dt>Correções</dt>
              <dd>{corrections.length ? String(corrections.length) : "nenhuma"}</dd>
            </dl>
          </section>
        </aside>
      </div>

      {/* the page's facts as data, after the content: an Article crediting the author */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(standaloneLd(post)) }} />
    </div>
  )
}
