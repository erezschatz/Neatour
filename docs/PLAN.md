# Plan

Phase 1, in order. One file per step in `tasks/`; each states the promise from
the user's point of view and the acceptance criteria that make it done. Steps
are done strictly in order unless a decision in `DECISIONS.md` says otherwise.

There is no status column. A step is open while its task file has no
`## What was done` section, done once it has one, and shipped once that record
is in a compiled release. The first open step is the current one. A step's
record names how it was verified, where, and by whom.

| #  | Step |
|----|------|
| 00 | [Skeleton and documentation](../tasks/00-skeleton.md) |
| 01 | [Toolchain green](../tasks/01-toolchain-green.md) |
| 02 | [Agent: reads the status file, answers `GET /status`](../tasks/02-agent.md) |
| 03 | [Agent on `podcasts`, behind its proxy, polled from Atrium by hand](../tasks/03-agent-on-podcasts.md) |
| 04 | [Hub chamber and the page — the milestone](../tasks/04-hub-and-page.md) |
| 05 | [Checks: disk, memory, process, PM2; `assemble.sh`; real status files](../tasks/05-checks.md) |
| 06 | [Agents on `php` and `atrium`](../tasks/06-agents-on-php-and-atrium.md) |
| 07 | [Site checks and the lost-connection banner](../tasks/07-site-checks.md) |
| 08 | [Install script](../tasks/08-install-script.md) |
| 09 | [A week of use and phase-1 sign-off](../tasks/09-sign-off.md) |

## Milestones

- **After 04:** the project is proven or disproven. The hub, running inside
  Atrium, polls one real agent on `podcasts` through two proxies and the
  token, and the page on the phone shows that server. Nothing after 04 is
  worth building if 04 fails (D12).
- **After 06:** all three servers are on the page with real checks. Daily use
  starts here.
- **After 08:** installing an agent is one script; the repo is publishable as
  something another person could run.
- **After 09:** phase 1 complete; the project goes quiet.

## Not in phase 1

Decision D8. Each is a candidate for a phase-2 plan, not a promise.

- Acknowledging a check (fields and routes reserved in `CONTRACT.md`)
- Alerting: push, mail, sound
- History, trends, graphs
- Log-error checks (`detail[]`)
- Offline caching in the page
- Auth beyond the shared token and Atrium's session
- Agents for anything but Linux with bash, jq, cron and systemd
