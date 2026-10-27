# Decisions

Dated, append-only. Each entry: what was decided, what was rejected, why. A
decision is reversed by a new entry that names the one it supersedes — never by
editing the old one. Read this before proposing an alternative that is already
listed as rejected.

Format: `D<n> · YYYY-MM-DD · title` → **Decision** / **Rejected** / **Why**.

Entries D1–D5 were taken in the May 2026 draft conversation and are recorded
here on 2026-10-26 with their original intent; see `docs/FIRST-DRAFT.md`.

---

## D1 · 2026-05 (recorded 2026-10-26) · Three layers: cron-written status file, thin agent, hub

**Decision.** Root cron runs bash checks and writes one JSON status file
atomically; an unprivileged Deno agent reads the file and serves it; a hub
polls the agents. The agent never runs checks.

**Rejected.** An agent that runs the checks itself (needs root or sudo rules
for a long-running network-facing process); agents pushing to the hub (the hub
would need an open write endpoint and the agents would need to know where it is).

**Why.** Root and network exposure stay in different processes. The file is a
boundary that bash, Deno and a human with `cat` all understand.

## D2 · 2026-05 (recorded 2026-10-26) · Names: hub and agent

**Decision.** The aggregator is the *hub*; the per-server process is the *agent*.

**Rejected.** *controller* / *node* — both carry baggage (Express controllers,
Kubernetes nodes, Node.js itself).

## D3 · 2026-05 (recorded 2026-10-26) · Static shared secret in a header, enforced twice

**Decision.** Every hub→agent request carries `X-Neatour-Token: <secret>`. The
web server in front of the agent rejects a bad token before Deno sees the
request; the agent checks again. The secret reaches the agent through the
`NEATOUR_SECRET` environment variable in the systemd unit.

**Rejected.** A two-step token exchange (challenge, then a short-lived token).

**Why.** One secret, one user, three servers. The exchange adds state and a
clock dependency for no threat this system faces; the double check means a
misconfigured proxy does not silently expose the agent.

## D4 · 2026-05 (recorded 2026-10-26) · Check scripts live with the agent, not in docs

**Decision.** Bash checks are deployment artifacts under `agent/scripts/`; `docs/`
holds only prose.

**Rejected.** Keeping the scripts under `docs/` as "reference".

**Why.** They are deployed. Code that is deployed is code.

## D5 · 2026-05 (recorded 2026-10-26) · The data contract

**Decision.** The four-layer contract in `docs/CONTRACT.md`: status enum of
four values with rollup `error > warn > unknown > ok`; check object; status
file; agent response always HTTP 200 with parseable JSON; hub response; page
local state. Check keys are stable identifiers.

**Rejected.** Letting each layer have its own shape and converting between them.

**Why.** Everything else is built against this shape. Carried over unchanged
except as D8 says.

---

## D6 · 2026-10-26 · Restart from the spec; the May code is reference only

**Decision.** The project restarts from `docs/`. The May agent skeleton (four
files survive, in `docs/FIRST-DRAFT.md`) is read for how it did things and not
copied in.

**Rejected.** Resuming from the draft code.

**Why.** It was written in chat and copied by hand, before this repo existed
and before the working discipline did; its state is unknown and re-deriving a
few hundred lines against a written contract costs less than auditing them.

## D7 · 2026-10-26 · The hub is an Atrium chamber, not its own server

**Decision.** `hub/mod.ts` exports an Atrium `Chamber`; Atrium owns the socket,
TLS and the login in front of the page. The poller is a `setInterval` started
when the module loads; last-known state is kept in a JSON file under a data
directory given in `hub.config.json`. `if (import.meta.main)` lets the hub run
standalone in development.

**Rejected.** A separate Deno server for the hub, proxied by nginx like the
agents.

**Why.** Atrium exists for exactly this; one process, one login, one
`chambers.json` entry. The cost is that the hub must not assume it owns the
working directory or the process lifetime — both written into the spec.

## D8 · 2026-10-26 · Phase 1 scope; keep last-known checks when an agent is unreachable

**Decision.** Out of phase 1: acknowledgments (fields and routes reserved in
CONTRACT), alerting, history and graphs, log-error checks, offline caching in
the page, auth beyond the token and Atrium's session, non-Linux agents. In:
agents on all three servers, the hub poller, one status page, the page's own
client-side site checks, an install script for the agent. One contract change:
when an agent is unreachable the hub serves its last-known checks with
`reachable: false` instead of `{}`, so the page can show what was last seen.

**Rejected.** Shipping acknowledgments in phase 1 (they were the draft's "next
thing"); cutting the client-side site checks to simplify the page.

**Why.** Acknowledgments are a workflow on top of a working monitor and the
monitor has never run. The site checks stay because they are the only thing
that works when Atrium is down, and Atrium being down is one of the three
things this exists to notice.

## D9 · 2026-10-26 · Deno 2 for agent and hub; no router; no frontend framework

**Decision.** Agent and hub are Deno 2 TypeScript, routing by hand on
`url.pathname` as Atrium's Domo chamber does. The page is plain HTML, CSS and
one ES module, served as-is.

**Rejected.** Node for the agent (a package install per server versus one
binary); Hono (Atrium's CLAUDE.md names it as the convention for chambers with
an API, but Domo itself hand-routes, and the hub has two routes); any frontend
framework or bundler (a page with one fetch loop does not need a build step).

**Why.** The hub has to be Deno to be a chamber, and one runtime across the
repo is one `SETUP.md`. Atrium's Deno exposure is already accepted (its own
decision, Oct 2026); Neatour's Deno-specific surface is four calls.

