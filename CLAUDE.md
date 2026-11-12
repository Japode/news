# japode news

The site of the Japode YouTube channel, served at **japode.com.br**, in Portuguese: one page
per video, with the video, the article written from it, the terms it highlights, its sources
and the image credits. japode.com stays the English catalogue of the Japode products
(`D:\Git\japode\japode.github.io`); this site does not link it (the Alexandre, 2026-11-11),
and its footer links only the method page and the channel.

The plan is roadkeep's (prefix `JN`): `docs/ROADMAP.md`, `docs/IMPROVEMENTS.md` and
`docs/CHANGELOG.md` are never edited by hand. The `news-roadmap-docs` skill says how a task
is worked and committed.

## The rules

- **Claude prepares, the Alexandre publishes.** Nothing is pushed from a session; the DNS at
  registro.br, GitHub Pages, the YouTube descriptions and the forum posts are his. Drafts for
  YouTube and forums live in `D:\Git\alegauss\visibility\drafts\`, and what was published in
  that repository's `actions.json`.
- **Drawn from the artboards, on its own design system**: Vite and React prerendered, like
  japode.com, but styled by `src/design/` (tokens, base, primitives), never the Viglet design
  system. The artboards in `design/` are the target; `scripts/verify.mjs` checks the build
  against each shipped task and `npm run visual` against the artboards.
- **The brand is the videos' brand**: the mark from visibility's `marca/logo/japode.svg`
  (never redrawn), green #2BCB6B to #11904A with #D4F7DF, Plus Jakarta Sans, as
  `marketing/japode/brand` draws it in the videos.
- **A video's facts are imported, never retyped**: they come from
  `D:\Git\viglet\marketing\japode\<video>` (private), which the CI cannot read, so they are
  copied into `content/videos/<slug>/` on the Alexandre's machine.
- **An article claims nothing beyond the video and its sources**, and the Alexandre approves
  it before its page ships. An article with no video (`content/articles/<slug>/`, JN27)
  claims nothing beyond the sources its `article.json` lists, under the same approval.
- **Always the full product name** when a Viglet product is named ("Viglet Turing", never
  "Turing").
