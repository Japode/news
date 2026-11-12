import { renderToStaticMarkup } from "react-dom/server"
import { SITE } from "../data/site.ts"
import type { Fact, Source, Video } from "../data/videos.ts"
import { clock, readingMinutes, shortDate } from "../data/format.ts"
import { Island } from "../islands.tsx"
import { articleFor } from "../data/articles.ts"
import { correctionsFor } from "../data/corrections.ts"
import { articleLd, ldJson, videoLd } from "../data/structured.ts"
import { SPONSOR } from "../data/sponsor.ts"
import { AdSlot } from "../design/AdSlot.tsx"

/* A video's page, as the "Página do vídeo" artboard draws it (JN20). The main column
   carries what lets a reader check the video: the byline bar, the video, the sources box
   right under it, the article with every [n] linking its source, the numbers the video
   states, the terms, the corrections and how the video was made, and every credit. The
   aside carries the chapters, the ficha and the way to YouTube.

   Nothing here is written for one video: every line comes from content/videos/<slug>/.
   A field a video lacks leaves its line out (a kicker or the numbers before JN25, the
   dek and the article before the Alexandre approves it). Each run of copy is one string,
   so it shapes as the artboard's single runs do (design/README.md). */

const LANG: Record<string, string> = { en: "Em inglês.", es: "Em espanhol.", pt: "Em português." }
const NO_EMOJI = /[\p{Extended_Pictographic}\u{FE0F}]/gu
const CC_BY = /Creative Commons Attribution/i

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** The article's [n] marks as superscript links to the sources box, and the numbers
    table where the article asks for it with a <!-- numeros --> line. */
export function articleHtml(html: string, facts: string | null) {
  const marked = html.replace(/\[(\d+)\]/g, '<sup><a href="#fontes">[$1]</a></sup>')
  return facts && marked.includes("<!-- numeros -->") ? marked.replace("<!-- numeros -->", facts) : marked
}

export function SourceLine({ source, n }: { source: Source; n: number }) {
  const tail = [source.published ? `${shortDate(source.published)}.` : null, source.lang ? (LANG[source.lang.slice(0, 2)] ?? null) : null].filter(Boolean).join(" ")
  return (
    <p>
      <span className="jn-sources-n">{`[${n}]`}</span>
      {` ${source.text}. `}
      <a href={source.url}>Ler o original</a>
      {tail ? ` ${tail}` : ""}
    </p>
  )
}

