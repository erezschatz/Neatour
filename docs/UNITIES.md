# UNITIES.md — adopting the Unities in an existing repository

This file is a procedure, addressed to the agent that carries it out (Claude Code, or a
person). Planting it in `docs/` does nothing on its own. To apply it:

    claude
    > Read docs/UNITIES.md and carry it out.

It is safe to run more than once. Every step checks what already exists before writing,
so a second run on a migrated repo should change nothing.

Do **not** import this file into CLAUDE.md. It is a migration, not a standing rule. The
standing rule is one paragraph (Appendix E), and this procedure installs it.

For a **new** project, the `unities-project` skill is the front door: it runs the kickoff
interview and lays down `CLAUDE.md`, `docs/SPEC.md`, `docs/DECISIONS.md` and
`docs/PLAN.md`, then carries out this file for the record, the gates and the compiler.
For an **existing** repository, start here; Phase 3.9 creates those files from what the
code already is.

---

## 0. The form

The work, its record and its location are the same thing at the same time.

- **Place.** Everything the work consists of is a file in this repository. If `git diff`
  cannot see it, it is not on stage. The test that makes the files appear: a fresh
  session, human or agent, must be able to pick up from the repo alone; whatever it would
  need and cannot find is the previous session's failure. Outside input (a request, an
  incident, a decision from a meeting) enters through one door: it becomes a file on
  arrival — a task, or a decision.
- **Time.** The record is written in the same gesture as the change. Code, its test, its
  doc line and its task record are one unit. A change without its record is not a change
  with missing paperwork; it is a scene that did not happen.
- **Action.** There is one record. Task files are the record of what was done;
  `docs/DECISIONS.md` is the record of what was chosen and what was rejected, append-only,
  a decision reversed only by a new entry naming the old one. `CHANGELOG.md`, task boards,
  plans and status views are compiled from the records and never edited by hand.

### Two stagings

The form says what a scene is. It does not say how long one is, and that is where
practice pushes back. This procedure installs one of two stagings; Phase 2 decides which.

**Strict: the commit is the scene.** Every commit that touches source also carries its
test, its doc line and its task record, and the gates refuse anything less: `git commit`
refuses an incomplete scene and the agent cannot end a turn with one. If a scene cannot
be finished in the sitting, it is reverted, not saved for tomorrow. This is the ideal.
It holds where commits are already complete units: one developer, or a team that works
that way. Get it if you can.

**Adapted: the pull request is the scene.** Commits on the way are the developer's own
and may be anything, because in most teams a commit is a save, not a statement. The unit
that must be complete is the pull request, and the gate that refuses an incomplete scene
runs at merge. `git commit` and the end of a turn only warn, pointing at what the PR will
still fail on. This gives up part of the unity of time: the record may legitimately be
written at the end of the scene rather than beside each change, and the discard rule
goes with it (a half-scene sits as an open PR instead of being reverted). What keeps it
from being a Definition-of-Done with a better name is that the gate has teeth and the
warnings keep pulling toward same-gesture.

Both stagings use the same script and the same record. The difference is one constant
(`SCENE`) and which bindings are installed. Where a repo can later move from adapted to
strict, that is a one-line change and a settings entry.

---

## 1. Contract for the agent carrying this out

1. **Discover before you write.** Phase 2 produces a report and a proposal. Nothing in the
   repo is modified until the person approves it. Stop and wait; do not proceed on
   silence.
2. **One scene.** The whole adoption is one unit (a commit in the strict staging, a pull
   request in the adapted one), with its own task file (`tasks/adopt-unities.md`) that
   records what was done. If you cannot finish, revert; do not leave a half-migrated repo.
3. **Nothing is deleted.** Existing TODO, roadmap and changelog files are converted or
   retired in place with a pointer, never removed. History stays readable.
4. **Merge, don't clobber.** `.claude/settings.json`, husky hooks, `package.json`
   scripts and CLAUDE.md may already exist. Add to them; preserve what is there.
5. **Idempotent.** Before each write, check whether the target already carries the
   change (look for `check-unit.mjs` in hook config, for the `tasks/` folder, for the
   Unities paragraph in CLAUDE.md). Skip what is already done.
6. **Do not invent rules.** The role regexes in the check script come from what Phase 2
   finds, not from this document's examples.
7. **Do not guess at task content.** When converting TODO items, carry the text as
   written. Status, owner and history you cannot find are left absent, not fabricated.
8. **Record reasons truthfully.** When something is left out or changed from this
   document, the adoption task says what and why, in terms future readers can check. Do
   not record "could not be made to work" for something that was a choice.

---

## 2. Discover

Inventory the repository and write a short report to the person. Do not modify anything
in this phase.

### 2.1 Roles

Find where each role lives. There may be more than one location per role; there may be
none for some.

| Role | What to look for |
| --- | --- |
| source | `src/`, `lib/`, `app/`, `packages/*/src/`, language-specific layouts |
| test | `test/`, `tests/`, `__tests__/`, `*.test.*`, `*.spec.*`, `e2e/` |
| doc | `docs/`, `README.md`, `*.md` next to code (including `CLAUDE.md`), ADR folders |
| task | `TODO.md`, `TASKS.md`, `ROADMAP.md`, `BACKLOG.md`, `docs/todo*`, issue-like folders |
| changelog | `CHANGELOG.md`, `HISTORY.md`, `CHANGES.md`, `changes/`, `.changeset/` |

Record the glob for each role as it actually is in this repo. These become `RULES` in
the check script.

### 2.2 Existing enforcement and conventions

- Hooks: `.husky/`, `.githooks/`, `git config core.hooksPath`, `.claude/settings.json`,
  `.claude/hooks/`, `lefthook.yml`, `.pre-commit-config.yaml`.
- Agent instructions: `CLAUDE.md`, `.claude/rules/`, `AGENTS.md`. Note size; a CLAUDE.md
  over a few hundred lines is a place to put *less*, not more.
- Changelog convention: heading style, whether entries carry commit hashes or PR links,
  whether a version heading exists for unreleased work.
- Release mechanism: git tags (`git tag --sort=-creatordate | head`), `version` in
  `package.json` / `deno.json`, a release script, CI. The compiler needs a "since"
  boundary, and the gate needs to know which files a release PR may touch.
