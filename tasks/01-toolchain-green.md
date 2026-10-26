# 01 · Toolchain green

## Context

**Promise.** On the Mac, one command proves the repo is in working order
before any feature exists, and the same command does the same in Claude's
workspace. The commit gate is installed in the clone and refuses an
incomplete scene.

**Acceptance**
- [x] `deno task test` and `deno task check` pass on the Mac, with the Deno
      version recorded in `docs/SETUP.md`
- [x] `deno task hooks` installed `.githooks`; a probe commit of a source file
      alone is refused on the Mac (then reverted)
- [x] `agent/` and `hub/` each have one trivial unit with a test, so `deno test`
      has something to run — the contract-identity test (D11) is the natural one
- [x] `docs/SETUP.md` corrected wherever the Mac disagreed with it

## What was done

The contract became code, so `deno test` has something to run. Done in a
Claude session on Erez's Mac on 2026-10-26, at his request ("add the agent/hub
contract files and the contract-identity test so deno task test has something
to run").

`hub/contract.ts` holds docs/CONTRACT.md §1–§5 as TypeScript: the `Status`
type, `Check`, `StatusFile`, `AgentResponse`, `ServerState` and `HubResponse`,
plus one runtime value, `STATUSES`, the §1 enum as a list, because a status
read from a file or the wire has to be checked against something at run time.
§6 (the page's own state) is not typed here; the page is plain JS (D9).
`agent/contract.ts` is a byte-for-byte copy (D11). This ticks the third
acceptance box.

Tests: `hub/contract.test.ts` fails if the two copies differ (D11);
`agent/contract.test.ts` types the §3 example status file and a §4 no-file
response, so a field renamed in the types but not in the doc fails the type
check `deno test` runs first. Assertions use `node:assert/strict`, built into
Deno, so no dependency was added.

Docs: `docs/CONTRACT.md` names the identity test and says the file holds
`STATUSES` as well as types. `docs/SETUP.md` records Deno 2.9.7 on the Mac and
2.9.6 in the Linux workspace, and no longer lists the hooks and compiler under
Deno's uses, since they run under Node (D15).

Verified by Claude in the session on the Mac (darwin arm64, Deno 2.9.7),
2026-10-26: `deno task test` gives 3 passed, then the 12 hook tests pass under
Node; `deno task check` exits 0. To probe the identity test, a line was
appended to `agent/contract.ts`: the test failed, then the line was removed.

Still open, for Erez: the first box (`deno task test` and `deno task check`
passing on the Mac, run by him, and the Deno version confirmed), the second
(`deno task hooks` and a refused probe commit), and the fourth (any other
place `docs/SETUP.md` disagrees with the Mac). Step 01 is done once those are
ticked in a second `## What was done` section. Until then this section makes
the step read as done, so PLAN's derived status is ahead of the facts.

## What was done

The step verified on the Mac by Erez, 2026-10-26, which closes the three
boxes the first record left open.

`deno task test` on the Mac: 3 Deno tests passed (the two in
`agent/contract.test.ts`, the identity test in `hub/contract.test.ts`), then
the 12 hook tests passed under Node. `deno task check` printed no errors.
`deno --version`: 2.9.7, aarch64-apple-darwin, V8 15.0.245.2-rusty,
TypeScript 6.0.3.

`deno task hooks` set `core.hooksPath` to `.githooks`. A probe commit of
`agent/probe.ts` alone was refused by the pre-commit hook with "Incomplete
scene: no test change; no doc change; no task change". The probe was then
removed; Claude confirmed afterwards that the work tree was clean and
`core.hooksPath` was `.githooks`.

`docs/SETUP.md`: the Deno row now says the Mac version is confirmed. Nothing
else in what Erez ran disagreed with `SETUP.md`; the server rows and the
deployment procedure were not exercised and are left for steps 03, 04 and 06.
Recorded by Claude from the terminal output Erez pasted into the session.
