# The agent's secret in a root-only file

## Context

Arrived 2026-10-27, at the start of step 03, before anything was deployed.
Claude pointed out that `Environment=NEATOUR_SECRET=…` in the systemd unit,
as `docs/SETUP.md` and step 02's `neatour-agent.service` had it, is readable
by any local user on the server: unit files are world-readable, and
`systemctl show` prints the environment. Asked where the secret should live,
Erez chose "EnvironmentFile (Recommended)".

**Acceptance**
- [x] `agent/neatour-agent.service` reads the secret from `/etc/neatour/agent.env`
- [x] `docs/SETUP.md` step 6 creates that file root-only, with a generated secret
- [x] A decision entry refining D3

## What was done

`agent/neatour-agent.service` replaces the placeholder
`Environment=NEATOUR_SECRET=change-me` with
`EnvironmentFile=/etc/neatour/agent.env`, with a comment saying why.
`docs/SETUP.md` step 6 now creates `/etc/neatour` with mode 700 and writes
`NEATOUR_SECRET=$(openssl rand -hex 32)` into `agent.env` under umask 077,
before installing the unit; the nginx example says where `<secret>` comes from. `docs/SPEC.md`'s
configuration table names the file.
`docs/DECISIONS.md` gains D18, which refines D3 without reversing it.

No test: the unit file is not a source file under the hook's rules, and
nothing in the agent's code changed; `main.ts` still reads `NEATOUR_SECRET`
from the environment and refuses to start without it. Verified by Claude on
2026-10-27: `deno task test` and `deno task check` still pass. Not verified:
the unit has not run anywhere; its first run is step 03 on `podcasts`, by Erez.
