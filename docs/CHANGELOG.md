# Shipped Ledger

## Block A — The site at japode.com.br

- ✅ **JN1** **japode.com.br has no site: nothing builds a pt-BR page in the channel's look that reads without JavaScript** — japode.com.br builds: prerendered pt-BR pages in the green tone and the videos' type, canonical on the final origin, with the channel's mark as favicon (design recorded in `README.md`).
- ✅ **JN2** **Nothing is served at japode.com.br, so a link to it from a video description would lead nowhere** — https://japode.com.br answers 200 with the home page, deployed by the workflow, and the http and www addresses redirect to it.
- ✅ **JN4** **A visitor on the home page cannot tell what the Japode channel is about or where its videos are** — The home reads as a blog: the channel's one line, then every imported video newest first with thumbnail, date and length, and a link to subscribe on YouTube.

## Block B — One page per video

- ✅ **JN3** **A video's facts (YouTube id, date, chapters, terms, sources) live only in the private marketing repository** — scripts/import-video.mjs copies a video's facts and thumbnail from marketing into content/videos/<slug>/, idempotently, and the build refuses a video.json that misfits its type.
- ✅ **JN5** **There is no page for a video, so nothing outside YouTube can be searched for, linked to or quoted** — Each imported video has a prerendered blog-post page: title, a click-to-load nocookie facade, chapter links to their second, terms, sources and every CC BY credit.
- ✅ **JN6** **The narration is speech, with filler words and lines cut for the voice, so as an article it reads badly** — An approved article.md renders on its page, an h2 per chapter; its first sentence is the home summary and meta description; a draft stays off the site (design recorded in `src/data/articles.ts`).
- ✅ **JN7** **The Scion video has no page, though its subject is new and few texts in Portuguese explain it** — The Alexandre approved the Scion article on 2026-11-11, so its page shows the text, the summary and the reading time, and the home's lead shows the summary.
- ✅ **JN8** **The Docker video has no page, though "o que é Docker" is a search that does not go away** — The Alexandre checked the sources and approved the Docker article on 2026-11-11, so its page shows the text with every number linked to a source.

## Block C — Found, measured and linked

- ✅ **JN9** **Search engines and AI assistants see an embed but no structured facts about the video or the article** — Each video page carries VideoObject JSON-LD with a Clip per chapter, an Article once approved, and its thumbnail as card; sitemap.xml with video tags, robots.txt and llms.txt are built.
- ✅ **JN12** **japode.com and japode.com.br do not mention each other, so neither passes a visitor to the other** — Every page's footer links japode.com as "Os produtos da Japode", plus the channel and GitHub; the link back is JP18 in japode.github.io's roadmap.

## Block D — The site drawn in the artboard, pixel for pixel

- ✅ **JN13** **The artboard the site must match lives only in a private canvas, so no build can be compared against it** — The four artboards are static pages in design/ with PNG baselines from the pinned Playwright; verify checks each baseline and that none is published (design recorded in `design/README.md`).
- ✅ **JN14** **Nothing measures how far a built page is from its artboard, so "pixel perfect" is a judgement by eye** — npm run visual compares each enforced region with its artboard, both rendered live, in pixels or layout within 1px; --self proves it and the deploy runs both (design recorded in `scripts/visual.mjs`).
- ✅ **JN15** **The pages are drawn by the Viglet design system, whose type, colours and spacing are not the artboard's** — The site styles itself from src/design (tokens, base, primitives) with no Viglet design system, Tailwind or theme toggle; verify bans stray hex colours (design recorded in `src/design/tokens.css`).
- ✅ **JN16** **Header and footer are generic site chrome, not the artboard's, and nothing keeps them identical on every page** — One Header and one Footer from src/design match the artboard to the pixel at 1280 and 390; verify checks every page carries the same chrome HTML (design recorded in `src/design/Chrome.tsx`).
- ✅ **JN17** **No page says the site is sponsored by Viglet, nor that Viglet belongs to the author** — Every page shows the Oferecimento band above the footer, naming Viglet as the author's with no say over topics, matching the artboard to the pixel (design recorded in `src/design/Sponsor.tsx`).
- ✅ **JN18** **The import lacks the kicker, the numbers with their sources, the narration credit and the sponsor tie the artboard shows** — The import reads the narration credit and marketing's site.json (kicker, facts, sponsor tie); videos in production import too (design recorded in `scripts/import-video.mjs`).
- ✅ **JN19** **The home is a list of rows, not the artboard's lead story, video grid, method strip and term index** — The home is the artboard's: the lead with its source, the video grid with those in production, the method strip and the terms, passing the visual gate (design recorded in `src/pages/Home.tsx`).
- ✅ **JN20** **A video page lacks the artboard's byline bar, sources box, numbers table, chapters aside and ficha** — A video page has the artboard's byline bar, sources box, numbers table, terms, corrections, credits, chapters and ficha, passing the visual gate (design recorded in `src/pages/VideoPage.tsx`).
- ✅ **JN21** **At 390px a video page does not follow its mobile artboard: the aside is not folded into the column** — At 390px a video page follows its phone artboard: menu, edge-to-edge video, sources, folded chapters and ficha, all passing the visual gate (design recorded in `src/pages/video.css`).
- ✅ **JN22** **No page explains how a video is made, how the sponsorship works, how corrections are handled or who makes the videos** — The method page at /como-fazemos/ has the steps, the rules, the sponsor's tie, the corrections and the author, passing the visual gate (design recorded in `src/pages/Method.tsx`).
- ✅ **JN24** **The site never shows the author's other products, which every other Japode site cross-promotes** — Japode Ads fills a labelled strip on the home and an in-content and sidebar box on each video page, storing nothing and outside the article (design recorded in `src/design/AdSlot.tsx`).
- ✅ **JN23** **A reader who spots an error has no way to report it without hunting for an e-mail address** — #corrigir loads the Cognito form on a click only, linking its page with scripts off (design recorded in `src/components/CorrectionForm.tsx`).
