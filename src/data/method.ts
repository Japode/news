/* The method page's copy (JN22), in one place. The sponsorship rules are promises the
   Alexandre makes to the reader, so they reach the page the way an article does: only
   once he approves them word for word, with the date in `approved`. Until then the page
   says who the sponsor is and whose it is, and nothing it has not confirmed. */

export const STEPS = [
  { title: "A fonte", text: "Um post, um paper ou um anúncio de quem fez a coisa. Fica registrado com título, data e link." },
  { title: "O roteiro", text: "Cada data e cada número do roteiro é conferido contra a fonte. O que não está nela não entra." },
  { title: "O vídeo", text: "Narração e música geradas com ElevenLabs. Imagens de terceiros só com licença CC BY, cada uma creditada." },
  { title: "A página", text: "O texto sai do roteiro, e o autor lê e aprova antes de a página ir ao ar." },
]

export const RULES = [
  { lead: "Todo número tem fonte.", text: " Na página, ele aponta para o documento de onde saiu." },
  { lead: "O texto não vai além do vídeo.", text: " Nada que não esteja no vídeo ou nas fontes." },
  { lead: "A voz é sintética, e a página diz isso.", text: " Na ficha de cada vídeo e na descrição do YouTube." },
  { lead: "Fonte em inglês é avisada.", text: " A página diz o idioma de cada fonte." },
]

export const SPONSORSHIP = {
  /** YYYY-MM-DD once the Alexandre approves the rules below word for word; null until then. */
  approved: null as string | null,
  rules: [
    "A Viglet não escolhe pauta nem lê roteiro antes de o vídeo sair.",
    "Quando um vídeo fala de um produto da Viglet ou de um concorrente direto, o aviso aparece no topo da página, antes do texto.",
    "A ficha de cada vídeo diz se a Viglet tem relação com o assunto.",
    "Os anúncios da casa mostram, sorteados a cada visita, outros produtos do mesmo autor. Ficam fora do texto, não seguem o leitor e não guardam nada sobre quem lê.",
  ],
}

/** The author, from visibility's VS48 bio (the employer is not named), and what he does here. */
export const AUTHOR = {
  bio: "Desenvolvedor brasileiro. Faz a Viglet, de busca corporativa em código aberto (Viglet Turing, Viglet Shio e Viglet Dumont), o Cursarei e ferramentas para o Claude Code. Escolhe os temas e aprova cada página do Japode antes de ela ir ao ar.",
  links: [
    { href: "https://alegauss.github.io", label: "alegauss.github.io" },
    { href: "https://github.com/alegauss", label: "GitHub" },
  ],
  /** A path under public/ once the Alexandre supplies a photo; never a placeholder. */
  photo: null as string | null,
}
