# Neatour — Data Contract

The JSON shapes that flow through Neatour's layers: bash → status file,
agent → hub, hub → page, and the page's own merged state. Every component is
built against this file. A change here is a breaking change and gets a
decision entry.

Carried over from the May 2026 draft (`docs/FIRST-DRAFT.md`) with one
change: the acknowledgment fields and routes (old §5 fields, old §7) are
out of phase 1 and listed at the end as reserved.

The types are held twice, `agent/contract.ts` and `hub/contract.ts`; a test
asserts the two files are byte-identical (`hub/contract.test.ts`). Edit both in the same scene. Besides
the types, the file holds one value: `STATUSES`, the §1 enum as a list, so
that a status read off disk or the wire can be checked against it.

---

## 1. Status enum

| Value     | Meaning                                                  |
|-----------|----------------------------------------------------------|
| `ok`      | Check passed, nothing to report                          |
| `warn`    | Threshold exceeded but not critical                      |
| `error`   | Critical failure — process down, disk full               |
| `unknown` | Check has not run, data is stale, or the layer below is unreachable |

**Rollup:** a server's status is the worst status across its checks; the
hub's status is the worst across its servers. `error` > `warn` > `unknown` > `ok`.
An empty set of checks rolls up to `unknown`.

---

## 2. Check object

The atomic unit. Produced by a bash script, carried through agent and hub
unchanged.

```json
{
  "status": "warn",
  "value": 84,
  "unit": "percent_used",
  "message": "Memory at 84%",
  "checked_at": "2026-05-19T14:30:00+03:00",
  "detail": []
}
```

| Field        | Type                     | Required | Notes |
|--------------|--------------------------|----------|-------|
| `status`     | status enum              | yes      | |
| `value`      | number \| boolean \| string | yes   | The raw reading |
| `unit`       | string                   | no       | Hint for rendering: `percent_used`, `running`, `error_count`, `mb_free` … |
| `message`    | string                   | yes      | Human-readable, always safe to display |
| `checked_at` | ISO 8601                 | yes      | When the script ran, not when the file was read |
| `detail`     | string[]                 | no       | Per-event lines for log checks; `[]` when unused. No phase-1 check fills it. |

---

## 3. Status file

Written by `assemble.sh` (root, cron), read by the agent. Path is configured;
default `/var/lib/neatour/status.json`. Written atomically: `.tmp`, then `mv`.

```json
{
  "server": "podcasts",
  "generated_at": "2026-05-19T14:30:00+03:00",
  "checks": {
    "disk_root":    { "status": "ok",    "value": 42,    "unit": "percent_used", "message": "/ is 42% full",            "checked_at": "2026-05-19T14:30:00+03:00", "detail": [] },
    "memory":       { "status": "warn",  "value": 84,    "unit": "percent_used", "message": "Memory at 84%",            "checked_at": "2026-05-19T14:30:00+03:00", "detail": [] },
    "mysql":        { "status": "ok",    "value": true,  "unit": "running",      "message": "mysql is running",         "checked_at": "2026-05-19T14:30:00+03:00", "detail": [] },
    "catalyst_app": { "status": "error", "value": false, "unit": "running",      "message": "catalyst process not found","checked_at": "2026-05-19T14:30:00+03:00", "detail": [] }
  }
}
```

**Check keys** (`disk_root`, `mysql`, …) are stable string identifiers. They
are how a check is referred to across layers and, later, how an
acknowledgment would be addressed. Renaming a key is a visible change; say so
in the task record.

---

## 4. Agent response — `GET /status`

The agent wraps the status file with metadata about the file. It does not
transform or interpret the checks.

```json
{
  "agent": "podcasts",
  "agent_version": "0.1.0",
  "polled_at": "2026-05-19T14:32:15+03:00",
  "status_file_age_seconds": 135,
  "status_file_stale": false,
  "status": "error",
  "checks": { "disk_root": { "…": "as in §3" }, "catalyst_app": { "…": "…" } }
}
```

| Field                     | Notes |
|---------------------------|-------|
| `agent`                   | The server name from the status file; the correlation key |
| `agent_version`           | The agent's own version |
| `polled_at`               | Set by the agent at response time |
| `status_file_age_seconds` | Now minus the file's mtime, in whole seconds; `-1` when there is no file or it cannot be stat'ed |
| `status_file_stale`       | `true` when age exceeds `stale_threshold_seconds` (default 600) |
| `status`                  | Worst status across checks; `unknown` whenever `status_file_stale` is true, regardless of the checks |
| `checks`                  | Verbatim from the status file; `{}` when there is no readable file |
| `message`                 | Present only on failure: why there are no checks |

