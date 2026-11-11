/* Site-wide settings. Each one is a single edit: the origin every canonical link is
   written under, and the names the chrome repeats on every page. */

export const SITE = {
  name: "Japode",
  /** The origin every canonical URL is written under: the final address from day one. */
  origin: "https://japode.com.br",
  title: "Japode — vídeos curtos sobre as ferramentas de quem programa",
  /** The one line the home opens with: what the channel's videos are. */
  description:
    "Vídeos curtos, em português, sobre a história e os porquês das ferramentas que quem programa usa todo dia, contados a partir de fontes reais.",
  /** The channel, which the home asks the reader to subscribe to (JN4). */
  youtube: "https://www.youtube.com/@japode",
  /** The English catalogue of the Japode products, which this site links and is linked from. */
  catalogue: "https://japode.com",
  github: "https://github.com/Japode",
  author: "Alexandre Oliveira",
  /** The method page (JN22), which the header and the footer link. */
  method: "/como-fazemos/",
  /** Where a reader reports an error (JN23): the form on the method page. */
  corrections: "/como-fazemos/#corrigir",
} as const

export const absolute = (path: string) => `${SITE.origin}${path}`
