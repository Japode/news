# Improvements

## Block A — The site at japode.com.br

### §JN1 The site skeleton

Japode/japode.github.io already solved this, so this site copies it: Vite and React 19,
prerendered by an SSR entry and `scripts/prerender.mjs`, `@viglet/viglet-design-system`
with the green tone (`src/tone.css` taken as it is), Tailwind 4, `tsc --noEmit`, and
`scripts/verify.mjs`, which checks `dist/` against every shipped task and names the task
a failure belongs to. Two Japode sites that build alike are one thing to maintain.

What differs is the language and the type. The page is `lang="pt-BR"`, `SITE.origin` is
`https://japode.com.br` from day one, and the theme key is `japode-news-theme`. Titles
use Plus Jakarta Sans ExtraBold and highlighted terms SemiBold, the type the videos draw
their keywords in (`marketing/japode/brand`), so a viewer who opens the site sees the
video's green and its type. The mark is copied from visibility's
`marca/logo/japode.svg`, the source of the three parent brands, and never redrawn; the
favicon and the manifest come from it.

Done when: `npm run build` passes, every route has a non-empty `#root`, every page is
canonical on `https://japode.com.br` with `<html lang="pt-BR">`, and the mark is the
favicon. `verify.mjs` holds each of these under JN1.

On ship: --recorded-in README.md

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

### §JN4 The home page

`/` shows the mark, one line on what the channel is (short videos in Portuguese about
the history and the reasons behind the tools developers use every day, told from real
sources), and then one card per video, newest first: the thumbnail, the title, the date,
the duration, a one-line summary and the link to the video's page. Under them, a link to
subscribe to the YouTube channel: its address is a single setting, `SITE.youtube`, set
to https://www.youtube.com/channel/UC8vYs--SLUt_vbwRwStUNxg, the channel's address.

No video is written into the page: the cards read `content/videos/` (JN3), so a new
video appears on the home by being imported, and nothing else. The footer links
japode.com and the GitHub organisation (JN12).

Done when: the home lists every video in `content/videos/`, newest first, each card
links its page, and the subscribe link is the channel's address. `verify.mjs` checks the
first two under JN4.

## Block B — One page per video

### §JN3 Importing a video from marketing

`scripts/import-video.mjs <marketing video folder> <slug>` runs on the Alexandre's
machine and reads what the video's own build already wrote: `narration/script.json` (the
lines in their written words and the chapter titles; `pronounce` is the voice's concern
and stays out), `shots.json` (the title and the keywords with their `def`, which become
the glossary), `sources.json` (every clip with the licence YouTube reports), the
chapters with their times from `out/<name>-pt-BR.description.txt`, and
`out/thumbnail.pt-BR.jpg`. What the build cannot know is passed as flags: `--youtube
<id>`, `--published <date>`, `--title` when the YouTube title differs from `shots.json`.

It writes `content/videos/<slug>/video.json` and `thumbnail.jpg`. The thumbnail is
versioned here, unlike marketing's media, because it is the site's own image.
`video.json` has a TypeScript type, and the build refuses one that does not fit it. The
README lists the steps for a new video, from the import to the published page.

Done when: importing `marketing/japode/scion` writes a `video.json` the build accepts,
and a second run with nothing changed changes no file.

### §JN5 The video page

`/<slug>/` shows the title as `h1`, the date and the duration, then the video as a
click-to-load facade: the thumbnail with a play button, which loads the
youtube-nocookie.com iframe only when clicked, so the page sets no YouTube cookie and
stays light. Then the article and the chapters, each one a link to
`youtu.be/<id>?t=<seconds>`.

Under the article, three boxes. "Termos": the words the video highlights in green, each
with its one-line definition from `shots.json`, the same words in the same green.
"Fontes": the primary source first (for Scion, Anthropic's post), then the others.
"Créditos das imagens": every Creative Commons clip with its author and link, which CC
BY requires wherever the footage is shown, the page included. The page ends with
watching it on YouTube and subscribing.

Done when: for each entry in `content/videos/`, `verify.mjs` finds a prerendered page
with its `h1`, the facade, every chapter link, every term and every credit.

### §JN6 The article

Each video has `content/videos/<slug>/article.md`. Claude writes it from `script.json`
and the sources, and the Alexandre approves it before the task that adds the video
ships. It tells the same story in paragraphs: the filler words go, each chapter is a
section under its title, and every number and quote links to the source it came from.
The first paragraph answers the search the video targets ("o que é Docker" for Docker,
"Scion Anthropic" for Scion).

The rule the videos keep holds here: nothing is made up, and no sentence goes beyond
what the video and its cited sources say. The Markdown is rendered at build time; one
small dependency is enough, with the design system's text styles.

Done when: a page shows its article with each chapter title as an `h2` and every number
linked to its source. `verify.mjs` checks the headings under JN6.

### §JN7 The Scion page

Import `marketing/japode/scion`: YouTube `pffFIAU9uos`, published 2026-11-11, 5 min 15
s, with the title it has on YouTube, "A IA escreve tanto código que a Anthropic precisou
ir além do Git". The primary source is Anthropic's post "Redesigning source control at
Anthropic" (2026-10-13, updated 2026-10-15). The glossary has changeset, write-ahead
log, Spanner, derived data, checkout virtual, scion-daemon, scion-cache, scion-server,
Antique and superfans, with the definitions the video shows. The slug is chosen for the
search ("scion-anthropic"), and the article opens with what Scion is and why Git was not
enough.

Done when: the page is in the build with every term and all 36 credits, and the
Alexandre has approved the article.

### §JN8 The Docker page

Import `marketing/japode/docker`: the long video `gZEP6b_Fs00` (2026-11-10, 4 min 32 s,
titled "O que é Docker? A caixa de navio que mudou o software" once the Alexandre
applies the new title) and the Short `uMa5PYAAtcg` ("O Docker nasceu numa palestra de 5
minutos"), which goes on the same page as a vertical facade, not on a page of its own.

The article opens by answering what Docker is, then tells the story the video tells: the
1956 shipping container, chroot, FreeBSD jails, Linux namespaces and cgroups, the five-
minute talk at PyCon 2013, Kubernetes and the Open Container Initiative.

Done when: the page is in the build with both videos, the chapters and every credit, and
the Alexandre has approved the article.

## Block C — Found, measured and linked

### §JN9 Structured data, sitemap and llms.txt

Each video page carries JSON-LD. A `VideoObject`: name, description, `thumbnailUrl`,
`uploadDate`, `duration` in ISO 8601, `embedUrl`, and one `Clip` per chapter under
`hasPart`, so Google can show key moments. An `Article`: headline, `datePublished`, the
author as japode.com names him, and Japode as publisher with the mark. `og:image` and
`twitter:image` are the 1280x720 thumbnail, and `og:type` is `video.other`.

`sitemap.xml` lists every route, with `lastmod` taken from the content's last commit, as
japode.com does, plus the video sitemap tags. `robots.txt` points to it. `llms.txt`
lists every video with its one-line summary and its page.

Done when: `verify.mjs` parses each page's JSON-LD and finds every field above, and the
sitemap lists every route.

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
