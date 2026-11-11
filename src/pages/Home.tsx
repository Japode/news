import { SiteHero } from "@viglet/viglet-design-system/site"
import { SITE } from "../data/site.ts"

/* The skeleton's home: the mark and what the site is. The channel's line and the video
   cards are JN4's, read from content/videos/. */

export function Home() {
  return <SiteHero icon={{ src: "/logo.svg", alt: "Japode" }} badge="Japode" title="Vídeos curtos" titleAccent="sobre as ferramentas de quem programa." sub={SITE.description} />
}