- Runtime. Use the one the repo already runs, not the one this document's examples use:
  `deno.json` → Deno; `bun.lockb` / `bunfig.toml` → Bun; otherwise Node (18+). The
  scripts in the appendices use only `node:` built-ins, which all three run; what
  changes is the invocation (see Appendix H) and where the git hook path is configured.
- **Which staging.** Strict (the commit is the scene) where commits are already complete
  units: in practice a single developer, or a team that has agreed to work that way.
  Adapted (the pull request is the scene) where commits are used as saves, or where
  merging already goes through a PR policy. Default to adapted for a multi-developer
  repo and strict for a single-developer one, and ask; this is the one decision in the
  procedure that is about people rather than files.
- Who commits. Does every commit go through the agent, or do commits also happen from a
  shell or an editor? This decides whether the git binding (3.3) is installed. The
  Claude Code `Stop` binding (3.2) is installed regardless; this is not a question.
- Who merges (adapted staging). Pull requests are merged by the CI service's merge
  button, by a person, or by a tool that completes them through an API. This decides
  where the gate (3.7) runs.
- Definition-of-Done checklists in CLAUDE.md, PR templates or docs. These are what the
  gates replace; note them for retirement.
- Work-item tracker. If tasks map to tracker items (Azure DevOps, Jira, GitHub issues),
  note the id format; task files are named with it (Appendix D).
- **The fresh-session gap.** What would a session that has only this repo not know?
  Look for a spec (`docs/SPEC.md`, a README that explains the *what*), a decision record
  (`docs/DECISIONS.md`, ADRs), a plan (`docs/PLAN.md`, a roadmap). For each that is
  missing, list the knowledge that currently lives in a wiki, a tracker, a chat or a
  person's head and would have to be written down. These become 3.9.
- **The verification loop.** Who builds, where it runs, and who says it works. The agent
  never claims a build is green or a feature works where it runs; a person does. Write
  down who that is, so it goes into `CLAUDE.md` as *Division of labour*.

### 2.3 The record to migrate

For each task-role file found, list its items. For each item capture: text as written,
apparent status (open / done / in progress, only if the file says so), any date, any
owner, any link. Produce a proposed mapping:

    TODO.md
      - [ ] Fix flaky parser test              -> tasks/fix-flaky-parser-test.md   (open)
      - [x] Migrate to ESM                      -> tasks/migrate-to-esm.md          (done, 2026-09-02)
    ROADMAP.md
      ## Q4: offline mode                       -> tasks/4711-offline-mode.md       (open, roadmap, item 4711)

Slugs: lowercase, hyphenated, from the item text, deduplicated, prefixed with the
tracker id where one is known. Group sub-bullets under their parent item as the task's
body, not as separate tasks, unless the person says otherwise.

### 2.4 The report

Send the person, in this order:

1. The role table with the globs you found and the `RULES` you intend to write.
2. The staging you propose (strict or adapted) and why, in two sentences.
3. What enforcement already exists and how you will merge into it.
4. The changelog convention you found and how the compiler will match it; which files a
   release PR touches besides `CHANGELOG.md`.
5. The release boundary you will use (last tag / version / first commit).
6. The runtime you will invoke the scripts with, and whether the git binding will be
   installed (yes if any commit can happen outside the agent; otherwise ask).
7. Adapted staging: where the gate will run (3.7), the CI service or the merging tool.
8. The TODO → `tasks/` mapping, in full.
9. The fresh-session gap: which of spec, decisions, plan are missing, and the knowledge
   each would have to capture, with where it lives today.
10. Anything you could not determine, as questions.

Then stop and wait for approval. The person may edit the mapping, the rules or the
staging; carry their edits, not your originals.

---

## 3. Install

After approval. All writes in this phase are new files or additive merges.

### 3.1 The check script and its tests

Write `.claude/hooks/check-unit.mjs` from Appendix A, with `RULES`, `REQUIRED`, `BASE`,
`RELEASE_FILES` and `SCENE` filled from the approved report, and its tests,
`.claude/hooks/check-unit.test.mjs`, from Appendix J, with one path per role that
matches those rules. If a role has several locations, join them in one regex. If a role
does not exist in this repo (no docs folder at all), leave it out of `REQUIRED` and say
so in the report; do not invent a folder to satisfy the rule.

### 3.2 Claude Code wiring (always)

Merge Appendix B into `.claude/settings.json`, with `command` and `args` from Appendix H
for the repo's runtime. Create the file if absent. If a `Stop` (or `PreToolUse`) array
already exists, append the new matcher group; do not replace the array. Skip if an entry
already references `check-unit.mjs`.

The `Stop` binding is installed in both stagings and does not depend on team size. At
the end of every turn it compares the scene so far with its base and tells the agent —
the party most likely to produce a fluent, simultaneous, incomplete scene — what is
missing. In the strict staging it refuses to let the turn end; in the adapted one it
advises, once, through `additionalContext`, so the agent reads it and may act on it. A
single developer is bound by it as much as a team; there is nobody else to notice the
skipped test.

The `PreToolUse` binding on `git commit` is installed in the strict staging only. Its
`if` filter is best-effort (a pattern more specific than the command name fires on any
command containing `$()`, backticks or `$VAR`, which includes heredoc commit messages),
so the script itself checks that the command is a `git commit` and exits 0 otherwise. In
the adapted staging the binding is redundant with the `Stop` advice and the git hook's
warning, and is left out.

### 3.3 Git wiring (when commits can happen outside the agent)

Install if Phase 2 found that commits happen, or may happen, from a shell, an editor or
CI. If every commit goes through Claude Code, the `Stop` binding already covers it;
record in the adoption task that this was deliberately left out and why, so it is added
the day a second person or a second tool appears.

Choose by what exists:

- `.husky/` present → append the pre-commit line from Appendix C to `.husky/pre-commit`.
- `lefthook` or `pre-commit` framework present → add the equivalent entry in its config.
- Node, none of the above → create `.githooks/pre-commit` from Appendix C, `chmod +x`,
  and add to `package.json`: `"prepare": "git config core.hooksPath .githooks"` (append
  to an existing `prepare` with `&&`). Run it once now.
- Deno or Bun → create `.githooks/pre-commit` from Appendix C; add a task
  (`deno task hooks` / `bun run hooks`) that runs `git config core.hooksPath .githooks`,
  mention it in the README's setup line, and run it once now.

`.git/hooks/` is not committed and is therefore not on stage; do not use it.

