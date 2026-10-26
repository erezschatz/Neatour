# 00 · Skeleton and documentation

## Context

**Promise.** A repository that a fresh session — human or Claude — can open and
understand without this conversation: what is being built, why, in what order,
how to set up the machines, and how work is recorded.

Arrived 2026-10-26, from Erez: "let's make it happen", restarting Neatour
from the May 2026 draft under the Unities.

**Acceptance**
- [x] `CLAUDE.md` with read-first order, the Unities paragraph (strict staging),
      code rules, division of labour
- [x] `docs/SPEC.md`, `docs/CONTRACT.md`, `docs/DECISIONS.md` (D1–D15),
      `docs/PLAN.md` (no status column), `docs/SETUP.md`
- [x] `docs/ATRIUM.md` and `docs/FIRST-DRAFT.md` — the reference material
- [x] `docs/UNITIES.md` planted verbatim and carried out: `check-unit.mjs` and
      its tests, `.claude/settings.json`, `.githooks/pre-commit`, `tasks/README.md`
      and template, `scripts/compile-changelog.mjs`, `docs/working-on-a-task.md`
- [x] `tasks/00`–`09`, one per plan step, each with a promise and acceptance
- [x] `deno.json` with `test`, `check`, `hooks`, `changelog` tasks
- [x] The hook tests pass; the gate refuses a probe
      commit; the compiler dry-run lists this task's record

## What was done

Kickoff under the `unities-project` skill on 2026-10-26, in a Claude session
with Erez answering the interview; the runbook `docs/UNITIES.md` was supplied
by Erez and planted verbatim.

Written: `CLAUDE.md`; `docs/SPEC.md`, `CONTRACT.md` (the May 2026 contract,
acknowledgment fields and routes moved to *reserved*, one change recorded as
D8: last-known checks are kept when an agent is unreachable), `DECISIONS.md`
D1–D15, `PLAN.md` (ten steps, no status column), `SETUP.md`, `ATRIUM.md`
(chamber facts read from the Atrium repo), `FIRST-DRAFT.md` (what survives of
the May draft and what is carried over), `working-on-a-task.md`; `tasks/00`–`09`,
`tasks/README.md` (naming adapted to `NN-slug`, no tracker), `_template.md`;
`deno.json`, `.gitignore`, `README.md`.

The runbook carried out for a new repo: `.claude/hooks/check-unit.mjs` with
this repo's rules (source = `agent/`, `hub/`, `frontend/` minus tests and
fixtures; test = `*.test.*` and `fixtures/`; doc = `docs/`, `README.md`,
`CLAUDE.md`; task = `tasks/*.md`; shared = `CHANGELOG.md`; strict staging as
the default `SCENE`), its twelve tests, `.claude/settings.json` (Stop and
PreToolUse), `.githooks/pre-commit`, `scripts/compile-changelog.mjs` with the
default convention (no prior changelog to match). No `tasks/adopt-unities.md`:
the adoption is part of this step's scene and is recorded here.

Three deviations from the runbook's appendices, each with its reason:
1. Hooks and compiler are invoked with `node`, not Deno (D15): under Deno 2.9.6
   `execSync` needs `/bin/sh` and the full environment, which defeats the
   narrow permission list.
2. `check-unit.mjs --branch` in the strict staging diffs against the empty tree
   when HEAD does not exist yet, so the hook runs on the repo's first commit.
3. `deno test` is scoped by `deno.json` `test.exclude` away from `.claude/`
   and `scripts/`, because Deno's `node:test` runs those files and fails them;
   `deno task test:hooks` runs them under Node.

Verified in the workspace (Linux, Node 22.23.4, Deno 2.9.6), 2026-10-26:
`deno task test:hooks` → 12 pass, 0 fail; `node .claude/hooks/check-unit.mjs
--branch` on the work tree → nothing; a probe source file staged alone →
`--staged` exits 2 naming the three missing roles; the same probe through a
real `git commit` with `core.hooksPath` set → refused. `deno task test` exits 1
with "No test modules found" until step 01 adds a unit, as its acceptance
expects. `deno task check` on an empty tree is a no-op. Not verified: anything
on the Mac — step 01 is that. Nothing was run on a server. The fresh-session
test is for Erez to run: open the repo in a new session and ask it what the
project is, what was decided and what comes next.
