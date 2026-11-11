/* A house-ad slot (JN24): the frame this site draws around a Japode Ads banner. The
   network (ads.japode.com/v1/ads.js, loaded in index.html) fills the inner div at random
   on each visit from its own weighted catalogue; this site adds no logic to the choice.
   data-ad-memory="off" keeps the loader from storing its rotation, so nothing about the
   reader is kept, and data-ad-lang="" lets every campaign in, in any language.

   No visible label (the Alexandre, 2026-11-11: the banner names its own product); the
   aside keeps aria-label="Anúncio da casa" so a screen reader still says what it is.
   With scripts off, index.html's <noscript> hides every frame rather than leave it empty. */

type Props = {
  /** The network's layout family. */
  format: "strip" | "in-content" | "sidebar"
  /** What this placement is called, e.g. "home-strip". */
  slot: string
}

export function AdSlot({ format, slot }: Props) {
  return (
    <aside className={`jn-ad jn-ad-${format}`} aria-label="Anúncio da casa">
      <div data-japode-ads="" data-ad-format={format} data-ad-slot={slot} data-ad-theme="light" data-ad-memory="off" data-ad-lang="" />
    </aside>
  )
}
