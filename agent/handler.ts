import { timingSafeEqual } from "node:crypto";
import type { AgentResponse } from "./contract.ts";
import type { Config } from "./config.ts";
import { readStatusFile } from "./reader.ts";
import { rollup } from "./rollup.ts";

// Kept equal to `version` in the root deno.json (handler.test.ts checks).
// It lives here, not in agent/deno.json, because that file carries the
// permission-flag comments and so cannot be imported as JSON (D17).
export const AGENT_VERSION = "0.1.0";

// `now` is a parameter so tests can fix the clock against the fixtures' mtimes.
export function makeHandler(
  config: Config,
  secret: string,
  now: () => Date = () => new Date(),
): (req: Request) => Promise<Response> {
  return async (req) => {
    const path = new URL(req.url).pathname;
    let response: Response;
    // Token first, so an unauthenticated caller learns nothing about routes (D3).
    if (!tokenMatches(req.headers.get("X-Neatour-Token"), secret)) {
      response = json({ message: "missing or wrong X-Neatour-Token" }, 401);
    } else if (req.method === "GET" && path === "/status") {
      response = json(await statusBody(config, now()), 200);
    } else {
      response = json({ message: `no route for ${req.method} ${path}` }, 404);
    }
    // One line per request; journald adds the time.
    console.log(`${req.method} ${path} ${response.status}`);
    return response;
  };
}

async function statusBody(config: Config, now: Date): Promise<AgentResponse> {
  const base = { agent_version: AGENT_VERSION, polled_at: now.toISOString() };
  try {
    const read = await readStatusFile(config.status_file, config.stale_threshold_seconds, now);
    if (read.file === null) {
      return {
        agent: config.server,
        ...base,
        status_file_age_seconds: read.ageSeconds,
        status_file_stale: read.stale,
        status: "unknown",
        checks: {},
        message: read.error ?? "no status file",
      };
    }
    return {
      agent: read.file.server,
      ...base,
      status_file_age_seconds: read.ageSeconds,
      status_file_stale: read.stale,
      // A stale file's checks are shown but not believed (CONTRACT §4).
      status: read.stale ? "unknown" : rollup(read.file.checks),
      checks: read.file.checks,
    };
  } catch (err) {
    // The reader does not throw; this is the guard that keeps the
    // "always 200 with parseable JSON" promise if it ever does.
    return {
      agent: config.server,
      ...base,
      status_file_age_seconds: -1,
      status_file_stale: false,
      status: "unknown",
      checks: {},
      message: `agent error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// Constant-time comparison, so the token cannot be guessed a byte at a time
// from response timings. Unequal lengths are rejected first because
// timingSafeEqual requires equal lengths; that leaks only the length.
function tokenMatches(given: string | null, secret: string): boolean {
  if (given === null) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
