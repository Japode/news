import { useState } from "react"

/* The video as a click-to-load facade (JN5): the thumbnail with a play button. Nothing
   from YouTube loads until the reader clicks, and then only youtube-nocookie.com, so the
   page sets no YouTube cookie and stays light. Without JavaScript the facade is a plain
   link to the video on YouTube. Hydrated as an island, so its props are strings. */

export function VideoFacade({ youtube, title, thumb }: { youtube: string; title: string; thumb: string }) {
  const [playing, setPlaying] = useState(false)
  if (playing)
    return (
      <div className="jn-facade">
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
      className="jn-facade"
      href={`https://youtu.be/${youtube}`}
      data-facade={youtube}
      onClick={(e) => {
        e.preventDefault()
        setPlaying(true)
      }}
    >
      <img src={thumb} alt="" width={1280} height={720} />
      <span className="jn-play" aria-hidden="true" />
      <span className="jn-skip-text">Assistir: {title}</span>
    </a>
  )
}
