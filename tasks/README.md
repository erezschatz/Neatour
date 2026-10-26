# tasks/

How to work on a task — receiving it, finishing it, what the unit needs:
`docs/working-on-a-task.md`. This file is the format.

One file per task. Task files are the record; everything else (CHANGELOG.md, boards,
status) is compiled from them and never edited by hand.

A task file is named `NN-<slug>.md`: the plan step number from `docs/PLAN.md`,
then a short kebab-case description. There is no work-item tracker (D14). A task
that is not a plan step — a fix found in use, a request that arrived — is named
by its slug alone, and listed in PLAN.md if it becomes a step. Renaming is fine;
the changelog compiler follows renames.

`## Context` here holds the **Promise** — what the user gets, in the user's
terms, never implementation — and the **Acceptance** checkboxes that make the
step done. Tick them in the same scene as the work.

A task file has:

- a title (H1);
- `## Context`: what was asked, by whom, where it came from — written when it arrived;
- `## What was done`: appended in the same unit (commit or pull request, by the repo's
  staging) as the change it describes, once, never edited afterwards once merged. A task
  may accumulate several such sections over several units; each is a separate entry in
  the compiled changelog.

Status is derived: no "what was done" → open; present → done; included in a compiled
release → shipped. There is no status field to keep in sync.

Outside input enters here and nowhere else. If it is not a task file, it did not arrive.
