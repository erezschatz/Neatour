// The data contract, docs/CONTRACT.md, as types. This file exists twice, as
// agent/contract.ts and hub/contract.ts, and the two must stay byte-identical
// (D11; hub/contract.test.ts enforces it): the agent is installed as a
// standalone folder and cannot import from the hub. Edit both in the same scene.

// §1. A runtime list, not only a type, because a status read from a file or
// from the wire has to be checked against it.
export const STATUSES = ["ok", "warn", "error", "unknown"] as const;
export type Status = typeof STATUSES[number];

// §2. The atomic unit, produced by a bash check and carried through unchanged.
export interface Check {
  status: Status;
  value: number | boolean | string;
  unit?: string;
  message: string;
  checked_at: string; // ISO 8601, when the script ran
  detail?: string[];
}

// §3. Written by assemble.sh, read by the agent. Keys of `checks` are the
// stable check identifiers (`disk_root`, `mysql`, …).
export interface StatusFile {
  server: string;
  generated_at: string;
  checks: Record<string, Check>;
}

// §4. The agent's answer to GET /status. Always HTTP 200; `message` only
// when there are no checks to give and why.
export interface AgentResponse {
  agent: string;
  agent_version: string;
  polled_at: string;
  status_file_age_seconds: number; // -1 when there is no file
  status_file_stale: boolean;
  status: Status;
  checks: Record<string, Check>;
  message?: string;
}

// §5. One server as the hub reports it.
export interface ServerState {
  label: string;
  last_polled: string;
  reachable: boolean;
  status: Status; // "unknown" when not reachable
  checks: Record<string, Check>; // last known, kept when unreachable (D8)
}

// §5. The hub's answer to GET /api/status.
export interface HubResponse {
  hub_version: string;
  generated_at: string;
  status: Status;
  servers: Record<string, ServerState>;
}
