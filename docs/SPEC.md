# Neatour — Specification

Version 0.1 (phase 1, not yet installed anywhere). When this file and the code
disagree, fix one of them in the same scene.

## Why this project exists

Erez runs three servers for himself:

| Name       | Role                                                                                  | Web server         |
|------------|---------------------------------------------------------------------------------------|--------------------|
| `php`      | Nextcloud, Ampache, Phorge, MySQL, a mail client and an IRC client (the last two under PM2) | Apache 2 + php-fpm |
| `atrium`   | Atrium — a single Deno process hosting Domo, Yubin, Dentro, MLBAPI, ReDrift and others as chambers | nginx              |
| `podcasts` | Two Perl/Catalyst sites                                                               | nginx              |

Nothing watches them. A service dies, a disk fills, and the first sign is a
page that does not load. Off-the-shelf monitoring is sized for fleets and
teams; what is wanted is one page, opened on a phone, that says whether the
three servers and the services on them are up, with no account, no SaaS and
no daemon heavier than the things it watches.

Neatour is that page and the two small pieces behind it. No urgency: the
servers run today without it. Steps are sized so each ends with something that
can be run the same day.

## Scope

### Phase 1

- **Agent**, one per server: a Deno process bound to `127.0.0.1` that reads a
  JSON status file and serves it on `GET /status`, wrapped with staleness
  metadata (CONTRACT §4). It never runs checks itself.
- **Checks**: bash scripts run by root from cron every five minutes, each
  printing one JSON check object (CONTRACT §2); `assemble.sh` runs the
  server's list of checks and writes the status file atomically (CONTRACT §3).
  Phase-1 checks: disk usage, memory usage, process running
  (`pgrep`/`systemctl`), PM2 app online.
- **Hub**, an Atrium chamber: polls every agent on an interval, keeps the last
  response per server in memory and on disk, and serves `GET /api/status`
  (CONTRACT §5) and the page.
- **Page**: a single static page served by the hub showing every server and
  its checks, worst status first, plus its own client-side HTTP checks of the
  public sites (CONTRACT §6) so that the page still says something when
  Atrium itself is down.
- **Install script** for the agent, so the third server is installed the same
  way as the first.

### Explicitly not phase 1

Listed with their decision in `docs/DECISIONS.md`:

- acknowledging a check (the `acknowledged` / `acknowledged_until` fields and
  the `/acknowledge` routes of the May draft);
- alerting of any kind — push, mail, sound;
- history, trends, graphs; the hub keeps the last response only;
- log-error checks (the `detail[]` array stays in the contract but no phase-1
  check fills it);
- offline caching in the page beyond what the browser does on its own;
- any auth beyond the shared token between hub and agents and Atrium's own
  session in front of the page;
- agents for anything but Linux with bash, jq, cron and systemd.

## Architecture

```
   phone ──HTTPS──▶ Atrium ──▶ hub chamber ──▶ page (static)
                                   │  ▲
                 poll every N s    │  │  GET /api/status
                                   ▼  │
          ┌────────────────────────┴──┴─────────────────────┐
          │   GET https://<server>/neatour/status            │
          │   X-Neatour-Token: <shared secret>               │
          ▼                        ▼                        ▼
      nginx/Apache             nginx                    nginx
      (rejects bad token)      ...                      ...
          │                        │                        │
      agent :9100              agent :9100              agent :9100
      reads                    reads                    reads
      /var/lib/neatour/status.json   (written by root cron → assemble.sh → jq)
```

Three rules hold the shape:

1. **The hub is the only thing that talks to agents.** The page talks to the
   hub and to public URLs. An agent talks to nobody; it answers.
2. **The agent reads; cron writes.** Checks need root and the agent must not
   have it. The status file is the boundary: written atomically (`.tmp` then
   `mv`) so the agent never sees a half-written file.
3. **Every layer degrades to `unknown`, never to an error page.** A missing
   status file, a stale one, an unreachable agent, an unreachable hub — each
   is a documented state in `docs/CONTRACT.md` §8 and renders as such.

### Components

**Agent** (`agent/`). `main.ts` loads config and starts `Deno.serve` on
`127.0.0.1:<port>`. `handler.ts` checks the `X-Neatour-Token` header, serves
`GET /status`, returns 404 for anything else. `reader.ts` stats and parses the
status file and decides staleness against `stale_threshold_seconds`.
`rollup.ts` computes the worst status. `contract.ts` holds the types.
`config.ts` loads and checks `agent.config.json` (`server`, `port`,
`status_file`, `stale_threshold_seconds`), beside `main.ts` unless a path is
given as `main.ts`'s first argument; a relative `status_file` is resolved
against the config file's folder. A bad config stops the agent at start; the secret comes from the `NEATOUR_SECRET`
environment variable set in the systemd unit, never from a file in the repo.
The web server in front of the agent rejects requests without the correct
token before they reach Deno; the agent checks again. Both must pass.

