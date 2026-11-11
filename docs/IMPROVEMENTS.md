# Improvements

## Block A — The site at japode.com.br

### §JN2 Serving japode.com.br

Copy `.github/workflows/deploy.yml` from japode.github.io: install, `npm run build`
(which ends in `verify.mjs`, so a failed check stops the deploy), and publish `dist/`
alone, so `docs/` and `scripts/` are never served. `public/CNAME` holds `japode.com.br`.

The steps outside the code were the Alexandre's, and are done since 2026-11-11: the
public repository `Japode/news` is pushed; Pages is on with the workflow as its source,
the custom domain `japode.com.br` and HTTPS enforced; at registro.br the apex has GitHub
Pages' four A records and `www` is a CNAME to `japode.github.io`. Until this task's
workflow deploys, the domain answers GitHub's 404. Nothing is pushed from a Claude
session.

Done when: https://japode.com.br answers 200 over HTTPS with the home page, and the http
and www addresses redirect to it.

## Block B — One page per video

### §JN7 The Scion page

Import `marketing/japode/scion`: YouTube `pffFIAU9uos`, published 2026-11-11, 5 min 15
s, with the title it has on YouTube, "A IA escreve tanto código que a Anthropic precisou
ir além do Git". The primary source is Anthropic's post "Redesigning source control at
Anthropic" (2026-10-13, updated 2026-10-15). The glossary has changeset, write-ahead
log, Spanner, derived data, checkout virtual, scion-daemon, scion-cache, scion-server,
Antique and superfans, with the definitions the video shows. The slug is chosen for the
search ("scion-anthropic"), and the article opens with what Scion is and why Git was not
enough.

Done when: the page is in the build with every term and all 33 credits (the clips on
screen, as the description lists them; `sources.json` holds 36, three never played), and
the Alexandre has approved the article.

### §JN8 The Docker page

Import `marketing/japode/docker`: the long video `gZEP6b_Fs00` (2026-11-10, 4 min 32 s,
titled "O que é Docker? A caixa de navio que mudou o software" once the Alexandre
applies the new title) and the Short `uMa5PYAAtcg` ("O Docker nasceu numa palestra de 5
minutos"), which goes on the same page as a vertical facade, not on a page of its own.
The Docker video defines no keyword on screen (no callout in its `shots.json` has a
`def`), so its import brings no terms and the "Termos" box stays out of this page.

The article opens by answering what Docker is, then tells the story the video tells: the
1956 shipping container, chroot, FreeBSD jails, Linux namespaces and cgroups, the five-
minute talk at PyCon 2013, Kubernetes and the Open Container Initiative.

Done when: the page is in the build with both videos, the chapters and every credit, and
the Alexandre has approved the article.

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

### §JN12 japode.com and japode.com.br

japode.com stays the English catalogue of the Japode products (decided on 2026-10-20 in
visibility), and japode.com.br is the channel's home in Portuguese. Here, the footer
links japode.com as "Os produtos da Japode". There, a task in Japode/japode.github.io's
roadmap (prefix JP), filed with `roadkeep -C`, adds a link to the channel and to
japode.com.br in its footer, in English. A video page links a product only when the
video is about it.

Done when: both footers link the other, and `verify.mjs` checks this side under JN12.
