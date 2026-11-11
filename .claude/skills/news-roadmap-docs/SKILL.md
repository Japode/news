---
name: news-roadmap-docs
description: How to work a task in this project's roadmap — the four docs/ files (ROADMAP.md, CHANGELOG.md, IMPROVEMENTS.md, DEFERRED.md) owned by the roadkeep CLI and never hand-edited, and above all the one-task-one-commit rule: every finished roadmap task ends in one local commit — `git add -- <its paths>` then `git commit -F <message file>`, no Claude attribution, never pushed — code plus doc sync in that single commit. Use whenever adding a task, picking the next JN-number, marking a task shipped, retiring, deferring, linting, editing any of those files, executing a block or a list of JN ids, or finishing any task that touches this repo.
---

# Roadmap tasks & committing

**No figure in this file is derived from the backlog.** Counts, the priority queue and
which ids are open are all things `roadkeep` answers, and a sentence here quoting one is a
sentence that was true on the day it was written. Where you would want a number, this file
names the read instead. Keep it that way.

## ⛔ READ FIRST — one task, one commit (non-negotiable)

**A task is not finished until the commit landed.** Commit with plain `git`, staged by
path, from the repo root — not `run-commit.cmd`, whose `git add *` takes the whole tree:

```
cd d:\Git\japode\news
git add -- <this task's paths>
git commit -F <message file>
```

- **Stage by path, never everything** — no `git add -A`, `.` or `*`. Another session in
  this checkout would have its files committed under your title, so
  `git diff --cached --stat` must list this task's files alone.
- **The message comes from a scratchpad file**: a conventional-commits title in ASCII, then
  a few plain lines on what changed and why. `-F` keeps it off the command line, where an em
  dash or an accent may not arrive as the bytes typed.
- **No attribution, no push.** No `Co-Authored-By` trailer, no "Generated with Claude
  Code" line, no `--author`: the commit is the user's, and it stays local. Hooks run —
  never `--no-verify`.
- **The doc sync rides in the same commit as the code**, so the governed files never
  describe a state that did not ship.
- **You may NOT do more than one task before committing.** A multi-task request
  (a whole block, or a list of `JN<n>`s) is _not_ permission to batch: it is a request
  to run them one at a time, committing after each.
- **A batch of ≥2 tasks runs under the `/loop` skill** (self-paced): exactly one task
  per iteration, committed at the end of that iteration, then advance. Do not
  hand-roll a loop that defers commits to the end.
- **Self-check before starting task N+1:** `git status` / `git log -1`. If the previous
  task's work is still in the working tree, stop and commit it first.
- **Declare your paths, then read them back at the moment of committing.**
  `roadkeep claim JN<n> --path <p>` says what the task will touch; **`roadkeep claim JN<n>`
  with no `--path` answers what you declared plus what the tree holds that another live claim
  says is its own.** `roadkeep claims` lists held, expired and stale, and `[claims] held` in
  `roadkeep.toml` is how long one stands.

The same rule applies to any finished unit of work in this repo, roadmap task or not:
when the work is done and validated, commit it the same way rather than leaving it in the
tree.

## The gate before the commit

Validated means the project's own checks were run, not that the edit looked right.
`roadkeep lint` is the gate every task passes, without exception — it is the only gate a
docs-only change has. Where a task adds a build or test step to this site, add it to this
section in the same commit.

A task that touches the site (anything outside `docs/`) also passes **`npm run build`**:
`tsc --noEmit`, the client and SSR builds, `scripts/prerender.mjs`, then
`scripts/verify.mjs`, which checks `dist/` against each shipped task's "done when" and
names the task a failure belongs to. A task with a checkable outcome adds its check there.

**Name EVERY task id an assertion holds, not just the one you are working.**

## ⛔ READ SECOND — four files are owned by `roadkeep`

