---
name: news-scan-channel
description: Scan the Japode YouTube channel and bring the site up to date with what it has published - a new video, a new Short of a video already on the site, a title changed on YouTube - by importing from marketing with scripts/scan-channel.mjs. Use when asked to check, sweep or sync the channel, update the site with the latest videos or Shorts, or when a video or Short was just published. Trigger words: varrer o canal, atualizar o site, últimas publicações, novo vídeo, novo Short, título mudou, sync channel.
---

# Bring the site up to date with the channel

The channel is the source of truth for **what** is published and **under which title**;
marketing (`D:\Git\viglet\marketing\japode\<video>`) is the source for **everything else**
(narration, chapters, terms, sources, credits, thumbnail, the Shorts' frames). The site
never retypes either: `scripts/scan-channel.mjs` reads both and runs
`scripts/import-video.mjs` with the flags it worked out. It runs only on the Alexandre's
machine, where marketing is checked out.

## 1. Read the plan

```
node scripts/scan-channel.mjs
```

It fetches the channel's feed (the newest 15 public uploads) and prints, per video:

- **a change**: the site's video, the reasons (YouTube title changed, a new Short matched to
  its cut, an old single-Short import to migrate) and the import command it would run;
- **NEW**: a full video on YouTube and not on the site, with the marketing folder it
  matched (a Short's `.txt` that links it, else the closest `shots.json` title) and the
  candidates;
- **UNDECIDED**: a Short whose title matches no marketing cut clearly enough, or whose
  video is not on the site yet;
- **NOTE**: what the feed cannot settle (a site video missing from the feed,
  `content/upcoming/` pointing at a folder that is gone or already cut).

Report the plan to the user in Portuguese before changing anything, unless they asked for
the update outright.

## 2. Decide what the script cannot

- **A new video needs a slug**, which is its address on the site: lowercase words joined by
  hyphens, in Portuguese, from the subject (`o-que-e-docker`, `scion-anthropic`). Propose
  one and ask the user; never invent it silently. Confirm the marketing folder too, when the
  plan says `unknown` or two candidates are close.
- **An UNDECIDED Short**: look at the candidate cuts' titles in
  `marketing/<video>/out/shorts/*.txt` and ask which cut it is. If its video is NEW, import
  the video first and scan again.
- A Short whose cut is not in marketing at all cannot be imported (no frame to show). Say
  so; don't fake one.

## 3. Apply

```
node scripts/scan-channel.mjs --apply
node scripts/scan-channel.mjs --apply --new <youtube id>:<marketing folder>:<slug>
```

`--apply` runs the import for every change in the plan (and each `--new`). Run the scan
again afterwards: it must say *the site has everything the feed lists*, or list only what
was left undecided on purpose. Never edit `content/videos/*/video.json` or a frame by hand;
when the result is wrong, fix the import or the marketing files and import again.

The imports write `content/videos/<slug>/video.json`, `thumbnail.jpg` and one
`short-<id>.jpg` per Short, and delete frames no Short names any more.

## 4. What the scan does not do

- **The article.** A new video ships its page without `article.md`. Writing one follows
  the project rules: it claims nothing beyond the video and its sources, and the Alexandre
  approves it before it ships. Offer to draft it, as a separate task.
- **Videos in production** (`content/upcoming/<slug>.json`, from
  `scripts/import-upcoming.mjs`): the scan only notes them. When the user drops a planned
  video, delete its file. When it is published, the import makes it a video, and its
  upcoming file must go in the same commit (the build refuses both at once).
- **Publishing.** Nothing is pushed. The Alexandre publishes.

## 5. Gate and commit

Run the gates from `news-roadmap-docs`: `npm run build` (it includes `verify.mjs`, which
checks every Short's facade and frame under JN8), then `npm run visual`, then
`roadkeep lint`. Commit as that skill says: one commit, staged by path
(`content/videos/<slug>/…`, `content/upcoming/…` when one went), message from a scratchpad
file, for example `feat(content): the Scion video's Shorts and its YouTube title`.
