import { SITE } from "../data/site.ts"
import type { Upcoming, Video } from "../data/videos.ts"
import type { Standalone } from "../data/standalone.ts"
import { articleFor } from "../data/articles.ts"
import { clock, readingMinutes, shortDate } from "../data/format.ts"
import { Button, Chip } from "../design/primitives.tsx"
import { AdSlot } from "../design/AdSlot.tsx"

/* The home, as the "Início" artboard draws it (JN19): the channel's line; the newest
   video as the lead, its source on the first screen; every video as a card, then the
   ones in production; what each page holds; and every term the videos explain. No
   video is written here: the list is content/videos/ and content/upcoming/.

   Each run of copy is one string, so it shapes as the artboard's single runs do (see
   design/README.md). A field a video lacks (a kicker before JN25, a dek before its
   article is approved) leaves its line out rather than inventing one. */

type Post = { video: Video; href: string }

const sourceCount = (n: number) => (n === 1 ? "1 fonte" : `${n} fontes`)

function Lead({ video, href }: Post) {
  const article = articleFor(video.slug)
  const source = video.sources[0]
  const byline = ` · ${shortDate(video.published)}${article ? ` · leitura de ${readingMinutes(article.words)} min` : ""}`
  return (
    <section className="jn-lead" aria-labelledby="destaque" data-design="lead">
      <a className="jn-lead-media" href={href}>
        <img src={`/${video.slug}/thumbnail.jpg`} alt={`Capa do vídeo: ${video.title}`} width={1280} height={720} />
        <span className="jn-lead-watch">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="7,4 20,12 7,20" />
          </svg>
          {`Assistir · ${clock(video.duration)}`}
        </span>
      </a>
      <div className="jn-lead-text">
        <p className="jn-kicker">{video.kicker ? `${video.kicker} · mais recente` : "Mais recente"}</p>
        <h1 id="destaque" className="jn-lead-title" data-design="lead.title">
          <a href={href}>{video.title}</a>
        </h1>
        {article && <p className="jn-lead-dek">{article.summary}</p>}
        <p className="jn-lead-byline">
          {"Por "}
          <strong>{SITE.author}</strong>
          {byline}
        </p>
        {source && (
          <div className="jn-lead-source">
            <span>Fonte:</span>
            {` ${source.text}. `}
            <a href={source.url}>Ler o original</a>
          </div>
        )}
        <div className="jn-lead-actions">
          <Button href={href}>Ler e assistir</Button>
          {video.sources.length > 0 && (
            <Button href={`${href}#fontes`} variant="outline">
              Ver as fontes
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

function Card({ video, href }: Post) {
  return (
    <article className="jn-card" id={video.slug}>
      <a href={href}>
        <img src={`/${video.slug}/thumbnail.jpg`} alt="" width={1280} height={720} loading="lazy" decoding="async" />
        {video.kicker && <span className="jn-kicker jn-kicker-small">{video.kicker}</span>}
        <span className="jn-card-title">{video.title}</span>
        <span className="jn-card-meta">{[shortDate(video.published), clock(video.duration), video.sources.length ? sourceCount(video.sources.length) : null].filter(Boolean).join(" · ")}</span>
      </a>
    </article>
  )
}

function UpcomingCard({ upcoming }: { upcoming: Upcoming }) {
  return (
    <div className="jn-card jn-card-upcoming">
      <span className="jn-card-placeholder">
        <strong>Em produção</strong>
      </span>
      {upcoming.kicker && <span className="jn-kicker jn-kicker-small jn-kicker-muted">{upcoming.kicker}</span>}
      <span className="jn-card-title">{upcoming.title}</span>
      {upcoming.line && <span className="jn-card-meta">{upcoming.line}</span>}
    </div>
  )
}

const METHOD = [
  { title: "O vídeo", text: "Com os capítulos, para pular direto ao trecho que interessa." },
  { title: "O texto", text: "Escrito a partir do vídeo. Não afirma nada que não esteja nele ou nas fontes." },
  { title: "As fontes", text: "Cada número aponta para o documento de onde saiu, com data e link." },
  { title: "Os créditos", text: "Toda imagem de terceiros, com canal, link e licença." },
]

/** An article on its own (JN27): a card of text, no thumbnail, as it has no video. */
function ArticleCard({ post }: { post: Standalone }) {
  const meta = [shortDate(post.article.approved), `leitura de ${readingMinutes(post.article.words)} min`, sourceCount(post.sources.length)].join(" · ")
  return (
    <article className="jn-text-card" id={post.slug}>
      <a href={`/${post.slug}/`}>
        {post.kicker && <span className="jn-kicker jn-kicker-small">{post.kicker}</span>}
        <span className="jn-card-title">{post.title}</span>
        <span className="jn-text-card-summary">{post.article.summary}</span>
        <span className="jn-card-meta">{meta}</span>
      </a>
    </article>
  )
}

export function Home({ posts, upcoming, articles = [] }: { posts: Post[]; upcoming: Upcoming[]; articles?: Standalone[] }) {
  const [lead] = posts
  const terms = posts
    .flatMap(({ video, href }) => video.terms.map((t) => ({ term: t.term, href: `${href}#termos` })))
    .sort((a, b) => a.term.localeCompare(b.term, "pt-BR", { sensitivity: "base" }))
  const count = posts.length === 1 ? "1 vídeo" : `${posts.length} vídeos`
  return (
    <div className="jn-home">
      <p className="jn-home-intro" data-design="intro">
        {SITE.description}
      </p>

      {lead && <Lead {...lead} />}

      <section id="todos" className="jn-home-videos" aria-labelledby="todos-t" data-design="videos">
        <div className="jn-home-videos-head">
          <h2 id="todos-t">Todos os vídeos</h2>
          <span>{`${count} · mais recente primeiro`}</span>
        </div>
        <div className="jn-home-grid">
          {posts.map((p) => (
            <Card key={p.video.slug} {...p} />
          ))}
          {upcoming.map((u) => (
            <UpcomingCard key={u.slug} upcoming={u} />
          ))}
        </div>
      </section>

      {articles.length > 0 && (
        <section id="artigos" className="jn-home-videos" aria-labelledby="artigos-t">
          <div className="jn-home-videos-head">
            <h2 id="artigos-t">Artigos</h2>
            <span>{`${articles.length === 1 ? "1 artigo" : `${articles.length} artigos`} · mais recente primeiro`}</span>
          </div>
          <div className="jn-home-grid">
            {articles.map((a) => (
              <ArticleCard key={a.slug} post={a} />
            ))}
          </div>
        </section>
      )}

      <AdSlot format="strip" slot="home-strip" />

      <section className="jn-home-method" aria-labelledby="como" data-design="method">
        <h2 id="como">O que cada página traz</h2>
        <div className="jn-home-method-grid">
          {METHOD.map((m, i) => (
            <div key={m.title}>
              <span>{i + 1}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
        <p className="jn-home-method-more">
          <a href={SITE.method}>Como fazemos cada vídeo</a>
        </p>
      </section>

      {terms.length > 0 && (
        <section id="termos" className="jn-home-terms" aria-labelledby="termos-t" data-design="terms">
          <h2 id="termos-t">Termos explicados nos vídeos</h2>
          <p>Cada termo leva ao vídeo que o explica.</p>
          <div className="jn-home-chips">
            {terms.map((t) => (
              <Chip key={`${t.href}${t.term}`} href={t.href}>
                {t.term}
              </Chip>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
