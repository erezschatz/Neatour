# 02 · Agent: reads the status file, answers `GET /status`

## Context

**Promise.** Started on a laptop with a hand-written `status.json`, the agent
answers `GET /status` with the CONTRACT §4 body: the checks verbatim, the
file's age, whether it is stale, the rolled-up status. A missing, unreadable
or malformed file gets `status: "unknown"` and a reason, still HTTP 200. A
wrong token gets 401. Nothing else exists.

**Acceptance**
- [x] `agent/main.ts`, `handler.ts`, `reader.ts`, `rollup.ts`, `config.ts`,
      `contract.ts`, `deno.json`, `agent.config.example.json`,
      `neatour-agent.service`, each `deno run` flag with its reason
- [x] Tests beside each unit: rollup priority (incl. empty → `unknown`);
      reader against fixtures for missing / unreadable / invalid / stale /
      fresh; handler for 401, 404, and the two 200 shapes
- [ ] `deno task start` in `agent/` serves `http://127.0.0.1:9100/status`
      against `agent/fixtures/status.fresh.json`, verified by Erez with `curl`
- [x] `docs/CONTRACT.md` §4 matches the body exactly; any discrepancy fixed in
      one of the two in this scene

## What was done

The agent exists and answers `GET /status` on a laptop. Written in a Claude
session on Erez's Mac on 2026-10-26, at his request ("Start step 02: the agent
reads the status file and answers GET /status").

Units in `agent/`:
- `rollup.ts`: `worst()` and `rollup()`, ordered error > warn > unknown > ok.
  An empty set gives `unknown`.
- `config.ts`: loads `agent.config.json` and checks `server`, `port`
  (default 9100), `status_file` and `stale_threshold_seconds` (default 600).
  A relative `status_file` is resolved against the config file's folder. A
  bad config throws, so the agent stops at start.
- `reader.ts`: never throws. It returns the file, its age in whole seconds
  (from the mtime, clamped at 0), whether it is stale (age > threshold), or
  `file: null` with a reason for missing, unstattable, unreadable, invalid
  JSON or wrong shape. A file is the wrong shape when it lacks a `server`
  string or a `checks` object, or has any check with a status outside §1 (D16).
  `now` is a parameter for the tests.
- `handler.ts`: checks the token first, comparing in constant time, and
  answers 401 before any route. `GET /status` gets 200; anything else gets
  404. Every body is JSON. A stale file's checks are served but its status is
  `unknown`. When there is no usable file, the body is `unknown`, `{}` and the
  reader's reason, with `agent` taken from the config. A try/catch keeps the
  200 promise even if the reader ever throws; that branch reports age `-1`
  and not stale, since it knows nothing about the file. It logs one line per
  request.
  `AGENT_VERSION` lives here (D17).
- `main.ts`: the config path comes from the first argument, or
  `agent.config.json` beside it. It refuses to start without
  `NEATOUR_SECRET` and serves on 127.0.0.1 only.

Also written:
- `deno.json` with `start` (touches the fresh fixture, then runs on the dev
  config) and `test`, with a reason beside each flag, and `"lock": false`
  so Deno never tries to write a lockfile into the read-only install folder.
- `agent.config.example.json`.
- `neatour-agent.service`: user `neatour`, a placeholder secret,
  `DENO_DIR` in the systemd cache directory, Deno at `/usr/local/bin/deno`,
  the three flags with reasons, and read-only hardening.
- Fixtures: `status.fresh.json`, `status.invalid.json`,
  `status.wrong-shape.json`, `agent.config.dev.json`.

Tests, all beside their units (21 agent tests, 1 hub test):
- `rollup.test.ts`: priority, and empty gives `unknown`.
- `config.test.ts`: the dev and example configs load; a non-config is refused.
- `reader.test.ts`: fresh; stale at 600 s vs 601 s, with the clock set
  relative to the fixture's mtime so nothing is written; missing; unreadable;
  invalid; wrong shape. "Unreadable" is a directory given as the path: stat
  works and the read fails. That stands in for a mode-000 file, which root
  could still read and which would need write access to set up.
- `handler.test.ts`: 401 for a missing, wrong or empty token and before any
  route; 404 for other paths and for POST; the 200 body with checks, compared
  key for key with §4, checks verbatim from the file; stale gives `unknown`
  with the checks kept; the 200 body without checks for missing, invalid and
  wrong-shape files; `AGENT_VERSION` equals the root `deno.json` version.
- `contract.test.ts`: its no-file example now has `status_file_stale: false`,
  which is what the agent produces.

Docs:
- `CONTRACT.md` §4 now says what wrong shape means, where `agent` comes from
  without a file, that age and `stale` describe a file that exists but cannot
  be used, while no file gives `-1` and `false`, that the token is
  checked before the route, and that 401 and 404 bodies are `{ "message" }`.
  These were not written down before; the rest of §4 already matched the
  body.
- `SPEC.md` describes `config.ts`.
- `SETUP.md` gains a laptop-run section and the Deno path the unit assumes.
- `working-on-a-task.md` adds `AGENT_VERSION` to the version checklist.
- `DECISIONS.md` gains D16 and D17.

Verified by Claude in the session on the Mac (Deno 2.9.7), 2026-10-26:
- `deno task test` gives 22 passed, and the 12 hook tests pass.
- `deno task check` exits 0.
- `NEATOUR_SECRET=dev deno task start` was run for a few seconds. `curl` with
  the token got HTTP 200 and the §4 body: `agent: "laptop"`, age 3, not stale,
  `status: "warn"`, three checks. `curl` without the token got 401.

Not verified:
- The third box (Erez's own `curl`) is open.
- `neatour-agent.service` has not run anywhere; step 03 is its first use, on
  `podcasts`.

This section makes step 02 read as done while the third box is open; Erez's
`curl` closes it in a second section.
