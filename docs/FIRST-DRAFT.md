# The May 2026 draft — how it did things

In May 2026 Neatour was designed in a chat conversation ("Distributed
monitoring system for multiple servers") and an agent skeleton was written
there in Deno. Nothing was committed; four of its files survived as downloads.
Decision D6: the code is reference, not a starting point. This file is what a
session needs from it so the conversation is not.

## What was produced

- A data contract — carried over almost verbatim as `docs/CONTRACT.md`. The
  decisions it embodies are D1–D5.
- An agent skeleton, Deno 2: `types.ts`, `config.ts`, `rollup.ts`,
  `reader.ts`, `handler.ts`, `main.ts`, `deno.json`,
  `agent.config.example.json`, `neatour-agent.service`, a README, and bash
  checks `check_disk.sh`, `check_memory.sh`, `check_process.sh` (modes
  `pgrep_x`, `pgrep_f`, `systemctl`), `check_pm2.sh`, plus `assemble.sh`.
  Of these, `README.md`, `assemble.sh`, `handler.ts` and `main.ts` survive;
  the rest are known only from the chat summary.

## How the surviving pieces worked

**`main.ts`** — `loadConfig()`, `makeHandler(config)`, three `console.log`
lines, `Deno.serve({ port, hostname: "127.0.0.1" }, handler)`. Eleven lines.
This shape carries over.

**`handler.ts`** — one closure over config. Order of checks: token header
(401), `GET /status` (200 always), `POST /acknowledge` (501 stub), else 404.
`handleStatus` calls `readStatusFile(path, staleThreshold)` which returns
`{ file | null, ageSeconds, stale, error? }`; a null file becomes the
`unknown` body with `message: error`; otherwise `status` is `unknown` when
stale else `rollup(file.checks)`. Every response is `JSON.stringify(body,
null, 2)` with `Content-Type: application/json`. One `log(method, path,
status)` line per request. **Carried over:** all of it except the
acknowledge stub (reserved, D8). **Changed:** the `message` field in the
failure body is required by CONTRACT §4 to say *why*; the draft passed the
reader's error string through, which is the same thing — keep it.

**`assemble.sh`** — `set -euo pipefail`; `SCRIPT_DIR` from `$0`; each check
run as `VAR=$(bash "$CHECKS_DIR/check_x.sh" args || echo '{}')` so a failing
check contributes nothing rather than breaking the file; merged with
`printf '%s\n' "$A" "$B" | jq -s 'add // {}'`; wrapped with
`jq -n --arg server --arg generated_at --argjson checks`; written to
`$STATUS_FILE.tmp` then `mv`. Server name from `$NEATOUR_SERVER` or
`hostname`. **Carried over:** the `|| echo '{}'` guard, the `jq -s add`
merge, the atomic write. **Changed (D10):** the list of checks was edited
into this file per server; now it is read from a check-list file given as the
first argument, and the per-server lists live in `agent/servers/`.

**`README.md`** — the seven-step manual deployment (system user, copy to
`/opt/neatour/agent`, `/var/lib/neatour` owned `root:neatour` mode 750, config
owned by the agent user mode 640, systemd unit with `NEATOUR_SECRET`
inline, web-server proxy with the token check as an nginx `if`, cron every
five minutes). **Carried over** into `docs/SETUP.md` as the manual procedure
that step 08 scripts.

## What is not carried over

- `POST /acknowledge` on the agent. The contract never gave the agent an
  acknowledgment role; the stub existed "to reserve the route". Reserved in
  prose now.
- The check scripts' exact arguments and output. They are re-derived from
  CONTRACT §2 at step 05, with fixtures, which the draft did not have.
- The `deno.json` tasks (`--allow-net --allow-read --allow-env`): right
  permissions, but written again at step 02 with the reason for each flag
  beside it (code rule).
