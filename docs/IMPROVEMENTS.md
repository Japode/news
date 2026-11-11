# Improvements

## Block A — The site at japode.com.br

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

## Block D — The site drawn in the artboard, pixel for pixel

### §JN17 JN17 — The "Oferecimento" band

Chosen by the Alexandre on 2026-11-11: Viglet sponsors the site, and the form is this
site's own rather than the "Built on" `SiteSponsor` block the other Japode sites use. It
borrows the TV news "Oferecimento" card: one band, the same on every page, between the
content and the footer, never inside an article.

The band (`data-design="sponsor"`, background `#F2F4F3`, a hairline on top): the label
"OFERECIMENTO" (12px, 700, 0.12em), a 1px divider, Viglet's mark (36px, from
visibility's `marca/logo/viglet.svg`, never redrawn) and the name "Viglet" linking
viglet.org; then one sentence in Portuguese, carried over from `sponsor.json`'s summary
in the japode.github.io repo: "Busca e conteúdo em código aberto para quem publica
muito, nos próprios servidores e sem licença por usuário: Viglet Turing e Viglet Shio",
each product linking its site (no GitHub URLs, the same link policy); and the disclosure
"A Viglet é do autor do Japode e não escolhe nem revisa a pauta", linking the method
page's sponsorship section. Under 600px the three parts stack.

The copy lives in `src/data/sponsor.ts`, one place, so a change to the sponsor is one
edit. Products always by their full names.

Done when the band is in every prerendered page, `scripts/verify.mjs` checks the
disclosure sentence is present on each, and tier 1 passes for `data-design="sponsor"`.

### §JN18 JN18 — The fields the artboard reads

The artboard shows things `video.json` does not carry. Each gets a field in the `Video`
type and its CHECK, filled by `scripts/import-video.mjs` from
`marketing/japode/<video>`, and the import refuses a video without a required one rather
than inventing it:

- `kicker`: the subject line above the title ("Controle de versão", "Contêineres").
- `facts`: the "Os números do vídeo" rows, each `{ value, measures, source }`, `source` an index into `sources`. Marketing's README already keeps a "Facts and their sources" table for the Git video; the Scion and Docker folders gain one there first (outside this repo), never here.
- `sources[].lang`, so a page can say "Em inglês", and `sources[].published` for the date the sources box prints.
- `production`: the narration credit, read from the line the build writes into the YouTube description ("Narração e música geradas com ElevenLabs.").
- `sponsorTie`: `none`, `product` or `competitor`, set by the Alexandre in marketing for each video; the ficha prints it, and `product` or `competitor` puts the notice at the top of the page.
- `upcoming`: a marketing folder with a README and no `out/` video becomes a card "Em produção" with its title and one line, and nothing else.

The dek and the reading time are not fields: the dek is the approved article's summary
(JN6), and the minutes are counted from its words.

Done when both imported videos carry every field, and `scripts/verify.mjs` checks each
fact's `source` points at an existing source.

### §JN19 JN19 — The home as drawn

`Home.tsx` rebuilt to the "Início" artboard, in this order, each block carrying its
`data-design` name:

1. `intro`: the channel's line, "Vídeos curtos em português sobre a história e o porquê das ferramentas que desenvolvedores usam todo dia, contados a partir de fontes reais." (18px, at most 760px wide).
2. `lead`: the newest video. The thumbnail at 16:9 with `object-fit: contain` (never cropped: the thumbnails carry text to their edges) and "Assistir · m:ss" under it, not over it; beside it the kicker, the title (40px, 800), the dek, the byline, the first source with "Ler o original", and the buttons "Ler e assistir" and "Ver as fontes". Under 960px the two columns stack.
3. `videos`: "Todos os vídeos" with the count, a grid of cards (thumbnail, kicker, title, date, length, number of sources), newest first, then any `upcoming` card with its dashed frame.
4. `method`: "O que cada página traz", the four numbered columns, and the link to the method page once it exists.
5. `terms`: every term of every video as a chip, each linking its video's `#termos`.

The Japode Ads strip has its slot between `videos` and `method`, filled by its own task.

JN4's checks still hold: no landing hero class, and every video listed newest first.
Done when tier 2 passes for the home at 1280, with the Scion video imported as it is.

### §JN20 JN20 — The video page as drawn

`VideoPage.tsx` rebuilt to the "Página do vídeo" artboard. Main column: breadcrumb;
kicker; title (48px, 800); dek; the byline bar (author, date, length and reading time,
"N fonte(s) primária(s)" linking `#fontes`, and the correction state); the facade with
the thumbnail contained, never cropped; `sources` box, ink-bordered, "De onde vêm os
fatos", each source numbered with its date and language; the approved article, where a
`[n]` the article writes becomes a superscript link to `#fontes`; the `facts` table,
where the article places a `<!-- numeros -->` line, else after it; the terms as a
definition list; "Correções" beside "Como este vídeo foi feito" (the approval, and the
`production` credit); the credits as a table (title without emoji, channel, licence in
the caption).

Aside, 300px: the chapters, each linking the YouTube time; the ficha (author, date,
sources, corrections, narration, images, sponsorship from `sponsorTie`); "Assistir no
YouTube". Docker's Short, which the artboard does not draw, goes under the chapters with
the same chip styles and is left out of tier 2.

