import { SiteButton, SiteHero } from "@viglet/viglet-design-system/site"

export function NotFound() {
  return (
    <SiteHero
      title="Não há nada"
      titleAccent="neste endereço."
      sub="A página pode ter mudado de lugar. Todos os vídeos estão a um clique da página inicial."
      actions={<SiteButton href="/">Ir para a página inicial</SiteButton>}
    />
  )
}
