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
const SCENE = process.env.UNITIES_SCENE ?? "commit";   // strict staging (D14); "pr" would be adapted
const RULES = {
  // Code: agent/, hub/, frontend/ — TypeScript, JS, bash, page assets, and the example configs.
  // Tests and fixtures are excluded here because they are the test role below.
  source: /^(agent|hub|frontend)\/(?!.*\.test\.(ts|js|mjs)$)(?!.*\/fixtures\/).+\.(ts|js|mjs|sh|json|html|css)$/,
  // A test beside its unit, or a fixture, anywhere in the code folders; the hook's own tests too.
  test:   /(\.test\.(ts|js|mjs)$|\/fixtures\/)/,
  doc:    /^(docs\/|(README|CLAUDE)\.md$)/,
  task:   /^tasks\/(?!README\.md$)[^/_][^/]*\.md$/, // excludes README.md and _template.md
  shared: /^CHANGELOG\.md$/,                          // compiled; never edited by hand
};
const REQUIRED = ["test", "doc", "task"];           // roles a source change must be accompanied by
const BASE = "origin/main";                         // the branch pull requests target
const RELEASE_FILES = /^(CHANGELOG\.md|deno\.json)$/;   // what a release commit may touch
// Node invocation (D15): under Deno, node:child_process.execSync needs the whole environment
// and /bin/sh, which makes the narrow permission list of Appendix H meaningless.
const COMPILER = "node scripts/compile-changelog.mjs";
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
    // An unborn branch (the repo's first commit) has no HEAD; diff against the empty tree.
    base = gitOk("rev-parse -q --verify HEAD") ? "HEAD" : "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
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
    const out = sh(`${COMPILER} --dry-run --since ${since}`);
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
