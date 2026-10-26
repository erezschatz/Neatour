# 01 · Toolchain green

## Context

**Promise.** On the Mac, one command proves the repo is in working order
before any feature exists, and the same command does the same in Claude's
workspace. The commit gate is installed in the clone and refuses an
incomplete scene.

**Acceptance**
- [ ] `deno task test` and `deno task check` pass on the Mac, with the Deno
      version recorded in `docs/SETUP.md`
- [ ] `deno task hooks` installed `.githooks`; a probe commit of a source file
      alone is refused on the Mac (then reverted)
- [ ] `agent/` and `hub/` each have one trivial unit with a test, so `deno test`
      has something to run — the contract-identity test (D11) is the natural one
- [ ] `docs/SETUP.md` corrected wherever the Mac disagreed with it