In the strict staging the pre-commit hook refuses an incomplete scene. In the adapted
staging it warns and never refuses: committing a half-done stage to keep one's place is
allowed, and 3.7 is the gate.

### 3.4 The record folder

Create `tasks/` with:

- `tasks/README.md` from Appendix D (what a task file is, the naming and heading
  conventions).
- `tasks/_template.md` from Appendix D.

### 3.5 The compiler

Write `scripts/compile-changelog.mjs` from Appendix F, adjusted to the changelog
convention found in 2.2 (heading level, hash or link format). Register it as the repo's
task runner knows: `"changelog": "node scripts/compile-changelog.mjs"` in `package.json`
scripts, or the Deno/Bun equivalent from Appendix H.

### 3.6 Standing instructions

Append Appendix E (the version for the chosen staging) to CLAUDE.md as its own section,
unless an equivalent paragraph is already there. If CLAUDE.md contains a
Definition-of-Done checklist that the gates now enforce, replace that checklist with one
line pointing at the Unities section; keep any items the gates do not cover.

### 3.7 The gate (adapted staging; recommended backstop in strict)

Add a CI job that runs `check-unit.mjs --pr <target>` on every pull request, against the
commit the PR targets, and make it required for merging into the branch in `BASE`. Use
whatever the repo's CI already is; Appendix I is an Azure DevOps example. The check
passes while the target has no `check-unit.mjs`, so the pull request that carries this
adoption — retired TODO files and all — is not held to it.

If pull requests are merged by a tool through the CI service's API rather than by its
merge button, run the check in that tool, before it merges, instead of as a CI job. A
required CI policy applies to the tool's API merges too, so the two gates would collide.
Run in a checkout, the base is the merge base of source and target, with the source tip
checked out: `check-unit.mjs --pr $(git merge-base <target> HEAD)`.

