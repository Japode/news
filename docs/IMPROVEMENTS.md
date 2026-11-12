# Improvements

## Block A — The site at japode.com.br

## Block B — One page per video

## Block C — Found, measured and linked

### §JN10 Measuring the site

The Alexandre adds the domain property `sc-domain:japode.com.br` to the Search Console
(a TXT record at registro.br), sends the sitemap, and gives visibility's service account
read access. visibility then collects it like the other sites (`products.json` already
has the `japode-news` entry since 2026-11-11). Asking Google to index a page stays his
too.

Google Analytics is optional. If it comes, it loads only after the visitor allows it, as
japode.com's JP6 does: `SITE.analytics` stays null until a property exists, and no
banner is shown before then. On the YouTube side, the visits that come from
japode.com.br are read in YouTube Studio during visibility's reviews.

Done when: the property is verified, the sitemap is read without errors, and visibility
collects its clicks.

### §JN11 Linking from YouTube and the forums

For each video, Claude drafts in visibility (`drafts/japode-<slug>-youtube.md`) the line
that opens the description, for example "Leia o artigo, com os termos e as fontes:
https://japode.com.br/<slug>/?utm_source=youtube&utm_medium=description&utm_campaign=<slug>",
the same in the pinned comment, the channel's bio link pointing to the home, and the
entries for `actions.json`. The Alexandre applies them.

The TabNews and r/brdev drafts link to the page instead of the video, because a forum
takes an article better than a YouTube link, which reads as self-promotion.

Done when: every published video's description has its page's link, and `actions.json`
records each change with its date.

## Block D — The site drawn in the artboard, pixel for pixel

### §JN25 JN25 — The editorial fields for the two published videos

The import reads `marketing/japode/<video>/site.json` (JN18; its shape is in the header
of `scripts/import-video.mjs`), but neither the Scion nor the Docker folder has one yet.
So their pages can show no kicker above the title, no "Os números do vídeo" table, no
sponsor tie in the ficha, and no language or date beside a source.

What the Alexandre writes in marketing, for each video:

- `kicker`: the subject line ("Controle de versão" for the Scion, "Contêineres" for Docker in
  the artboard, his to confirm).
- `sponsorTie`: `none`, `product` or `competitor`. Neither video touches a Viglet product, as
  far as the scripts show, but the call is his.
- `facts`: each number the video states, as `{ value, measures, source }`, checked against the
  source the way the Git README's "Facts and their sources" table is. The Docker video names
  no primary source in its description yet, so its facts need its sources first (JN8 waits on
  the same).
- `sources`: `{ lang, published }` per source, in the description's order.

Then `node scripts/import-video.mjs` again for each video, with the flags `video.json`
already records. The pages need no change: they show these fields when present.

Done when both videos' `video.json` carry a kicker and a sponsor tie, and the Scion's
carries its facts.

## Block E — Articles on their own
