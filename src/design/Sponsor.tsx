import { SPONSOR } from "../data/sponsor.ts"

/* The "Oferecimento" band (JN17): the sponsor, on every page, between the content and the
   footer and never inside an article, the way a TV newscast names who sponsors it. It
   says whose the sponsor is and that it has no say over the topics, and links the rules.
   Each run of copy is one string, so it shapes as the artboard's single runs do. */

export function Sponsor() {
  const [first, second] = SPONSOR.products
  return (
    <aside className="jn-sponsor" aria-labelledby="oferecimento" data-design="sponsor">
      <div className="jn-sponsor-row">
        <div className="jn-sponsor-brand">
          <span id="oferecimento" className="jn-sponsor-label">
            Oferecimento
          </span>
          <span className="jn-sponsor-divider" aria-hidden="true" />
          <a className="jn-sponsor-name" href={SPONSOR.url}>
            <img src={SPONSOR.logo} alt="" width={36} height={36} />
            {SPONSOR.name}
          </a>
        </div>
        <p className="jn-sponsor-summary">
          {SPONSOR.summary}
          <a href={first.url}>{first.name}</a>
          {" e "}
          <a href={second.url}>{second.name}</a>.
        </p>
        <p className="jn-sponsor-disclosure">
          {SPONSOR.disclosure}
          <a href={SPONSOR.rules.href}>{SPONSOR.rules.label}</a>
        </p>
      </div>
    </aside>
  )
}
