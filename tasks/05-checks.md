# 05 · Checks: disk, memory, process, PM2; `assemble.sh`; real status files

## Context

**Promise.** On `podcasts`, cron writes a real status file every five minutes
and the page shows real numbers: root disk, memory, and whether the two
Catalyst sites and nginx are running. Each check is one generic script; what
`podcasts` is checked for is one file in the repo.

**Acceptance**
- [ ] `agent/scripts/checks/check_disk.sh`, `check_memory.sh`,
      `check_process.sh` (`pgrep_x` | `pgrep_f` | `systemctl`), `check_pm2.sh`;
      each prints exactly one CONTRACT §2 object keyed by its check key
- [ ] `agent/scripts/assemble.sh <check-list>` runs the list, merges with
      `jq -s add`, writes atomically; a failing check contributes nothing
- [ ] `agent/servers/podcasts.sh`, `php.sh`, `atrium.sh` — the three lists
- [ ] Tests: each check run against fixtures under `agent/scripts/fixtures/`
      (fake `df`/`free`/`pgrep`/`pm2` output on `PATH`), output validated
      against the contract with `jq`; `assemble.sh` tested end-to-end on a
      tmp dir
- [ ] Verified by Erez on `podcasts`: cron installed, `status.json` rewritten
      every five minutes, the page shows the numbers