**Release pull requests.** The gate refuses any change to a `shared` file, and the
compiled `CHANGELOG.md` is one. There is no exemption mechanism; instead the gate
verifies the blob against its sources. For a PR whose changes are confined to
`RELEASE_FILES` (`CHANGELOG.md` plus the repo's version files), the script runs the
compiler in dry-run against the target's history and checks that the lines the PR adds
to `CHANGELOG.md` equal the compiler's output. Equal → it is a release by construction
and passes. Not equal → it is a hand edit and fails, with a diff. This is unity of action
enforced literally: the compiled file must equal compile(record). Phase 2 fills
`RELEASE_FILES`; a release PR that touches anything else is an ordinary PR and is judged
as one.

In the strict staging the gate is not required (every commit is already complete) but is
cheap, and catches a bypassed hook; install it if there is CI.

### 3.8 The developer's guide

The procedure and the standing paragraph are written for the agent. The people who
receive tasks need their own page. Write `docs/working-on-a-task.md` (or the repo's
equivalent) for them, and link it from the README's setup path and from
`tasks/README.md`. It covers, in this order:

1. Receiving a task: where its file is, how it is named, that `## Context` is the brief
   and is not edited, and what to do when something new turns up.
2. Doing the work: branching, committing (freely in the adapted staging; complete scenes
   in the strict one), turning on the git binding, and the role table in plain words
   (which files count as source, test, doc and task, and which are never edited).
3. Finishing: the test, the doc line and the `## What was done` section — written last,
   because its presence marks the task done; read by someone who did not write it;
   appended, never edited once merged; it becomes the changelog entry.
4. What happens at merge (adapted) or at commit (strict): the gate, how to run it
   locally, and who sets the work item's state.
5. Adapted staging only: what happens to a PR that fails the gate and stays open. Name
   the repo's answer, even if it is "nothing"; the form's answer was revert, and that
   rule was traded away here.
6. A checklist.

Every fact in it is checkable against the repository. Have a reader who did not write it
check it before it is committed.

### 3.9 Spec, decisions, plan

These are the files the fresh-session test asks for. Create whichever Phase 2 found
missing; where one exists under another name, keep the name and the content, and add
only what is absent. Write them from the code and the history as they are, not as wished;
mark gaps as gaps.

- `docs/SPEC.md` — the *what*. Opens with *Why this project exists*, then *Scope* (what
  it does, what it explicitly does not), architecture, and a stack table (dependency →
  what it replaces → why). Its rule, written into it: when this file and the code
  disagree, fix one of them in the same unit.
- `docs/DECISIONS.md` — append-only, dated. `D<n> · YYYY-MM-DD · title` →
  **Decision** / **Rejected** / **Why**. Seed it with the decisions already baked in that
  a newcomer would question, dated *recorded* with the original date if known. A decision
  is reversed only by a new entry naming the superseded one. The adoption itself is an
  entry: which staging, and why. Two people appending in the same unit is a merge git
  resolves; a conflict there is a conversation, not a tooling problem, so this one file is
  allowed to be shared.
- `docs/PLAN.md` — the ordered steps, one row each, linking to the task file for each.
  **No status column.** Status is derived from the task files (no record → open, record →
  done, compiled → shipped), by eye or by a small script; a hand-maintained status row is
  the shared mutable field this whole discipline removes, and it is the first thing to
  drift. Milestones ("after step NN: …") and *Not in scope* live here too.

Add these paths to the `doc` role in `RULES` if they are not already matched, and
`docs/DECISIONS.md` to `CLAUDE.md`'s *Read first* list. The adoption task records which
were created and which were found.

---

## 4. Migrate the record

### 4.1 Tasks

For each item in the approved mapping, write `tasks/<slug>.md` from the template:

- Title from the item text.
- `## Context` holding the original text and sub-bullets verbatim, plus
  `Migrated from <file> on <date>`.
- `## What was done` only for items the source marked done, holding whatever the source
  said about it (a date, a note, a hash). If the source says only "done", write
  `Done before adoption; no record.` Do not reconstruct history from git log into the
  task file; that is the compiler's job if ever needed.

Then retire the source file in place: replace its body with a short note —
`Tasks now live in tasks/, one file each. This file is kept for history; see git log.` —
and keep the original content below a horizontal rule so nothing is lost. If the person
preferred the file deleted, they will say so; default is retirement.

### 4.2 Changelog

Do not rewrite existing entries. At the top of `CHANGELOG.md`, directly under its title,
insert:

    <!-- Compiled from tasks/ by scripts/compile-changelog.mjs. Do not edit below this line by hand. -->

Everything above the previous first entry stays as it was. From this unit on, the
compiler is the only writer.

If the repo used `changes/` or `.changeset/` fragments: convert any pending fragments
into `## What was done` sections on their tasks (create the task if none matches), then
retire the fragments folder with a README pointer. Do not run two record systems.

### 4.3 The adoption task

Write `tasks/adopt-unities.md` with a `## What was done` section listing, in plain
sentences: which staging was chosen and why, which files were created, which merged,
which retired, which bindings were left out and why, how many tasks were migrated, which
of spec, decisions and plan were created and which found, and the release boundary
chosen. This is the record of this scene.

---

## 5. Verify

Run, and include the output in the final report. Steps marked (S) apply to the strict
staging, (A) to the adapted one, unmarked to both.

1. `check-unit.mjs --branch HEAD` → must print nothing (no change against itself; this
   proves the script runs).
2. Simulate a violation: `touch <source-dir>/_unities_probe`, `git add` it, run
   `--staged`. (S) must exit 2 naming the missing roles. (A) must exit 0 with a warning
   naming them. Unstage and remove the probe.
3. `compile-changelog.mjs --dry-run` → must list the adoption task's record and nothing
   else (or nothing, if the boundary is HEAD).
   Then the fresh-session test itself: open a new session with no context but the repo
   and ask it what the project is, what was decided and what comes next. If it has to
   guess, 3.9 is not finished.
4. If the git binding was installed: `git commit --dry-run` does not test hooks; instead
   stage the probe file plus nothing else and attempt a real commit. (S) expect refusal,
   then unstage. (A) expect the warning and a commit, then `git reset --soft HEAD~1` and
   unstage. If the binding was deliberately left out, skip this step.
5. Confirm `.claude/settings.json` parses and `/hooks` (or the settings file) lists the
   `Stop` entry, and (S) the `PreToolUse` entry.
6. `node --test .claude/hooks/check-unit.test.mjs` → the Appendix J tests pass against the script with this
   repo's `RULES`, in the chosen staging.
7. (A) Confirm the 3.7 gate exists, and say whether whatever makes it required — a branch
   policy, or the merging tool's step — is in place; it usually lives outside the
   repository. Confirm the release check: on a throwaway branch, run the compiler for a
   fake version, commit only its output and the version bump, and run `--pr <base>` →
   must pass; then hand-edit one changelog line → must fail with a diff.

If any check fails, fix it before Phase 6. If it cannot be fixed, revert the working
tree and report why.

---

## 6. Finish

One unit: a commit in the strict staging, a pull request in the adapted one. Message or
title: `Adopt the Unities`, body the same sentences as the adoption task's record. Then
tell the person:

- which staging the repo now runs, and what it enforces, in three lines (one per unity);
- the one command to compile a release (`npm run changelog -- <version>`) and, adapted,
  that the release PR passes the gate only if its changelog equals the compiler's output;
- what remains manual: the reviewer before the record is committed (Appendix G); (A)
  whatever makes the 3.7 gate required; (S) the decision to revert when the `Stop` hook
  reports a half-scene twice.

---

## Appendix A — `.claude/hooks/check-unit.mjs`

Fill the per-repo block from Phase 2. Everything else is fixed.

```js
#!/usr/bin/env node
// A scene is complete or it is nothing. SCENE says how long a scene is:
//   "commit" (strict)  : every commit; --staged and --branch refuse.
//   "pr"     (adapted) : the pull request; --pr refuses, --staged and --branch warn.
//
//   --pr <base>     : what the PR changes against its target     (gate; always enforces)
//   --staged        : what `git commit` is about to record       (pre-commit, PreToolUse)
//   --branch [base] : the scene so far, committed or not         (Stop)
import { execSync } from "node:child_process";

// ---- per-repo: written by the adoption procedure from what it found ----
const SCENE = process.env.UNITIES_SCENE ?? "pr";   // "commit" for the strict staging
const RULES = {
  source: /^src\//,                                 // e.g. /^(src|lib)\//
  test:   /^tests?\//,                              // e.g. /(^tests?\/|\.(test|spec)\.[cm]?[jt]sx?$)/
  doc:    /^(docs\/|(^|\/)(README|CLAUDE)\.md$)/,   // docs also live beside code
  task:   /^tasks\/(?!README\.md$)[^/_][^/]*\.md$/, // excludes README.md and _template.md
  shared: /^(CHANGELOG\.md|TODO\.md|TASKS\.md|ROADMAP\.md)$/,   // compiled or retired; never edited
};
const REQUIRED = ["test", "doc", "task"];           // roles a source change must be accompanied by
const BASE = "origin/main";                         // the branch pull requests target
const RELEASE_FILES = /^(CHANGELOG\.md|package\.json|deno\.json)$/;   // what a release PR may touch
const COMPILER = "scripts/compile-changelog.mjs";
const SELF = ".claude/hooks/check-unit.mjs";
// -----------------------------------------------------------------------

const strict = SCENE === "commit";
const mode = process.argv[2] ?? "--branch";
const input = process.stdin.isTTY ? {} : JSON.parse((await readStdin()) || "{}");
const cwd = input.cwd ?? process.cwd();
const lines = s => s.split("\n").map(l => l.trim()).filter(Boolean);

// PreToolUse's `if` filter is best-effort; make sure this really is a commit.
if (input.hook_event_name === "PreToolUse" &&
    !/(^|[;&|]\s*)git\s+commit\b/.test(input.tool_input?.command ?? "")) process.exit(0);

let files, base;
if (mode === "--pr") {
  base = process.argv[3];
  if (!base) fail("usage: check-unit.mjs --pr <base>");
  if (!adopted(base)) skip(`${base} has no ${SELF}; the record is not required until the target adopts it.`);
  files = lines(git(`diff --name-only ${base} HEAD`));
} else if (mode === "--staged") {
  files = lines(git("diff --cached --name-only"));
  // A merge carries scenes recorded on the other branch. Only what the merge
  // commit itself writes — a file that differs from both parents — is new.
  if (gitOk("rev-parse -q --verify MERGE_HEAD")) {
    const fromTheirs = new Set(lines(git("diff --cached --name-only MERGE_HEAD")));
    files = files.filter(f => fromTheirs.has(f));
  }
} else if (mode === "--branch") {
  // Strict: the scene is what is not yet committed. Adapted: the branch since it forked.
  if (strict) {
    base = "HEAD";
  } else {
    base = process.argv[3] ?? BASE;
    if (!gitOk(`rev-parse -q --verify ${base}`) || !adopted(base)) process.exit(0);
    base = git(`merge-base ${base} HEAD`).trim();
  }
  files = [...new Set([
    ...lines(git(`diff --name-only ${base}`)),              // committed since base, plus the work tree
    ...lines(git("ls-files --others --exclude-standard")),
  ])];
} else {
  fail(`unknown mode ${mode}`);
}

const has = re => files.some(f => re.test(f));
const missing = [];
if (has(RULES.source)) {
  for (const part of REQUIRED)
    if (!has(RULES[part])) missing.push(`no ${part} change`);
}
let shared = files.filter(f => RULES.shared.test(f));

// A release PR: only RELEASE_FILES changed, and the changelog it adds is exactly
// what the compiler produces from the record. The blob must equal compile(sources).
if (mode === "--pr" && shared.length && files.every(f => RELEASE_FILES.test(f))) {
  const added = lines(git(`diff ${base} HEAD -- CHANGELOG.md`))
    .filter(l => l.startsWith("+") && !l.startsWith("+++")).map(l => l.slice(1).trim()).filter(Boolean);
  let compiled, why;
  try {
    const since = sh(`git describe --tags --abbrev=0 ${base}`) || git("rev-list --max-parents=0 HEAD").trim();
    const out = sh(`node ${COMPILER} --dry-run --since ${since}`);
    if (/^\(no task records/.test(out)) why = " (no task records to release)";
    else compiled = lines(out).slice(1);                       // drop the version heading
  } catch { why = " (compiler failed)"; }
  if (compiled && /^## /.test(added[0] ?? "") && same(added.slice(1), compiled)) shared = [];
  else missing.push(`CHANGELOG.md does not equal the compiler's output${why ?? firstDifference(added.slice(1), compiled)}`);
}
if (shared.length) missing.push(`shared file edited directly: ${shared.join(", ")}`);

