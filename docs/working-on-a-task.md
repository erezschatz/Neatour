# Working on a task

The person's side of the Unities in this repo. `docs/UNITIES.md` is the
procedure that installed the gates; `CLAUDE.md` is the standing rule for the
agent. This page is for whoever sits down to do a step. Every sentence here is
checkable against the repository.

## 1. Receiving a task

- A task is a file in `tasks/`, named `NN-slug.md` after its row in
  `docs/PLAN.md`. The current task is the first one in PLAN order whose file
  has no `## What was done` section.
- `## Context` is the brief: the **Promise** (what the user gets, in the user's
  terms) and the **Acceptance** boxes. It is not edited after it arrives. If
  the brief turns out wrong, the fix is a new decision in `docs/DECISIONS.md`
  and a line under `## What was done` saying what changed and why.
- Something new turns up mid-step (a bug found in use, an idea, a request):
  write it as its own task file on arrival. If it is not a task file, it did
  not arrive.

## 2. Doing the work

- Strict staging (D14): **the commit is the scene.** A commit that changes
  source carries, in the same commit, its test, its doc line and its
  `## What was done` section. There is no "wip" commit. If the scene cannot
  be finished in this sitting, `git stash` or revert; do not commit half.
- Once per clone: `deno task hooks`. That points git at `.githooks/`, whose
  `pre-commit` runs `.claude/hooks/check-unit.mjs --staged` and refuses an
  incomplete scene. Claude Code gets the same check on `git commit` and at
  the end of every turn from `.claude/settings.json`.
- The roles, as the hook sees them:

  | Role   | Files |
  |--------|-------|
  | source | anything under `agent/`, `hub/`, `frontend/` that is not a test or fixture — `.ts`, `.js`, `.mjs`, `.sh`, `.json`, `.html`, `.css` |
  | test   | `*.test.ts` / `*.test.js` / `*.test.mjs` anywhere; anything under a `fixtures/` folder |
  | doc    | `docs/**`, `README.md`, `CLAUDE.md` |
  | task   | `tasks/*.md` except `README.md` and `_template.md` |
  | shared | `CHANGELOG.md` — compiled, never edited by hand |

  A commit that touches *source* must also touch *test*, *doc* and *task*.
  A doc-only or task-only commit is fine on its own.

- "Doc line" means the line that makes `docs/SPEC.md` (or `SETUP.md`,
  `CONTRACT.md`, `ATRIUM.md`) true again after the change. If nothing in the
  docs became false, the doc change is the acceptance box you tick in the task
  file — and that is a *task* change, not a *doc* one; the hook still wants a
  doc file. Say what the change means in one line in the most relevant doc.
  If there is truly no line to write, the change probably did not need to
  touch source.

## 3. Finishing

- Tick the acceptance boxes the commit satisfies.
- Append `## What was done` to the task file, last, because its presence is
  what marks the task done. Say what the diff does, what was verified, where
  and by whom (`verified 2026-10-26 by Erez on podcasts: …`), and what could
  not be verified. Once committed it is never edited; a later change gets a
  second `## What was done` section.
- Before committing, have a reader that did not write the record read the
  staged diff against the task file: does the record describe the diff —
  nothing claimed the diff does not do, nothing significant left out? In
  Claude Code, a read-only subagent; alone, read it cold after a break.
- The record becomes the changelog entry at release, verbatim. Write it so
  that it reads well there.

## 4. At commit

- `git commit` runs the hook. Refused means the scene is incomplete: it names
  the missing role. Add it or revert; `--no-verify` is for the release commit
  only (below).
- Run the gate by hand any time: `node .claude/hooks/check-unit.mjs --branch`
  shows what the working tree is still missing.

## 5. Releasing

- `deno task changelog <version>` prepends the task records since the last tag
  to `CHANGELOG.md`. Bump `version` in `deno.json` to match. Commit those two
  files with `--no-verify` (the hook forbids hand edits to `CHANGELOG.md` and
  cannot tell a compiled one from a hand edit outside a pull request), and tag.

## 6. Checklist

- [ ] The task file's acceptance boxes this commit satisfies are ticked
- [ ] A test beside the unit, run with `deno task test`
- [ ] The doc line that keeps `docs/` true
- [ ] `## What was done` appended, with how and by whom it was verified
- [ ] A cold reader checked the record against the diff
- [ ] Any rejected alternative has a `D<n>` entry
- [ ] `version` in `deno.json` bumped if this is meant to be installed
