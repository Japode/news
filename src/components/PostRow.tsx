import type { Video } from "../data/videos.ts"
import { longDate, minutes } from "../data/format.ts"

/** One video on the home, as a blog lists a post: thumbnail, title, date and length. */
export function PostRow({ video, href }: { video: Video; href: string }) {
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
      </div>
    </article>
  )
}