if (missing.length === 0) process.exit(0);

const what = { "--pr": "This pull request", "--staged": "This commit", "--branch": strict ? "This change" : "This branch" }[mode];
const reason = `Incomplete scene: ${missing.join("; ")}.`;

if (mode === "--pr") {
  const prefix = process.env.TF_BUILD ? "##vso[task.logissue type=error]" : "";
  console.error(`${prefix}${reason}`);
  console.error(`${what} cannot merge until its change carries its record (see tasks/README.md).`);
  process.exit(1);
}

if (strict) {
  const note = `${reason} Complete the record in this same change, or revert it. Do not leave it for later.`;
  // Stop, second pass: the agent was already sent back once. Let the turn end,
  // but make the half-scene visible to the person; the revert is theirs to decide.
  if (input.hook_event_name === "Stop" && input.stop_hook_active) {
    console.log(JSON.stringify({ systemMessage: note }));
    process.exit(0);
  }
  console.error(note);
  process.exit(2);   // PreToolUse: deny the commit. Stop: send the agent back. pre-commit: refuse.
}

const note = `${reason} ${what} is fine to keep, but the pull request will be refused until it is complete.`;
if (input.hook_event_name === "Stop") {
  // Advise the agent once, in its own context, so it can act; never block.
  if (!input.stop_hook_active)
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "Stop", additionalContext: note } }));
  else
    console.log(JSON.stringify({ systemMessage: note }));
} else {
  console.error(note);
}
process.exit(0);

function adopted(ref) { return gitOk(`cat-file -e ${ref}:${SELF}`); }
function skip(message) { console.log(message); process.exit(0); }
function fail(message) { console.error(message); process.exit(2); }
function same(a, b) { return a.length === b.length && a.every((l, i) => l === b[i]); }
function firstDifference(a, b) {
  const i = a.findIndex((l, i) => l !== b[i]);
  const at = i < 0 ? a.length : i;
  return `\n  PR line ${at + 1}: ${JSON.stringify(a[at] ?? "(end)")}\n  compiled: ${JSON.stringify(b[at] ?? "(end)")}`;
}
function git(args) {
  return execSync(`git ${args}`, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}
function sh(cmd) {
  return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}
function gitOk(args) {
  try { execSync(`git ${args}`, { cwd, stdio: "ignore" }); return true; }
  catch { return false; }
}
function readStdin() {
  return new Promise(r => {
    let s = "";
    process.stdin.on("data", d => s += d).on("end", () => r(s));
  });
}
```

## Appendix B — `.claude/settings.json` (merge)

Both stagings:

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "node",
        "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/check-unit.mjs", "--branch"]
      }]
    }]
  }
}
```

Strict staging adds:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "if": "Bash(git commit *)",
        "command": "node",
        "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/check-unit.mjs", "--staged"],
        "onFailure": "block"
      }]
    }]
  }
}
```

In the adapted staging the `Stop` hook compares the branch so far — commits and
uncommitted work — with `BASE`, and if the pull request would fail, tells the agent what
is missing, once per turn, without blocking. In the strict staging it compares the work
tree with `HEAD` and refuses to let the turn end on an incomplete scene; on the second
refusal it lets go and tells the person.

## Appendix C — git pre-commit

`.githooks/pre-commit` (or the line to append to `.husky/pre-commit`). Replace the
invocation with the runtime's line from Appendix H:

```sh
#!/bin/sh
exec node "$(git rev-parse --show-toplevel)/.claude/hooks/check-unit.mjs" --staged
```

## Appendix D — `tasks/`

`tasks/README.md`:

```md
# tasks/

How to work on a task — receiving it, finishing it, what the unit needs:
`docs/working-on-a-task.md`. This file is the format.

One file per task. Task files are the record; everything else (CHANGELOG.md, boards,
status) is compiled from them and never edited by hand.

A task file is named `<work item id>-<task description>.md`: the tracker's id for the
work it belongs to, then a short kebab-case description. Several tasks under one item
share the prefix. A task with no work item yet is named by its description alone and gets
the prefix when one is assigned; renaming it then is fine, because the changelog compiler
follows renames.

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
```

`tasks/_template.md`:

```md
# <title>

## Context

<what was asked, by whom, from where; date of arrival>

<!-- append below, in the same unit as the change; one section per change -->
```

## Appendix E — CLAUDE.md paragraph

Strict staging:

```md
## The Unities