**The agent never fails hard.** Missing file, unreadable file, invalid JSON,
or JSON that is not a status file — no `server` string, no `checks` object, or
any check whose `status` is not a §1 value (D16) — all return HTTP 200 with
`status: "unknown"`, `checks: {}` and a `message`. In that body `agent` is the
`server` from the agent's own config, since there is no file to take it from.
When the file exists but cannot be used, `status_file_age_seconds` and
`status_file_stale` still describe it from its mtime; when there is no file,
they are `-1` and `false` (`-1` does not exceed the threshold). The only non-200 responses are `401` (bad or missing token,
checked before the route) and `404` (any other route or method), each with a
body of `{ "message": "…" }`. The hub treats any non-200, timeout or unparseable body as
*unreachable*, not as a status.

Auth: `X-Neatour-Token: <shared secret>` on every request, checked by the web
server in front of the agent and by the agent again.

---

## 5. Hub response — `GET /api/status`

What the page consumes. The hub aggregates the last response it holds from
each agent.

```json
{
  "hub_version": "0.1.0",
  "generated_at": "2026-05-19T14:32:20+03:00",
  "status": "error",
  "servers": {
    "php": {
      "label": "PHP",
      "last_polled": "2026-05-19T14:32:15+03:00",
      "reachable": true,
      "status": "ok",
      "checks": { "disk_root": { "…": "as in §2" } }
    },
    "atrium": {
      "label": "Atrium",
      "last_polled": "2026-05-19T14:32:15+03:00",
      "reachable": true,
      "status": "warn",
      "checks": { "…": "…" }
    },
    "podcasts": {
      "label": "Podcasts",
      "last_polled": "2026-05-19T14:31:50+03:00",
      "reachable": false,
      "status": "unknown",
      "checks": {}
    }
  }
}
```

| Field         | Notes |
|---------------|-------|
| `status`      | Worst across servers |
| `label`       | Display name, from `hub.config.json` |
| `last_polled` | When the hub last *attempted* this agent |
| `reachable`   | Whether that attempt got a parseable 200 |
| `status`      | The agent's rolled-up status; `unknown` when not reachable |
| `checks`      | The agent's checks from the last successful poll; `{}` when never reached |

When an agent becomes unreachable the hub keeps serving its last known checks
with `reachable: false` and `status: "unknown"`, so the page can show what was
last seen. (Decision D8; the May draft returned `{}` here.)

---

## 6. Page local state

The page merges the hub response with its own client-side HTTP checks. Lives in
memory; never sent anywhere.

```json
{
  "hub_status": { "…": "the full §5 body" },
  "hub_last_seen": "2026-05-19T14:32:20+03:00",
  "hub_reachable": true,
  "site_checks": {
    "https://erezschatz.net/": {
      "status": "ok",
      "http_status": 200,
      "response_ms": 312,
      "checked_at": "2026-05-19T14:32:18+03:00",
      "message": "erezschatz.net responded in 312ms"
    },
    "https://cloud.example.net/": {
      "status": "error",
      "http_status": 0,
      "response_ms": null,
      "checked_at": "2026-05-19T14:32:19+03:00",
      "message": "No response (timeout)"
    }
  }
}
```

`site_checks` keys are the URLs in `frontend/sites.json`. A site check is
`ok` on any 2xx or 3xx within the timeout, `error` otherwise. Browser
`fetch` to a foreign origin without CORS headers still tells the page whether
the host answered (`mode: "no-cors"` resolves on any response and rejects on
network failure), so "up" is knowable even where the status code is not;
`http_status` is `0` in that case and the message says so.

`hub_reachable: false` is the "lost connection to home base" signal: the page
keeps rendering the last `hub_status` with a banner showing the age of
`hub_last_seen`.

---

## 7. Staleness summary

| Layer       | Signal                                   | Rendered as |
|-------------|------------------------------------------|-------------|
| Status file | `status_file_stale: true` in §4          | server `unknown` |
| Agent poll  | `reachable: false` in §5                 | server `unknown`, last checks dimmed |
| Hub         | page cannot fetch `/api/status`          | "lost connection" banner with age |
| Site check  | timeout or network failure from the page | site `error` |

---

## Reserved, not phase 1

Kept here so the routes are not reused for something else.

- Check fields `acknowledged: boolean` and `acknowledged_until: ISO 8601 | null`,
  added by the hub only, never present below it; an acknowledged check keeps
  its raw status and does not change the rollup.
- `POST /api/acknowledge` with `{ "server", "check", "until"? }` and
  `DELETE /api/acknowledge` with `{ "server", "check" }` on the hub.
