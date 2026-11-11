import type { Video } from "../data/videos.ts"
import { longDate, minutes } from "../data/format.ts"
import { articleFor } from "../data/articles.ts"

/** One video on the home, as a blog lists a post: thumbnail, title, date, length and,
    once its article is approved, the article's opening sentence (JN6). */
export function PostRow({ video, href }: { video: Video; href: string }) {
  const summary = articleFor(video.slug)?.summary
  return (
    <article className="jn-post" id={video.slug}>
      <a href={href} className="jn-post-thumb" tabIndex={-1} aria-hidden="true">
        <img src={`/${video.slug}/thumbnail.jpg`} alt="" width={1280} height={720} loading="lazy" decoding="async" />
      </a>
      <div className="jn-post-body">
        <p className="jn-post-meta">
          <time dateTime={video.published}>{longDate(video.published)}</time>
          <span>{minutes(video.duration)}</span>
        </p>
        <h2 className="jn-post-title">
          <a href={href}>{video.title}</a>
        </h2>
        {summary && <p className="jn-post-summary">{summary}</p>}
      </div>
    </article>
  )
}