The work, its record and its location are the same thing at the same time. Every commit
that changes source also carries its test, its doc line and a `## What was done` section
appended to the task file in `tasks/`. This is enforced, not requested: a Stop hook
refuses to end a turn with a half-recorded change, and `git commit` refuses an incomplete
scene (`.claude/hooks/check-unit.mjs`). `CHANGELOG.md` is compiled from task records at
release (`npm run changelog -- <version>`) and is never edited by hand. If a change cannot
be completed with its record in this sitting, revert it; do not leave it for later.
Any choice with a rejected alternative gets a dated entry in `docs/DECISIONS.md`; a listed
decision is not reopened quietly but by a new entry. Before committing, have a reader that
has not seen the work check that the task record describes the diff. The agent does not
claim a build is green or a feature works where it runs; <who> does. The developer's side
of all this is `docs/working-on-a-task.md`.
```

Adapted staging:

```md
## The Unities

The work, its record and its location are the same thing at the same time. Every pull
request that changes source also carries its test, its doc line and a `## What was done`
section appended to the task file in `tasks/`. Commits on the way are free: a stage may be
committed to keep one's place before its record exists. This is enforced at the pull
request, not at the commit: the gate runs `.claude/hooks/check-unit.mjs --pr` — as a CI
job, or in the tool that merges — and the PR cannot merge with an incomplete scene.
`git commit` and the end of a turn only warn, naming what the PR will still fail on.
`CHANGELOG.md` is compiled from task records at release (`npm run changelog -- <version>`)
and is never edited by hand; a release PR passes the gate only because its changelog
equals the compiler's output. Any choice with a rejected alternative gets a dated entry in
`docs/DECISIONS.md`; a listed decision is not reopened quietly but by a new entry. Before
committing a record, have a reader that has not seen the work check that it describes the
diff. The agent does not claim a build is green or a feature works where it runs; <who>
does. The developer's side of all this is `docs/working-on-a-task.md`.
```

## Appendix F — `scripts/compile-changelog.mjs`

Adjust `formatEntry` to the repo's existing changelog convention. Keep blank lines inside a
record — they are its paragraph and list breaks — and keep the rename-following: task
files are renamed when they get a work item id, and a record written under the old name
must compile under the new one. The gate (3.7) compares a release PR against this
script's `--dry-run` output, so its output must be deterministic for a given `--since`:
no timestamps finer than the date, no environment-dependent ordering.

```js
#!/usr/bin/env node
// compile-changelog <version> [--since <ref>] [--dry-run]
// The only writer CHANGELOG.md has. Reads "## What was done" sections added to tasks/
// since the last release and prepends them under a version heading.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const argv = process.argv.slice(2);
const dry = argv.includes("--dry-run");
const sinceIdx = argv.indexOf("--since");
const version = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--since");
if (!version && !dry) { console.error("usage: compile-changelog <version> [--since <ref>] [--dry-run]"); process.exit(1); }

const sh = c => execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const since = sinceIdx >= 0 ? argv[sinceIdx + 1]
  : (sh("git describe --tags --abbrev=0 2>/dev/null || true") || sh("git rev-list --max-parents=0 HEAD"));

const raw = sh(`git log --no-merges --reverse --format=%x1e%h%x1f%as -p ${since}..HEAD -- tasks/`);
const entries = [];                       // { file, hash, date, lines[] }

