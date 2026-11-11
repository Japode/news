/* Site-wide settings. Each one is a single edit: the origin every canonical link is
   written under, and the names the chrome repeats on every page. */

export const SITE = {
  name: "Japode",
  /** The origin every canonical URL is written under: the final address from day one. */
  origin: "https://japode.com.br",
  title: "Japode — vídeos curtos sobre as ferramentas de quem programa",
  description:
    "O site do canal Japode no YouTube: uma página por vídeo, com o vídeo, o texto escrito a partir dele, os termos que ele destaca e as fontes.",
  /** The English catalogue of the Japode products, which this site links and is linked from. */
  catalogue: "https://japode.com",
  github: "https://github.com/Japode",
  author: "Alexandre Oliveira",
  /** The theme choice is stored under this key, as every Japode site names its own. */
  themeKey: "japode-news-theme",
} as const

export const absolute = (path: string) => `${SITE.origin}${path}`