## D10 · 2026-10-26 · Per-server check lists are files in the repo

**Decision.** `assemble.sh` is generic and takes the path of a check list;
`agent/servers/<name>.sh` holds each server's list. The install script copies
the right one.

**Rejected.** The draft's approach: one `assemble.sh` with the server's checks
edited in place after deployment.

**Why.** Unity of place: what a server is checked for is part of the project
and should be in `git diff`, not in a hand-edited copy on the server.

## D11 · 2026-10-26 · Contract types duplicated, kept identical by a test

**Decision.** `agent/contract.ts` and `hub/contract.ts` are two copies of the
same file; `hub/contract.test.ts` fails if they differ.

**Rejected.** A shared `common/` folder imported by both (the agent is
installed as a standalone folder and must not import outside itself); a
published module (a registry dependency for twenty lines of types).

## D12 · 2026-10-26 · The milestone: hub on Atrium shows one real agent, before the checks exist

**Decision.** Step 04 is the milestone: the hub, running as a chamber on
Atrium, polls the agent on `podcasts` serving a hand-written status file, and
the page on the phone shows it. The real check scripts come after (step 05).

**Rejected.** Writing the checks first, so the milestone shows real data.

**Why.** The risk is the chain — token through two proxies, chamber
registration, the poller inside Atrium's process, the page on the phone — not
`df`. A hand-written status file proves the chain with nothing else in the way.

## D13 · 2026-10-26 · Deploy by hand first; the install script is a phase-1 step

**Decision.** Steps 03 and 06 deploy agents by following `docs/SETUP.md` by
hand. Step 08 turns that into `agent/install.sh`, and the third server is
installed with it.

**Rejected.** Writing the script before the first deployment.

**Why.** A script that automates a procedure nobody has run yet automates
guesses.

## D14 · 2026-10-26 · The Unities, strict staging, git binding installed

**Decision.** The repo runs the strict staging — the commit is the scene — with
the hook on `git commit`, the Stop hook in Claude Code, and the pre-commit hook
in `.githooks/` because commits also happen from a shell. No work-item tracker;
task files are `NN-slug.md`. The repo is public; no issues are used.

**Rejected.** The adapted staging (one developer, no PR flow to hang a gate on);
GitHub issues as the record (the record is `tasks/`).

**Why.** One developer who commits complete units is the case the strict
staging is for.

## D15 · 2026-10-26 · The Unities hooks and the changelog compiler run under Node, not Deno

**Decision.** `.claude/settings.json`, `.githooks/pre-commit` and the
`changelog` task invoke `check-unit.mjs` and `compile-changelog.mjs` with
`node`. Node ≥ 18 is therefore required on any machine that commits; Deno
stays the runtime for everything that ships.

**Rejected.** The Deno invocation of `docs/UNITIES.md` Appendix H
(`--allow-run=git,deno --allow-read --allow-env=TF_BUILD,UNITIES_SCENE`).

**Why.** Tried first, on 2026-10-26, with Deno 2.9.6: `node:child_process.execSync`
under Deno runs through `/bin/sh` and copies the whole environment into the
child, so the hook only works with `--allow-run=/bin/sh … --allow-env` — which
is `-A` with extra words, and the runbook's own rule is that a hook with `-A`
is a hook nobody reads. The scripts are written against `node:` built-ins; Node
runs them as written and the twelve Appendix J tests pass.

## D16 · 2026-10-26 · A status file with a check the agent cannot roll up is rejected whole

**Decision.** The agent's reader accepts a status file only if it is a JSON
object with a `server` string and a `checks` object whose every value is an
object with a §1 `status`. Anything else is treated like invalid JSON: HTTP 200,
`status: "unknown"`, `checks: {}`, and a `message` naming the first problem.
Other check fields are not checked; they pass through verbatim (CONTRACT §4).

**Rejected.** Passing the checks through unchecked (the rollup would be
computed over a status it does not know, and the hub would carry it on);
dropping only the bad check (a check would vanish from the page without a
trace, which is worse than the whole server showing `unknown` with a reason).

**Why.** The file is written by bash; a typo in one check script should be
loud. `unknown` with the reason in `message` is what the contract already uses
for every other file the agent cannot trust.

## D17 · 2026-10-26 · The agent's version is a constant in `handler.ts`

**Decision.** `AGENT_VERSION` in `agent/handler.ts`, kept equal to `version`
in the root `deno.json` by a test in `agent/handler.test.ts`.

**Rejected.** A `version` in `agent/deno.json`, imported as JSON (that file
carries a comment beside every permission flag, as the code rules ask, and
Deno's JSON import refuses comments; tried 2026-10-26 with Deno 2.9.7);
importing the root `deno.json` from the agent (the agent is installed as a
standalone folder and must not import outside itself).

**Why.** One more line to bump, guarded by a test, is cheaper than giving up
the flag comments or the standalone folder.

## D18 · 2026-10-27 · The agent's secret is in a root-only EnvironmentFile

**Decision.** The systemd unit reads `NEATOUR_SECRET` from
`/etc/neatour/agent.env` (directory 700, file 600, both root) with
`EnvironmentFile=`. This refines D3, which still holds: the secret reaches
the agent as an environment variable set by the systemd unit.

**Rejected.** `Environment=NEATOUR_SECRET=…` in the unit file, as first
written in `docs/SETUP.md` and step 02's unit.

**Why.** Unit files under `/etc/systemd/system` are world-readable, and
`systemctl show` prints `Environment=` to any local user. An `EnvironmentFile`
is read by systemd as root before it drops to the `neatour` user, so the file
can be root-only. Decided by Erez on 2026-10-27, before the first deployment
to `podcasts`.
