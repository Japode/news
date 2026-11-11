/* A house-ad slot (JN24): the frame this site draws around a Japode Ads banner. The
   network (ads.japode.com/v1/ads.js, loaded in index.html) fills the inner div at random
   on each visit from its own weighted catalogue; this site adds no logic to the choice.
   data-ad-memory="off" keeps the loader from storing its rotation, so nothing about the
   reader is kept, and data-ad-lang="" lets every campaign in, in any language (the
   Alexandre, 2026-11-11), not only the ones written in the page's Portuguese.
   The label says what the box is, so it never reads as part of the article. With
   scripts off, index.html's <noscript> hides every frame rather than leave it empty. */

type Props = {
  /** The network's layout family. */
  format: "strip" | "in-content" | "sidebar"
  /** What this placement is called, e.g. "home-strip". */
  slot: string
  /** The frame's name for the visual gate, e.g. "ad.label". */
  design: string
  /** One line under the banner, where the artboard draws one. */
  note?: string
  /** The label's text; the artboards spell it two ways. */
  label?: string
  className?: string
}

export function AdSlot({ format, slot, design, note, label = "Anúncio da casa · sorteado a cada visita", className = "" }: Props) {
  return (
    <aside className={`jn-ad jn-ad-${format} ${className}`.trim()} aria-label="Anúncio da casa">
      <p className="jn-ad-label" data-design={design}>
        {label}
      </p>
      <div data-japode-ads="" data-ad-format={format} data-ad-slot={slot} data-ad-theme="light" data-ad-memory="off" data-ad-lang="" />
      {note && <p className="jn-ad-note">{note}</p>}
    </aside>
  )
}
