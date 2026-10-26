# CLAUDE.md — working in this repo

Neatour (neat · tour · ניטור) is a bespoke monitoring system for three personal
servers: a Deno agent on each server serves a status file that cron-driven bash
checks write; a hub, running as an Atrium chamber, polls the agents and serves a
single status page. One developer, one user, one phone. This file is how to work
here; what the system is lives in `docs/`.

## Read first, in this order

1. `docs/SPEC.md` — what Neatour is, scope, architecture, stack. The contract
   between the components is `docs/CONTRACT.md`, which SPEC points at.
2. `docs/DECISIONS.md` — why things are the way they are, and what was rejected.
   **Do not re-open a decision listed there without saying so explicitly**;
   propose a new entry instead of quietly doing it differently.
3. `docs/PLAN.md` — the ordered steps. Status is not written there: a step whose
   task file in `tasks/` has no `## What was done` section is open; the first
   such step is the current one.
4. `tasks/README.md` — what a task file is and how the record works.
5. `docs/ATRIUM.md` when touching the hub (it must be a valid chamber);
   `docs/FIRST-DRAFT.md` when the question is "how did the May draft do this?".
6. `docs/SETUP.md` only for toolchain or deployment-environment problems.

A new session with no memory of previous ones must be able to pick up from these
files alone. If something needed to continue the work is not in them, the
previous session failed the discipline below — fix the gap before doing anything
else.

## The Unities

The work, its record and its location are the same thing at the same time. Every
commit that changes source also carries its test, its doc line and a
`## What was done` section appended to the task file in `tasks/`. This is
enforced, not requested: a Stop hook refuses to end a turn with a half-recorded
change, and `git commit` refuses an incomplete scene
(`.claude/hooks/check-unit.mjs`). `CHANGELOG.md` is compiled from task records at
release (`deno task changelog <version>`) and is never edited by hand. If a change
cannot be completed with its record in this sitting, revert it; do not leave it
for later. Any choice with a rejected alternative gets a dated entry in
`docs/DECISIONS.md`; a listed decision is not reopened quietly but by a new entry.
Before committing, have a reader that has not seen the work check that the task
record describes the diff. The agent does not claim a build is green or a feature
works where it runs; Erez does. The developer's side of all this is
`docs/working-on-a-task.md`.

## Code rules

- TypeScript as a strong Node developer writes it. If a construct would be
  unreadable to a strong Node developer in week one of Deno, write it the plain
  way. No clever generics, no decorator frameworks, no `!`-assertions on data
  that came over the wire.
- Three code folders — `agent/`, `hub/`, `frontend/` — plus `agent/scripts/`
  for bash and `agent/servers/` for per-server check lists. That is the budget.
  No `shared/`, `common/`, `lib/` or `utils/`: the one shared thing, the data
  contract, is types in `hub/contract.ts` and `agent/contract.ts`, kept identical
  by a test (see `docs/CONTRACT.md`), because the agent is installed as a
  standalone folder and must not import across the repo.
- One file per unit (a handler, a reader, a poller, a check script); split at
  ~400 lines.
- Tests sit beside the unit as `<name>.test.ts`. Bash checks are tested by
  running them against fixtures under `agent/scripts/fixtures/`.
- Comments explain *why*. Every permission flag in a `deno run` line and every
  `set -euo pipefail` deviation gets a one-line reason beside it.
- No new dependency without a row in the Stack table in `docs/SPEC.md` saying
  what it replaces and why it is rote.
- The agent reads; it never runs checks. The hub polls; it never reaches into a
  server. The page talks to the hub and to public URLs; it never talks to an
  agent. When something misbehaves, read the layer's own log first
  (`journalctl -u neatour-agent`, the hub's poll log, the page's console), and
  fix it in the layer that owns the fact, not in the one that noticed.
- Every HTTP body the agent or hub returns is parseable JSON with HTTP 200, even
  on failure (CONTRACT §4). A non-200 from an agent is a transport failure, not a
  status.

## Division of labour

The programmer holds the helm, the LLM has the oars. Claude implements the
current step, runs `deno test` and `deno check` in its workspace, and reports
what it did and what it could not verify. Claude has no access to the three
servers or to Atrium: it cannot deploy, cannot see a status file, cannot poll an
agent. Erez deploys (by hand until step 08, by `agent/install.sh` after), runs,
opens the page on his phone, and says what happened. A step is done when he has
run it where it runs, not when it compiles. The record in the task file says
how it was verified and by whom.