Corrections are editorial, so they live in this repo:
`content/videos/<slug>/corrections.json`, a list of `{ date, wrong, right }`, empty
meaning "Sem correções". A non-empty list prints in the box and turns the byline state
into a link.

Every JN5, JN6 and JN9 check keeps passing. Done when tier 1 passes for `sources` and
tier 2 for the Scion page at 1280.

### §JN21 JN21 — The video page on a phone

The "Página do vídeo — celular" artboard is the same page at 390px, rearranged rather
than shrunk, and it is reached with media queries on the JN20 markup, never with a
second template:

- the header folds the nav behind a 44px menu button (JN16);
- the title drops to 30px, the dek to 17px, and the byline bar becomes two lines;
- the facade runs edge to edge, past the 16px gutters;
- the sources box keeps its ink border, right under the video;
- the chapters become a `<details>` "Capítulos (N)", closed, between the sources and the article;
- the facts table becomes a list of rows, the value bold over what it measures, the source link on the right;
- the ficha moves after the article, before the "Assistir no YouTube" button, which spans the width;
- the sponsor band and the footer stack (JN16, JN17).

Every control stays at least 44px tall. The `<details>` needs no JavaScript, so the page
still reads with scripts off (JN1).

Done when tier 1 passes for header, sources, sponsor and footer at 390, and tier 2 for
the Scion page at 390.

### §JN22 JN22 — The "Como fazemos" page

A new route, `/como-fazemos/`, drawn from the "Como fazemos" artboard, indexed and in
the sitemap (JN9). The header's "Como fazemos" and the footer's correction link now
resolve here.

Its blocks, each with a `data-design` name:

- `steps`: "Do documento à página", four steps. The video step says what the YouTube descriptions already say: narration and music generated with ElevenLabs, footage only under CC BY.
- `rules`: "O que seguimos" (every number has a source, the text goes no further than the video, the voice is synthetic and the page says so, a source in English is flagged).
- `sponsorship` (`#patrocinio`): Viglet sponsors the site and belongs to the author; its numbered rules (no say over topics or scripts, a notice at the top when a video touches a Viglet product or a direct competitor, the tie in every ficha, house ads labelled and keeping nothing about the reader). The Alexandre confirms these rules word for word before the page ships, as with an article.
- `corrections` (`#corrigir`): the policy, plus the slot for the form, which its own task fills.
- `author`: Alexandre Oliveira, with the bio from visibility's VS48 draft (the employer is not named), and links to alegauss.github.io and GitHub. The photo shows only once the Alexandre supplies one, never a placeholder.

No house ad on this page. Done when tier 2 passes for it at 1280.

### §JN23 JN23 — The correction form

Decided on 2026-11-11: no e-mail address on the site; corrections arrive through a
Cognito Forms form in Viglet's account, embedded the way viglet.org does it
(`D:\Git\viglet\site\src\components\CognitoForm.tsx`: `seamless.js` with the account key
and a `data-form` id).

The form, created by the Alexandre (this task cannot start before it exists): "Vídeo" (a
choice of the published videos), "O que está errado" (required), "Onde está o certo" (a
link, optional), "Seu e-mail" (optional, only to answer). The artboard draws those four
fields and the "Enviar correção" button; the embed is styled to match with Cognito's
theme settings, and tier 2 is not run over it, since Cognito draws its own markup.

The non-goal allows the form but no cookie before consent, so the script is not loaded
with the page. `#corrigir` prerenders a facade in the artboard's frame, with a button
"Abrir o formulário"; the click loads the embed in place, the reader's own act, as the
video facade does for YouTube. With scripts off, the button is a link to the form's
public page on cognitoforms.com.

A video page's correction link carries the video's slug, which preselects it where
Cognito's prefill allows.

Done when `scripts/verify.mjs` finds no Cognito script in any prerendered HTML and the
facade on `/como-fazemos/`, and a submission from the built site reaches the Alexandre's
Cognito entries.

### §JN24 JN24 — House ads from Japode Ads

Decided on 2026-11-11: Japode Ads (ads.japode.com, the house network in
`D:\Git\japode\ads`) shows the author's products in parts of the site, picked at random
on each visit by the network's own weighted draw over `catalogue.json`. This site adds
no logic of its own to the choice.

Three slots, as the artboards draw them:

- the home, a strip between "Todos os vídeos" and "O que cada página traz";
- a video page, an in-content box after the article and before the terms;
- a video page, a sidebar box under "Assistir no YouTube" (on a phone it folds away, and the in-content box stays).

Each slot is the network's `div` (`data-japode-ads`, the matching `data-ad-format`, a
`data-ad-slot` naming the page and place, `data-ad-memory="off"` so nothing is stored),
loaded the way japode.github.io's `Layout.tsx` does, inside a frame this site draws: the
label "Anúncio da casa · sorteado a cada visita" above it (11px, 700, 0.1em), and on the
home a line under it saying the boxes show only the author's products and track nobody.
The "Como fazemos" page has no slot.

Tier 1 compares the frame and its label, never the banner, which changes on every load.
With scripts off a slot collapses to nothing rather than to an empty frame.

Done when the three slots are in the prerendered HTML with `data-ad-memory="off"`, and
none sits inside the article's markup.
