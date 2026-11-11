import { useState } from "react"

/* The video as a click-to-load facade (JN5): the thumbnail with a play button. Nothing
   from YouTube loads until the reader clicks, and then only youtube-nocookie.com, so the
   page sets no YouTube cookie and stays light. Without JavaScript the facade is a plain
   link to the video on YouTube. Hydrated as an island, so its props are strings. */

export function VideoFacade({ youtube, title, thumb, short }: { youtube: string; title: string; thumb: string; short?: string }) {
  const [playing, setPlaying] = useState(false)
  // a Short (JN8) is vertical, and its address on YouTube is /shorts/<id>
  const vertical = short === "yes"
  const className = vertical ? "jn-facade jn-facade-short" : "jn-facade"
  if (playing)
    return (
      <div className={className}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  return (
    <a
      className={className}
      href={vertical ? `https://www.youtube.com/shorts/${youtube}` : `https://youtu.be/${youtube}`}
      data-facade={youtube}
      onClick={(e) => {
        e.preventDefault()
        setPlaying(true)
      }}
    >
      <img src={thumb} alt="" width={vertical ? 405 : 1280} height={720} />
      <span className="jn-play" aria-hidden="true" />
      <span className="jn-skip-text">Assistir: {title}</span>
    </a>
  )
}