[`roadkeep.toml`](../../../roadkeep.toml) declares this project's format — prefix `JN`,
`ref_scheme = "id"`, the markers, the limits — and [`.mcp.json`](../../../.mcp.json) plus
[`.claude/settings.json`](../../settings.json) wire the rest through
`.claude/hooks/roadkeep-launch.py` (engine named by `ROADKEEP_HOME` in settings): a hook
that **denies a hand-edit** to any governed file and names the command that does it, the
`mcp__roadkeep__*` tools whose input schema _is_ this project's format, and the upstream
`roadkeep` skill with the whole write path. **Reach for the MCP tools first**; the shell
fallback is that launcher, not a `roadkeep` on PATH.

Start a task with `brief`, not by reading the files; `lint` is the gate.

Each file has one job — never duplicate content between them:

| File                                                    | Single responsibility                                                                                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/ROADMAP.md`](../../../docs/ROADMAP.md)           | **Task status** — active backlog only (📋 designed · 💭 idea · ⏳ partial · 🛠 in-progress), one line per task, plus the `## Priority` queue, the block headings and the governed lists. |
| [`docs/CHANGELOG.md`](../../../docs/CHANGELOG.md)       | What has **shipped** — the ledger, indexed by block. Authoritative for the highest block letter.                                                                                            |
| [`docs/IMPROVEMENTS.md`](../../../docs/IMPROVEMENTS.md) | **Design rationale** for _unshipped_ work only. Deleted per task by the ship that closes it.                                                                                                |
| [`docs/DEFERRED.md`](../../../docs/DEFERRED.md)         | Lines **set aside** by `defer`, keeping their id, deps, symptom and section. `resume` brings one back.                                                                                      |

## The loop

- **`brief --claim`** picks the next line and briefs it in one read, taking it in the same
  transaction. **Reach for `--designed`** where much of the backlog is 💭 with its design
  still to write — `list --marker 💭` says how much.
- **Order is the `## Priority` section of `docs/ROADMAP.md`**, not `roadkeep.toml` and not
  opinion. `priority list` is the read; an empty queue means `pick` falls through to the
  lowest ready id. `priority add` / `priority drop` are the doors.
- **The read BEFORE an add is `delivered <block> --near "<the sentence you would file>"`.**
  It ranks that block's nearest deliveries against what you are about to propose.
- **Adding is `add --block <x> --symptom "…" --why "…" --section "…"`.** The `§JN<n>`
  pointer is derived. A line whose section is missing is a `ref.unresolved` finding, so
  file both halves in the one transaction. `budget` prices every field first.
- **The next id is `roadkeep next-id`** — it scans every governed file and never fills a
  gap. Retired ids are never reused.
- **Keep a task line terse** — symptom (what does not work, never a fix name) + one
  sentence of why + the pointer. The reasoning belongs in the section.

## Shipping, and the section it deletes

`ship <id> --why "<what now works>"` writes the ledger entry, clears the roadmap line and
**deletes the design section**, in one transaction or none. That deletion is correct, but it
is the last moment anything in that section can be saved.

**Read the section before you ship it**, and ask of each paragraph: _does this stop being
true when the code moves?_

| Answer                                     | Door                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| It explains **this file**                  | `--recorded-in <path>` — move the prose into that file's header or comment. **This is the common case.** |
| It is a rule the project must keep obeying | usually not a ship flag at all — `criterion add` or `non-goal add`, which are never deleted              |
| You read it and it had gone stale          | `--superseded-design "<what it was wrong about>"`                                                         |
| Nothing survives                           | ship plainly — most ships are this                                                                         |

**Never copy a section into a second file.**

**A design section may carry its own instruction** — a closing `On ship: --recorded-in
<path>` line. Honour it, revised against what was actually built.

## Everything else

- **Status lives in exactly one file.** If a marker anywhere disagrees with the roadmap, the
  roadmap wins.
- **A pause is `defer <id> --reason "…"`, not `retire`.** Retiring is terminal.
- **A false claim is `restate <id> --symptom "…"`**, which keeps the id, the deps, the marker
  and the design — not `retire` plus `add`.
- **`lint` reports and `repair` spends the report** — every finding names the command that
  closes it, and `explain <code>` says what a code means before you guess.
