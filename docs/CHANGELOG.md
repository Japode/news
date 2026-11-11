# Shipped Ledger

## Block A — The site at japode.com.br

- ✅ **JN1** **japode.com.br has no site: nothing builds a pt-BR page in the channel's look that reads without JavaScript** — japode.com.br builds: prerendered pt-BR pages in the green tone and the videos' type, canonical on the final origin, with the channel's mark as favicon (design recorded in `README.md`).
- ✅ **JN2 (deploy workflow and CNAME)** **Nothing is served at japode.com.br, so a link to it from a video description would lead nowhere** — The Pages workflow builds, verifies and publishes dist/ alone on every push to main, with CNAME naming japode.com.br.
- ✅ **JN4** **A visitor on the home page cannot tell what the Japode channel is about or where its videos are** — The home reads as a blog: the channel's one line, then every imported video newest first with thumbnail, date and length, and a link to subscribe on YouTube.

## Block B — One page per video

- ✅ **JN3** **A video's facts (YouTube id, date, chapters, terms, sources) live only in the private marketing repository** — scripts/import-video.mjs copies a video's facts and thumbnail from marketing into content/videos/<slug>/, idempotently, and the build refuses a video.json that misfits its type.
- ✅ **JN5** **There is no page for a video, so nothing outside YouTube can be searched for, linked to or quoted** — Each imported video has a prerendered blog-post page: title, a click-to-load nocookie facade, chapter links to their second, terms, sources and every CC BY credit.

## Block C — Found, measured and linked

