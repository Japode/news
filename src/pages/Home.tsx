import { SITE } from "../data/site.ts"
import type { Video } from "../data/videos.ts"
import { PostRow } from "../components/PostRow.tsx"

/* The home reads as a blog, not a landing page (the Alexandre, 2026-11-11): one line on
   what the channel is, then every imported video, newest first, in one reading column.
   No video is written here: the list is content/videos/ (JN3). */

export function Home({ posts }: { posts: { video: Video; href: string }[] }) {
  return (
    <div className="jn-column">
      <header className="jn-intro">
        <h1>Japode</h1>
        <p>{SITE.description}</p>
      </header>
      <section aria-label="Vídeos">
        {posts.map(({ video, href }) => (
          <PostRow key={video.slug} video={video} href={href} />
        ))}
      </section>
      <p className="jn-subscribe">
        Novos vídeos saem no YouTube: <a href={SITE.youtube}>inscreva-se no canal Japode</a>.
      </p>
    </div>
  )
}
