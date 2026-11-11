# Roadmap (active backlog)

## Block A — The site at japode.com.br

- 📋 **JN1** (deps: —) **japode.com.br has no site: nothing builds a pt-BR page in the channel's look that reads without JavaScript** — Every later page needs the base japode.com already proved, so the two Japode sites look and build alike. → §JN1
- 📋 **JN2** (deps: JN1) **Nothing is served at japode.com.br, so a link to it from a video description would lead nowhere** — GitHub Pages from Japode/news, the way japode.com is served, costs nothing and deploys on every push to main. → §JN2
- 📋 **JN4** (deps: JN1, JN3) **A visitor on the home page cannot tell what the Japode channel is about or where its videos are** — The home is the link in the channel's bio, so it must say in one line what the videos are and list them newest first. → §JN4

## Block B — One page per video

- 📋 **JN3** (deps: —) **A video's facts (YouTube id, date, chapters, terms, sources) live only in the private marketing repository** — The build in GitHub Actions cannot read marketing, so one command must copy each video's facts here, never retyped. → §JN3
- 📋 **JN5** (deps: JN1, JN3) **There is no page for a video, so nothing outside YouTube can be searched for, linked to or quoted** — One page per video is what search engines and forums link to, and each one sends its reader back to the video. → §JN5
- 📋 **JN6** (deps: JN5) **The narration is speech, with filler words and lines cut for the voice, so as an article it reads badly** — A written article built from the same facts reads well and ranks for what people search, and it claims nothing beyond the sources. → §JN6
- 📋 **JN7** (deps: JN5, JN6) **The Scion video has no page, though its subject is new and few texts in Portuguese explain it** — Scion is a recent subject that specialists search for, with little written in Portuguese, so its page has the best chance of ranking first. → §JN7
- 📋 **JN8** (deps: JN5, JN6) **The Docker video has no page, though "o que é Docker" is a search that does not go away** — Docker is the channel's evergreen subject, and a page that answers "o que é Docker" can bring readers for years. → §JN8

## Block C — Found, measured and linked

- 📋 **JN9** (deps: JN5) **Search engines and AI assistants see an embed but no structured facts about the video or the article** — Video data lets Google show the thumbnail and the chapters in its results, and llms.txt lets assistants cite the article. → §JN9
- 📋 **JN10** (deps: JN2) **No number says whether the site brings anyone: which page was found, from which search, is unknown** — visibility measures every product through the Search Console, so japode.com.br needs a verified property that visibility can read. → §JN10
- 📋 **JN11** (deps: JN7, JN8) **The videos' descriptions do not link to their pages, so a viewer who would rather read never finds them** — The YouTube link brings a page its first visitors and Google its first signal, and only the Alexandre can change it. → §JN11
- 📋 **JN12** (deps: JN4) **japode.com and japode.com.br do not mention each other, so neither passes a visitor to the other** — One brand on two domains reads as two strangers unless each links the other, each in its own language. → §JN12

## Non-goals

- **Pages in English** japode.com is the English catalogue; this is the Portuguese home
  of a channel that speaks Portuguese, and an English page waits until a video exists in
  English.
- **The product catalogue** The products live at japode.com; a page here mentions one
  only when its video is about it.
- **Publishing from a Claude session** Claude prepares; the Alexandre pushes, changes
  the DNS, the YouTube descriptions and the forum posts.
- **Claims beyond a video's sources** An article says what the video and its cited
  sources say, nothing more, and no post is written only to fill the calendar.
- **Comments, newsletter or ads** The conversation stays in the YouTube comments; the
  site has no account and no form, and sets no cookie before consent.