**Checks** (`agent/scripts/`). `checks/check_*.sh` are generic and identical on
every server. `assemble.sh` is generic too: it takes the path of a check list
and runs each line of it. The per-server check lists live in the repo as
`agent/servers/<name>.sh` — the only per-server files — so that what each
server is checked for is on stage, not in an edited copy on the server.

**Hub** (`hub/`). `mod.ts` exports the Atrium `Chamber` object (see
`docs/ATRIUM.md`) and, under `if (import.meta.main)`, runs standalone for
development. `poller.ts` runs on `setInterval` inside the chamber module,
fetches every agent in `hub.config.json`, and hands each result to `state.ts`,
which keeps the last response per server in memory and writes it to a JSON file
under the hub's data directory so a restart does not start blank. `routes.ts`
serves `GET /api/status` from state; everything else falls through to the
static page in `frontend/` (hand-routed on `url.pathname`, as Atrium's own
Domo chamber does). The hub treats a non-200, a timeout or
unparseable JSON from an agent as `reachable: false`.

**Page** (`frontend/`). Plain HTML, CSS and one `app.js` as an ES module, served
as-is by the hub — no bundler, no transpile step, so the folder the hub serves
is the folder in the repo. Fetches `/api/status` on load and on an interval, runs its own
`fetch` against the public URLs listed in `frontend/sites.json`, merges the
two into the local state of CONTRACT §6, and renders. Shows a "lost connection
to hub" banner with the age of the last good response when the hub does not
answer.

### Data contract

`docs/CONTRACT.md`, carried over from the May draft with the acknowledgment
fields and routes moved to *not phase 1*. The contract is the one shared thing
between the three components. The agent and the hub each hold a copy of its
types (`agent/contract.ts`, `hub/contract.ts`); a test asserts the two files
are identical, because the agent is installed on a server as a standalone
folder and must not import across the repo.

### Configuration

| What                         | Where                               | Note                                   |
|------------------------------|-------------------------------------|----------------------------------------|
| Agent port, status file path, stale threshold | `agent/agent.config.json` on the server | example checked in as `agent.config.example.json` |
| Shared secret                | `NEATOUR_SECRET` env, from `/etc/neatour/agent.env` via the systemd unit (D18) | never in a file in the repo; root-only on the server |
| Per-server check list        | `agent/servers/<name>.sh`           | in the repo                            |
| Hub: agents to poll, interval, data dir | `hub/hub.config.json` on Atrium   | example checked in                     |
| Page: public sites to check  | `frontend/sites.json`               | in the repo; it is public anyway       |

## Stack

| Dependency | What it replaces | Why it is rote |
|------------|------------------|----------------|
| Deno 2.x   | Node + a package manager + a TypeScript step | One binary to install per server; Atrium is Deno and the hub must be a chamber. Pinned in `docs/SETUP.md`. If Deno stalls, the Deno-specific surface is `Deno.serve`, `Deno.readTextFile`, `Deno.stat` and `Deno.env` — a morning's port. |
| jq (bash)  | hand-assembled JSON in bash | Already on the servers; `jq -s add` merges the check objects without quoting accidents. |
| bash, cron, systemd | an agent that runs checks | Checks need root; the agent must not. The scheduler the servers already have. |
| `deno test` | a test framework | Built in. |
| Node ≥ 18 | — | Only for the Unities hooks and the changelog compiler, on machines that commit (D15). Nothing that ships uses it. |

No router, no frontend framework, no database. No TLS handling in the agent — the web
server in front of it already terminates HTTPS for the host.

## Operational facts the code relies on

- Agents are reached at `https://<host>/neatour/status`, proxied by the host's
  existing web server to `127.0.0.1:9100`. The proxy strips `/neatour/`.
- The hub polls every 60 s by default; the status file is rewritten every
  300 s; `stale_threshold_seconds` defaults to 600, so one missed cron run is
  not stale and two are.
- The hub's data directory is given in `hub.config.json`; Atrium runs chambers
  in one process, so the hub must not assume the working directory is its own
  folder.
- Server names (`php`, `atrium`, `podcasts`) are the correlation key across
  all four layers of the contract.
