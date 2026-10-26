import type { Check, Status } from "./contract.ts";

// CONTRACT §1: error > warn > unknown > ok. `unknown` outranks `ok` because a
// check that cannot say it is fine must not be shown as fine.
const RANK: Record<Status, number> = { ok: 0, unknown: 1, warn: 2, error: 3 };

export function worst(statuses: Status[]): Status {
  // An empty set says nothing, and nothing is not "ok".
  if (statuses.length === 0) return "unknown";
  let result: Status = "ok";
  for (const status of statuses) {
    if (RANK[status] > RANK[result]) result = status;
  }
  return result;
}

export function rollup(checks: Record<string, Check>): Status {
  return worst(Object.values(checks).map((check) => check.status));
}
