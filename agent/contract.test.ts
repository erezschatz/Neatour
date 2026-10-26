import assert from "node:assert/strict";
import { type AgentResponse, type StatusFile, STATUSES } from "./contract.ts";

// The examples of docs/CONTRACT.md §3 and §4, typed. `deno test` type-checks
// this file, so a field renamed in the types but not in the doc fails here.
const statusFile: StatusFile = {
  server: "podcasts",
  generated_at: "2026-05-19T14:30:00+03:00",
  checks: {
    disk_root: { status: "ok", value: 42, unit: "percent_used", message: "/ is 42% full", checked_at: "2026-05-19T14:30:00+03:00", detail: [] },
    memory: { status: "warn", value: 84, unit: "percent_used", message: "Memory at 84%", checked_at: "2026-05-19T14:30:00+03:00", detail: [] },
    mysql: { status: "ok", value: true, unit: "running", message: "mysql is running", checked_at: "2026-05-19T14:30:00+03:00", detail: [] },
    catalyst_app: { status: "error", value: false, unit: "running", message: "catalyst process not found", checked_at: "2026-05-19T14:30:00+03:00", detail: [] },
  },
};

Deno.test("the CONTRACT §3 example status file fits the types", () => {
  for (const check of Object.values(statusFile.checks)) {
    assert.ok(STATUSES.includes(check.status));
  }
});

Deno.test("an agent response with no file carries unknown, no checks and a message (§4)", () => {
  const noFile: AgentResponse = {
    agent: "podcasts",
    agent_version: "0.1.0",
    polled_at: "2026-05-19T14:32:15+03:00",
    status_file_age_seconds: -1,
    status_file_stale: true,
    status: "unknown",
    checks: {},
    message: "no status file at /var/lib/neatour/status.json",
  };
  assert.deepEqual(noFile.checks, {});
  assert.ok(STATUSES.includes(noFile.status));
});
