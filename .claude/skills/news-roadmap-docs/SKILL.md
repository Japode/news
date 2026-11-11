---
name: news-roadmap-docs
description: How to work a task in this project's roadmap — the governed docs/ files (ROADMAP.md, CHANGELOG.md, IMPROVEMENTS.md, plus DECISIONS.md and DEFERRED.md once roadkeep writes them) owned by the roadkeep CLI and never hand-edited, and above all the one-task-one-commit rule: every finished roadmap task ends in one local commit — `run-commit.cmd -m "<title>" -- <its paths>`, no Claude attribution, never pushed — code plus doc sync in that single commit. Use whenever adding a task, picking the next JN-number, marking a task shipped, retiring, deferring, linting, editing any of those files, executing a block or a list of JN ids, or finishing any task that touches this repo.
---

# Roadmap tasks & committing

**No figure in this file is derived from the backlog.** Counts, the priority queue and
which ids are open are things `roadkeep` answers; where you would want a number, ask it.

## ⛔ READ FIRST — one task, one commit (non-negotiable)

**A task is not finished until the commit landed.** Commit from the repo root, staged by
path:

```
cd d:\Git\japode\news
run-commit.cmd -m "<conventional-commits title>" -- <this task's paths>
```

- **Stage by path, never everything** — no bare `run-commit.cmd` (it runs `git add *`), no
  `git add -A`, `.` or `*`. Another session in this checkout would have its files committed
  under your title. If you staged by hand, `run-commit.cmd --staged -m "<title>"`.
- **Always pass `-m`** with a conventional-commits title in ASCII; the tool writes the body.
- **No attribution, no push.** No `Co-Authored-By` trailer, no "Generated with Claude Code"
  line: the commit is the user's, and it stays local. Hooks run — never `--no-verify`.
- **The doc sync rides in the same commit as the code**, so the governed files never
  describe a state that did not ship.
- **You may NOT do more than one task before committing.** A multi-task request (a whole
  block, or a list of `JN<n>`s) is a request to run them one at a time, committing after
  each.
- **A batch of ≥2 tasks runs under the `/loop` skill** (self-paced): one task per
  iteration, committed at the end of that iteration, then advance.
- **Self-check before starting task N+1:** `git status` / `git log -1`. If the previous
  task's work is still in the working tree, commit it first.
- **Declare your paths with `roadkeep claim JN<n> --path <p>`**; `roadkeep claim JN<n>` with
  no `--path` answers what you declared plus what another live claim says is its own.
  `[claims] held` in `roadkeep.toml` is how long one stands.

The same rule applies to any finished unit of work in this repo, roadmap task or not.

## The gate before the commit

Validated means the project's own checks were run, not that the edit looked right.

- **`roadkeep lint`** — every task, without exception. It is the only gate a docs-only
  change has.
- **The project's build and tests** — once the repo has code, list the exact commands here
  (one line each: command, what it holds, when to run it). Do not borrow another repo's.

## ⛔ READ SECOND — the governed files are owned by `roadkeep`

[`roadkeep.toml`](../../../roadkeep.toml) declares this project's format — prefix `JN`,
`ref_scheme = "id"`, the markers, the limits. [`.mcp.json`](../../../.mcp.json) and
[`.claude/settings.json`](../../settings.json) wire the rest through
`.claude/hooks/roadkeep-launch.py`: a hook that **denies a hand-edit** to any governed file
and names the command that does it, plus the `mcp__roadkeep__*` tools. **Reach for the MCP
tools first**; the shell fallback is that launcher. The upstream `roadkeep` skill has the
whole write path.

Start a task with `brief`, not by reading the files; `lint` is the gate.

| File                                                    | Single responsibility                                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`docs/ROADMAP.md`](../../../docs/ROADMAP.md)           | **Task status** — active backlog only, one line per task, plus `## Priority`, blocks, `## Done when` and `## Non-goals`. |
| [`docs/CHANGELOG.md`](../../../docs/CHANGELOG.md)       | What has **shipped**, indexed by block.                                                       |
| [`docs/IMPROVEMENTS.md`](../../../docs/IMPROVEMENTS.md) | **Design rationale** for _unshipped_ work only. Deleted per task by the ship that closes it.  |
| `docs/DECISIONS.md`                                     | **Constraints that outlive the work** — written by `ship --decides`.                          |
| `docs/DEFERRED.md`                                      | Lines **set aside** by `defer`; `resume` brings one back.                                     |

## The loop

- **`brief --claim`** picks the next line and briefs it, taking it in the same transaction.
  `--designed` skips 💭 ideas whose design is still to write.
- **Order is the `## Priority` section of `docs/ROADMAP.md`.** `priority list` reads it;
  `priority add` / `priority drop` change it.
- **Before an add, `delivered <block> --near "<the sentence you would file>"`** — the
  duplicate question asked before an id is spent.
- **Adding is `add --block <x> --symptom "…" --why "…" --section "…"`.** `budget` prices
  every field first. The next id is `roadkeep next-id`; retired ids are never reused.
- **Keep a task line terse** — symptom (what does not work, never a fix name) + one sentence
  of why + the pointer. The reasoning belongs in the section.

## Shipping, and the section it deletes

`ship <id> --why "<what now works>"` writes the ledger entry, clears the roadmap line and
**deletes the design section**. Read the section first and ask of each paragraph: _does this
stop being true when the code moves?_

| Answer                                                         | Door                                                        |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| It explains **this module**                                    | `--recorded-in <path>` — move the prose into that file.     |
| It is a rule the project must keep obeying                     | `criterion add` or `non-goal add`                           |
| A constraint with a rejected alternative, owned by no one file | `--decides "<the constraint>"`                              |
| It had gone stale                                              | `--superseded-design "<what it was wrong about>"`           |
| Nothing survives                                               | ship plainly                                                |

Never copy a section into a second file. Honour a section's own `On ship: …` line.

## Everything else

- **Status lives in exactly one file.** If a marker anywhere disagrees, the roadmap wins.
- **A pause is `defer <id> --reason "…"`, not `retire`.** Retiring is terminal.
- **A false claim is `restate <id> --symptom "…"`**, not `retire` plus `add`.
- **`lint` reports and `repair` spends the report**; `explain <code>` says what a code means.
