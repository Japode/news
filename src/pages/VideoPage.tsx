import { SITE } from "../data/site.ts"
import type { Video } from "../data/videos.ts"
import { longDate, minutes } from "../data/format.ts"
import { Island } from "../islands.tsx"
import { articleFor } from "../data/articles.ts"
import { articleLd, ldJson, videoLd } from "../data/structured.ts"

/* A video's page, as a blog post (JN5): the title, the date and the length, the video
   behind a facade, the chapters, then the terms, the sources and the image credits. CC
   BY asks for the credits wherever the footage is shown, and the page shows it. The
   approved article goes between the video and the chapters (JN6). */

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
const LICENSE = (license: string) => (/Creative Commons Attribution/i.test(license) ? "CC BY" : license)

export function VideoPage({ video, description }: { video: Video; description: string }) {
  const watch = `https://youtu.be/${video.youtube}`
  const article = articleFor(video.slug)
  return (
    <article className="jn-column jn-video">
      {/* the page's facts as data (JN9): the video with its chapters, and the approved article */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(videoLd(video, description)) }} />
      {article && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(articleLd(video, article)) }} />}
      <header className="jn-intro">
        <p className="jn-post-meta">
          <time dateTime={video.published}>{longDate(video.published)}</time>
          <span>{minutes(video.duration)}</span>
        </p>
        <h1>{video.title}</h1>
      </header>

      <Island name="video-facade" props={{ youtube: video.youtube, title: video.title, thumb: `/${video.slug}/thumbnail.jpg` }} />

      {article && <div className="jn-article" dangerouslySetInnerHTML={{ __html: article.html }} />}

      <section aria-labelledby="capitulos">
        <h2 id="capitulos">Capítulos</h2>
        <ol className="jn-chapters">
          {video.chapters.map((c) => (
            <li key={c.start}>
              <a href={`${watch}?t=${c.start}`}>
                <span className="jn-time">{clock(c.start)}</span> {c.title}
              </a>
            </li>
          ))}
        </ol>
      </section>

      {video.short && (
        <section aria-labelledby="short">
          <h2 id="short">O Short</h2>
          <p className="jn-short-title">{video.short.title}</p>
          <Island name="video-facade" props={{ youtube: video.short.youtube, title: video.short.title, thumb: `/${video.slug}/short.jpg`, short: "yes" }} />
        </section>
      )}

      {video.terms.length > 0 && (
        <section className="jn-box" aria-labelledby="termos">
          <h2 id="termos">Termos</h2>
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

      {video.sources.length > 0 && (
        <section className="jn-box" aria-labelledby="fontes">
          <h2 id="fontes">Fontes</h2>
          <ul>
            {video.sources.map((s) => (
              <li key={s.url}>
                {s.text}: <a href={s.url}>{s.url}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="jn-box" aria-labelledby="creditos">
        <h2 id="creditos">Créditos das imagens</h2>
        <p>Trechos destes vídeos publicados no YouTube, cortados e reenquadrados para o vídeo:</p>
        <ul className="jn-credits">
          {video.credits.map((c) => (
            <li key={c.id} data-credit={c.id}>
              <a href={c.url}>{c.title}</a>, de <a href={c.channelUrl}>{c.channel}</a> ({LICENSE(c.license)})
            </li>
          ))}
        </ul>
      </section>

      <p className="jn-subscribe">
        <a href={watch}>Assistir no YouTube</a> · <a href={SITE.youtube}>inscrever-se no canal Japode</a>
      </p>
    </article>
  )
}