for (const chunk of raw.split("\x1e").filter(Boolean)) {
  const [head, ...rest] = chunk.split("\n");
  const [hash, date] = head.split("\x1f");
  let file = null, inSection = false, current = null;
  for (const line of rest) {
    if (line.startsWith("+++ b/")) { file = line.slice(6); inSection = false; current = null; continue; }
    if (!file || !file.startsWith("tasks/") || file.startsWith("tasks/_")) continue;
    if (!line.startsWith("+") || line.startsWith("+++")) { if (line.startsWith("@@")) { inSection = false; current = null; } continue; }
    const text = line.slice(1);
    if (/^## What was done/.test(text)) { inSection = true; current = { file, hash, date, lines: [] }; entries.push(current); continue; }
    if (/^## /.test(text)) { inSection = false; current = null; continue; }
    if (inSection && current) current.lines.push(text);
  }
}

// Task files get renamed (e.g. when a work item id is assigned). Records written
// under an earlier name must land under the file's current name.
const renamed = new Map();
for (const line of sh(`git log --reverse --format= --name-status -M --diff-filter=R ${since}..HEAD -- tasks/`).split("\n")) {
  const [, from, to] = line.split("\t");
  if (from && to) renamed.set(from, to);
}
const current = f => {
  const seen = new Set();
  while (renamed.has(f) && !seen.has(f)) { seen.add(f); f = renamed.get(f); }
  return f;
};

const byTask = new Map();
for (const e of entries) {
  const file = current(e.file);
  if (!byTask.has(file)) byTask.set(file, []);
  byTask.get(file).push(e);
}

const title = f => {
  if (!existsSync(f)) return f.replace(/^tasks\//, "").replace(/\.md$/, "");
  const m = readFileSync(f, "utf8").match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : f;
};

// ---- per-repo: match the existing changelog convention ----
// Blank lines inside a record are its paragraph and list breaks: keep them, trim the
// ends. The hash goes once per record. Ordering is by task path, then by commit order,
// so the output is deterministic for the gate.
const trimBlank = lines => {
  let a = 0, b = lines.length;
  while (a < b && !lines[a].trim()) a++;
  while (b > a && !lines[b - 1].trim()) b--;
  return lines.slice(a, b);
};
const formatEntry = (e) => `${trimBlank(e.lines).join("\n")}\n\nRecorded in \`${e.hash}\`.`;
const today = new Date().toISOString().slice(0, 10);
let out = `## ${version ?? "<version>"} — ${today}\n\n`;
for (const file of [...byTask.keys()].sort()) {
  out += `### ${title(file)}\n\n${byTask.get(file).map(formatEntry).join("\n\n")}\n\n`;
}
// -----------------------------------------------------------

if (dry || entries.length === 0) {
  process.stdout.write(entries.length ? out : `(no task records since ${since})\n`);
  process.exit(0);
}

const path = "CHANGELOG.md";
const marker = /<!-- Compiled from tasks\/.*?-->\n?/;
let existing = existsSync(path) ? readFileSync(path, "utf8") : "# Changelog\n\n";
if (marker.test(existing)) existing = existing.replace(marker, m => m + "\n" + out);
else {
  const i = existing.indexOf("\n", existing.indexOf("# ")) + 1;
  existing = existing.slice(0, i) + "\n" + out + existing.slice(i);
}
writeFileSync(path, existing);
console.log(`CHANGELOG.md: ${entries.length} record(s) from ${byTask.size} task(s) since ${since}`);
```

The compiler writes `CHANGELOG.md`, which the `shared` rule forbids editing by hand. In
the strict staging the release commit is made from a shell with `--no-verify`, the one
documented bypass. In the adapted staging no bypass exists: the release PR passes the
gate because its changelog equals this script's output (3.7).

## Appendix G — the reviewer

The gates test presence, not truth. A task record that describes the diff wrongly passes
every check above. Before committing a record, a reader that has not seen the work reads
the staged diff cold against the task file and answers one question: does the
`## What was done` section describe this change — nothing claimed that the diff does not
do, nothing significant left out? In Claude Code that is a subagent with read-only tools,
invoked explicitly before `git commit`; for a person, a colleague. Its verdict is
advisory; its value is that it did not write the record it is checking. In practice it
earns its place: it routinely finds the decision or the side change the writer forgot to
mention.

## Appendix H — runtimes

Both scripts use only `node:child_process` and `node:fs`, which Node, Deno and Bun all
provide. Only the invocation differs. Use the same form everywhere the script is called:
`.claude/settings.json` (`command` + `args`), the pre-commit line, the gate, and the task
runner. The check script shells out to `node scripts/compile-changelog.mjs` for the
release verification; on Deno or Bun change `COMPILER` to the matching invocation.

| Runtime | `command` | `args` prefix | Task runner entry |
| --- | --- | --- | --- |
| Node | `node` | — | `package.json` → `"scripts": {"changelog": "node scripts/compile-changelog.mjs"}` |
| Deno | `deno` | check: `run --allow-run=git,deno --allow-read --allow-env=TF_BUILD,UNITIES_SCENE`; compiler: `run --allow-run=git --allow-read --allow-write=CHANGELOG.md` | `deno.json` → `"tasks": {"changelog": "deno run --allow-run=git --allow-read --allow-write=CHANGELOG.md scripts/compile-changelog.mjs"}` |
| Bun | `bun` | `run` | `package.json` scripts as for Node, with `bun` |

Deno example for `.claude/settings.json`:

```json
{
  "type": "command",
  "command": "deno",
  "args": ["run", "--allow-run=git,deno", "--allow-read", "--allow-env=TF_BUILD,UNITIES_SCENE",
           "${CLAUDE_PROJECT_DIR}/.claude/hooks/check-unit.mjs", "--branch"]
}
```

Keep the permission list that narrow; if Deno asks for more, grant that one name, not
`-A`. A hook with `-A` is a hook nobody reads.

## Appendix I — the gate in Azure DevOps

Azure Repos ignores `pr:` triggers in YAML. Register this pipeline as a Build Validation
policy on the gated branch (Project settings → Repositories → Policies → the branch),
required, so it runs on every pull request into it.

```yaml
trigger: none

pool:
  vmImage: ubuntu-latest

steps:
  # A PR build checks out the merge of the PR into its target: HEAD^1 is the target,
  # so HEAD^1..HEAD is exactly what the PR would change. Depth 2 reaches it.
  # This relies on the policy's default merge-commit checkout. If the policy is ever
  # switched to a rebase or squash build, HEAD^1 is no longer the target; use the
  # merge-base form from 3.7 instead.
  - checkout: self
    fetchDepth: 2
    clean: true

  - task: UseNode@1
    inputs:
      version: 22.x

  - bash: |
      set -euo pipefail
      if [ "$BUILD_REASON" != "PullRequest" ]; then exit 0; fi
      # The release check needs the last tag reachable from the target.
      git fetch --quiet --tags --depth=1 origin || true
      node .claude/hooks/check-unit.mjs --pr HEAD^1
    displayName: Check the change carries its record
```

## Appendix J — `.claude/hooks/check-unit.test.mjs`

Fill the per-repo paths with one file in each role that `RULES` matches. The tests build
throwaway repositories, so they need git and nothing else. They pin the behaviour the
practice depended on: the gate at the pull request, free commits in the adapted staging,
refused commits in the strict one, merges that do not re-check the other branch's scenes,
a target that has not adopted yet, and the release check.

```js
// Run with: node --test .claude/hooks/check-unit.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { execSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---- per-repo: one path in each role, matching RULES in check-unit.mjs ----
const SOURCE = "src/x.ts";
const TEST = "tests/x.test.ts";
const DOC = "docs/a.md";
const TASK = "tasks/1-t.md";
const SHARED = "CHANGELOG.md";
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const hook = join(here, "check-unit.mjs");
const compiler = resolve(here, "../../scripts/compile-changelog.mjs");

// A repo whose main branch has adopted the hook, unless told otherwise.
function repo({ adopted = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "check-unit-"));
  const git = (args) => execSync(`git ${args}`, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const write = (file, text) => { mkdirSync(dirname(join(dir, file)), { recursive: true }); writeFileSync(join(dir, file), text); };
  git("init -q -b main");
  git("config user.email t@example.com");
  git("config user.name t");
  git("config commit.gpgsign false");
  write(SHARED, "# Changelog\n\n<!-- Compiled from tasks/ by scripts/compile-changelog.mjs. Do not edit below this line by hand. -->\n");
  write(SOURCE, "base\n");
  write(DOC, "base\n");
  if (adopted) {
    mkdirSync(join(dir, ".claude/hooks"), { recursive: true });
    copyFileSync(hook, join(dir, ".claude/hooks/check-unit.mjs"));
    mkdirSync(join(dir, "scripts"), { recursive: true });
    copyFileSync(compiler, join(dir, "scripts/compile-changelog.mjs"));
  }
  git("add -A");
  git("commit -q -m base");
  git("tag v0");
  const commit = (message) => { git("add -A"); git(`commit -q -m ${message}`); };
  return { dir, git, write, commit };
}

function run(dir, args, { scene = "pr", stdin = "" } = {}) {
  return spawnSync("node", [hook, ...args], {
    cwd: dir, input: stdin, encoding: "utf8", env: { ...process.env, UNITIES_SCENE: scene },
  });
}

const complete = (write) => {
  write(TEST, "test\n");
  write(DOC, "documented\n");
  write(TASK, "# t\n\n## What was done\n\ndone\n");
};

// ---- the gate (both stagings) ----

test("a pull request that changes source without its record is refused", () => {
  const { dir, git, write, commit } = repo();
  git("checkout -q -b feature");
  write(SOURCE, "changed\n");
  commit("wip");
  const result = run(dir, ["--pr", "main"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no \w+ change/);
});

test("work-in-progress commits are fine once the pull request as a whole carries its record", () => {
  const { dir, git, write, commit } = repo();
  git("checkout -q -b feature");
  write(SOURCE, "stage 1\n");
  commit("stage-1");
  write(SOURCE, "stage 2\n");
  commit("stage-2");
  complete(write);
  commit("record");
  assert.equal(run(dir, ["--pr", "main"]).status, 0);
});

test("a pull request editing a shared file by hand is refused", () => {
  const { dir, git, write, commit } = repo();
  git("checkout -q -b feature");
  write(SHARED, "hand edit\n");
  commit("edit");
  assert.match(run(dir, ["--pr", "main"]).stderr, /CHANGELOG\.md does not equal/);
});

test("a release pull request whose changelog equals the compiler's output passes", () => {
  const { dir, git, write, commit } = repo();
  git("checkout -q -b feature");
  write(SOURCE, "changed\n");
  complete(write);
  commit("feature");
  git("checkout -q main");
  git("merge -q --no-ff -m merge feature");
  git("checkout -q -b release");
  execSync("node scripts/compile-changelog.mjs 1.0.0 --since v0", { cwd: dir, stdio: "ignore" });
  commit("release");
  const ok = run(dir, ["--pr", "main"]);
  assert.equal(ok.status, 0, ok.stderr);
  // then a hand edit to the compiled section
  const path = join(dir, SHARED);
  writeFileSync(path, execSync(`cat ${path}`, { encoding: "utf8" }).replace("done", "done, and more"));
  commit("tamper");
  const bad = run(dir, ["--pr", "main"]);
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /does not equal the compiler's output/);
});

test("a pull request into a target that has not adopted the hook is not checked", () => {
  const { dir, git, write, commit } = repo({ adopted: false });
  git("checkout -q -b feature");
  write(SOURCE, "changed\n");
  write(SHARED, "hand edit\n");
  commit("edit");
  assert.equal(run(dir, ["--pr", "main"]).status, 0);
});

test("on a CI merge commit, HEAD^1 is the target and only the PR's changes count", () => {
  const { dir, git, write, commit } = repo();
  git("checkout -q -b feature");
  write(SOURCE, "changed\n");
  commit("feature");
  git("checkout -q main");
  write(DOC, "changed on main\n");   // on the target only; not the PR's doing
  commit("main");
  git("merge -q --no-ff -m merge feature");
  const result = run(dir, ["--pr", "HEAD^1"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no \w+ change/);
});

// ---- adapted staging: commits and turns warn ----

test("adapted: a commit with an incomplete scene warns but is not refused", () => {
  const { dir, write, git } = repo();
  write(SOURCE, "wip\n");
  git("add -A");
  const result = run(dir, ["--staged"]);
  assert.equal(result.status, 0);
  assert.match(result.stderr, /no \w+ change.*pull request will be refused/);
});

test("a clean merge commit does not warn about what the other branch recorded", () => {
  const { dir, git, write, commit } = repo();
  git("checkout -q -b other");
  write(SOURCE, "base\nmore\n");
  complete(write);
  commit("other");
  git("checkout -q main");
  write("docs/b.md", "ours\n");
  commit("ours");
  git("merge --no-commit --no-ff other");
  assert.equal(run(dir, ["--staged"]).stderr, "");
});

test("adapted: the Stop hook advises the agent once, in its context, and never blocks", () => {
  const { dir, git, write, commit } = repo();
  git("checkout -q -b feature");
  write(SOURCE, "stage 1\n");
  commit("stage-1");
  const stop = (active) => JSON.stringify({ hook_event_name: "Stop", cwd: dir, stop_hook_active: active });
  const first = run(dir, ["--branch", "main"], { stdin: stop(false) });
  assert.equal(first.status, 0);
  assert.match(JSON.parse(first.stdout).hookSpecificOutput.additionalContext, /no \w+ change/);
  const second = run(dir, ["--branch", "main"], { stdin: stop(true) });
  assert.equal(second.status, 0);
  assert.match(JSON.parse(second.stdout).systemMessage, /no \w+ change/);
  complete(write);   // uncommitted and untracked still count
  assert.equal(run(dir, ["--branch", "main"], { stdin: stop(false) }).stdout, "");
});

// ---- strict staging: commits and turns refuse ----

test("strict: a commit with an incomplete scene is refused", () => {
  const { dir, write, git } = repo();
  write(SOURCE, "wip\n");
  git("add -A");
  const result = run(dir, ["--staged"], { scene: "commit" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /revert it/);
});

test("strict: PreToolUse ignores shell commands that are not a git commit", () => {
  const { dir, write, git } = repo();
  write(SOURCE, "wip\n");
  git("add -A");
  const pre = (command) => JSON.stringify({ hook_event_name: "PreToolUse", cwd: dir, tool_input: { command } });
  assert.equal(run(dir, ["--staged"], { scene: "commit", stdin: pre("npm test && echo $(date)") }).status, 0);
  assert.equal(run(dir, ["--staged"], { scene: "commit", stdin: pre("git commit -m \"$(cat <<'EOF'\nwip\nEOF\n)\"") }).status, 2);
});

test("strict: the Stop hook sends the agent back once, then lets go and tells the person", () => {
  const { dir, write } = repo();
  write(SOURCE, "wip\n");
  const stop = (active) => JSON.stringify({ hook_event_name: "Stop", cwd: dir, stop_hook_active: active });
  const first = run(dir, ["--branch"], { scene: "commit", stdin: stop(false) });
  assert.equal(first.status, 2);
  const second = run(dir, ["--branch"], { scene: "commit", stdin: stop(true) });
  assert.equal(second.status, 0);
  assert.match(JSON.parse(second.stdout).systemMessage, /no \w+ change/);
  complete(write);
  assert.equal(run(dir, ["--branch"], { scene: "commit", stdin: stop(false) }).status, 0);
});
```
