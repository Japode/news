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

### §JN26 JN26 — The sponsorship rules, once approved

The method page (JN22) says who sponsors the site and that Viglet is the author's, but
not the four numbered rules the artboard draws under "Patrocínio": they are promises to
the reader, so they reach the page only once the Alexandre approves them word for word,
the way an article does.

The rules wait in `src/data/method.ts` (`SPONSORSHIP.rules`):

1. A Viglet não escolhe pauta nem lê roteiro antes de o vídeo sair.
2. Quando um vídeo fala de um produto da Viglet ou de um concorrente direto, o aviso aparece no topo da página, antes do texto.
3. A ficha de cada vídeo diz se a Viglet tem relação com o assunto.
4. Os anúncios da casa mostram, sorteados a cada visita, outros produtos do mesmo autor. Ficam fora do texto, não seguem o leitor e não guardam nada sobre quem lê.

Once he confirms or rewrites them, set `SPONSORSHIP.approved` to the date. The page
shows the list, `scripts/verify.mjs` then requires it, and `design/regions.json` turns
the `sponsorship` region of `como-fazemos` on (tier 1, pixels against the artboard: a
rule reworded there means re-exporting the canvas with the same words first).

Done when the approved rules are on `/como-fazemos/` and its sponsorship region passes
`npm run visual`.
