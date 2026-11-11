import { SITE } from "./site.ts"

/* The sponsor (JN17), in one place: a change to the sponsor is one edit here. The summary
   is japode.github.io's sponsor.json summary in Portuguese; products always by their full
   names, and every link points at a project site, never GitHub (the same link policy). The
   disclosure says what the reader most needs to know: Viglet is the author's. */

export const SPONSOR = {
  name: "Viglet",
  url: "https://www.viglet.org",
  /** visibility's marca/logo/viglet.svg, copied, never redrawn */
  logo: "/viglet.svg",
  summary: "Busca e conteúdo em código aberto para quem publica muito, nos próprios servidores e sem licença por usuário: ",
  products: [
    { name: "Viglet Turing", url: "https://turing.viglet.org" },
    { name: "Viglet Shio", url: "https://shio.viglet.org" },
  ],
  disclosure: "A Viglet é do autor do Japode e não escolhe nem revisa a pauta. ",
  rules: { href: `${SITE.method}#patrocinio`, label: "Como funciona o patrocínio" },
} as const