function FactsTable({ facts }: { facts: Fact[] }) {
  return (
    <figure className="jn-facts" data-design="facts">
      <table>
        <caption>Os números do vídeo</caption>
        <thead>
          <tr>
            <th scope="col">Número</th>
            <th scope="col">O que mede</th>
            <th scope="col">Fonte</th>
          </tr>
        </thead>
        <tbody>
          {facts.map((f) => (
            <tr key={`${f.value}${f.measures}`}>
              <td>{f.value}</td>
              <td>{f.measures}</td>
              <td>
                <a href="#fontes">{`[${f.source + 1}]`}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export function VideoPage({ video, description }: { video: Video; description: string }) {
  const watch = `https://youtu.be/${video.youtube}`
  const article = articleFor(video.slug)
  const corrections = correctionsFor(video.slug)
  const facts = video.facts?.length ? video.facts : null
  const ccBy = video.credits.length > 0 && video.credits.every((c) => CC_BY.test(c.license))
  // the page is rendered once, on the server, and never hydrated: the table can be HTML
  const inline = Boolean(article && facts && article.html.includes("<!-- numeros -->"))
  const factsHtml = inline && facts ? renderToStaticMarkup(<FactsTable facts={facts} />) : null
  const length = `Vídeo de ${clock(video.duration)}${article ? ` · texto de ${readingMinutes(article.words)} min` : ""}`
  const tie = video.sponsorTie
  return (
    <div className="jn-video">
      <nav className="jn-video-crumbs" aria-label="Você está em" data-design="breadcrumb">
        <a href="/">Início</a>
        {" / "}
        <a href="/#todos">Vídeos</a>
        {video.kicker ? ` / ${video.kicker}` : ""}
      </nav>

      {(tie === "product" || tie === "competitor") && (
        <p className="jn-video-tie">
          {tie === "product"
            ? `Este vídeo fala de um produto da ${SPONSOR.name}, que patrocina o site e é do autor.`
            : `Este vídeo fala de um concorrente direto da ${SPONSOR.name}, que patrocina o site e é do autor.`}
        </p>
      )}

      <div className="jn-video-head">
        {video.kicker && <p className="jn-kicker">{video.kicker}</p>}
        <h1 data-design="title">{video.title}</h1>
        {article && <p className="jn-video-dek">{article.summary}</p>}
      </div>

      <div className="jn-video-byline" data-design="byline">
        <span>
          {"Por "}
          <strong>{SITE.author}</strong>
        </span>
        <span>
          {"Publicado em "}
          <time dateTime={video.published}>{shortDate(video.published)}</time>
        </span>
        <span>{length}</span>
        {video.sources.length > 0 && <a href="#fontes">{video.sources.length === 1 ? "1 fonte primária" : `${video.sources.length} fontes primárias`}</a>}
        <a className="jn-video-byline-quiet" href="#correcoes">
          {corrections.length ? plural(corrections.length, "correção", "correções") : "Sem correções"}
        </a>
      </div>

      <div className="jn-video-columns">
        <div className="jn-video-main">
          <div className="jn-video-player">
            <Island name="video-facade" props={{ youtube: video.youtube, title: video.title, thumb: `/${video.slug}/thumbnail.jpg` }} />
          </div>
          <p className="jn-video-note">
            {"O vídeo roda pelo YouTube. As imagens de terceiros estão creditadas "}
            <a href="#creditos">no fim da página</a>.
          </p>

          <section id="fontes" className="jn-sources" aria-labelledby="fontes-t" data-design="sources">
            <h2 id="fontes-t">De onde vêm os fatos</h2>
            {video.sources.length ? (
              <>
                <p>{video.sources.length === 1 ? "Os fatos do vídeo vêm de um documento:" : `Os fatos do vídeo vêm de ${video.sources.length} documentos:`}</p>
                {video.sources.map((s, i) => (
                  <SourceLine key={s.url} source={s} n={i + 1} />
                ))}
              </>
            ) : (
              <p>Este vídeo ainda não lista as fontes dos seus fatos.</p>
            )}
          </section>

          {/* on a phone the chapters fold here, closed, between the sources and the article
              (JN21); on a wide screen the aside shows them and this stays hidden */}
          <details className="jn-chapters-fold" data-design="chapters.fold">
            <summary>
              {`Capítulos (${video.chapters.length})`}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </summary>
            <ol className="jn-chapters">
              {video.chapters.map((c) => (
                <li key={c.start}>
                  <a href={`${watch}?t=${c.start}`}>
                    <span className="jn-time">{clock(c.start)}</span>
                    {c.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          {article && <article className="jn-article" data-design="article" dangerouslySetInnerHTML={{ __html: articleHtml(article.html, factsHtml) }} />}
          {facts && !inline && <FactsTable facts={facts} />}

          <AdSlot format="in-content" slot="video-inline" />

          {video.terms.length > 0 && (
            <section id="termos" className="jn-terms" aria-labelledby="termos-t" data-design="terms">
              <h2 id="termos-t">{`Os ${plural(video.terms.length, "termo", "termos")} deste vídeo`}</h2>
              <dl>
                {video.terms.map((t) => (
                  <div key={t.term}>
                    <dt className="jn-term">{t.term}</dt>
                    <dd>{t.def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section id="correcoes" className="jn-video-notes" aria-labelledby="correcoes-t" data-design="corrections">
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
                  {"Nenhuma até agora. Se este vídeo for corrigido, a data e o que mudou aparecem aqui. Viu um erro? "}
                  <a href={SITE.corrections}>Envie uma correção</a>.
                </p>
              )}
            </div>
            <div>
              <h2>Como este vídeo foi feito</h2>
              <p>
                {/* the production credit (video.production) stays in the data, off the page
                    (the Alexandre, 2026-11-11) */}
                {article ? `Este texto sai do vídeo, sem acrescentar fatos, e foi aprovado por ${SITE.author} em ${shortDate(article.approved)}. ` : ""}
                <a href={SITE.method}>Mais sobre o método</a>
              </p>
            </div>
          </section>

          <section id="creditos" className="jn-credits" aria-labelledby="creditos-t" data-design="credits">
            <h2 id="creditos-t">Imagens de terceiros</h2>
            <p>{ccBy ? `${plural(video.credits.length, "trecho", "trechos")}, todos publicados no YouTube com a licença Creative Commons Atribuição (CC BY), cortados e reenquadrados para este vídeo.` : `${plural(video.credits.length, "trecho", "trechos")} de vídeos do YouTube, cada um com a sua licença.`}</p>
            <div className="jn-credits-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Trecho</th>
                    <th scope="col">Canal</th>
                  </tr>
                </thead>
                <tbody>
                  {video.credits.map((c) => (
                    <tr key={c.id} data-credit={c.id}>
                      <td>
                        <a href={c.url}>{c.title.replace(NO_EMOJI, "").replace(/\s+/g, " ").trim()}</a>
                      </td>
                      <td>
                        <a href={c.channelUrl}>{c.channel}</a>
                        {ccBy ? "" : ` (${c.license})`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="jn-video-aside" aria-label="Neste vídeo">
          <section className="jn-video-chapters" aria-labelledby="capitulos-t" data-design="chapters">
            <h2 id="capitulos-t" className="jn-video-label">
              Capítulos
            </h2>
            <ol className="jn-chapters">
              {video.chapters.map((c) => (
                <li key={c.start}>
                  <a href={`${watch}?t=${c.start}`}>
                    <span className="jn-time">{clock(c.start)}</span>
                    {c.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>

          {video.short && (
            <section aria-labelledby="short-t">
              <h2 id="short-t" className="jn-video-label">
                O Short
              </h2>
              <p className="jn-short-title">{video.short.title}</p>
              <Island name="video-facade" props={{ youtube: video.short.youtube, title: video.short.title, thumb: `/${video.slug}/short.jpg`, short: "yes" }} />
            </section>
          )}

          <section className="jn-ficha" aria-labelledby="ficha-t" data-design="ficha">
            <h2 id="ficha-t" className="jn-video-label">
              Ficha
            </h2>
            <dl>
              <dt>Autor</dt>
              <dd>{SITE.author}</dd>
              <dt>Publicado</dt>
              <dd>{shortDate(video.published)}</dd>
              <dt>Fontes</dt>
              <dd>{video.sources.length ? plural(video.sources.length, "primária", "primárias") : "nenhuma listada"}</dd>
              <dt>Correções</dt>
              <dd>{corrections.length ? String(corrections.length) : "nenhuma"}</dd>
              <dt>Imagens</dt>
              <dd>{`${plural(video.credits.length, "trecho", "trechos")}${ccBy ? " CC BY" : ""}`}</dd>
              {tie && (
                <>
                  <dt>Patrocínio</dt>
                  <dd>{tie === "none" ? `${SPONSOR.name}, que não aparece neste vídeo` : `${SPONSOR.name}, que tem relação com o assunto`}</dd>
                </>
              )}
            </dl>
          </section>

          <a className="jn-button jn-button-solid jn-video-watch" href={watch}>
            Assistir no YouTube
          </a>

          <AdSlot format="sidebar" slot="video-side" />
        </aside>
      </div>

      {/* the page's facts as data (JN9), after the content so the first element is the
          breadcrumb, as in the artboard: the video with its chapters, and the article */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(videoLd(video, description)) }} />
      {article && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(articleLd(video, article)) }} />}
    </div>
  )
}
