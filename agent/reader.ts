import { STATUSES, type StatusFile } from "./contract.ts";

export interface ReadResult {
  file: StatusFile | null; // null when there is nothing usable to serve
  ageSeconds: number; // -1 when there is no file (CONTRACT §4)
  stale: boolean;
  error?: string; // why `file` is null
}

// Reads the status file cron wrote. Never throws: every way the file can be
// wrong becomes a ReadResult with `file: null` and a reason, because the agent
// answers 200 with `unknown` rather than failing (CONTRACT §4).
// `now` is a parameter so tests can say "ten minutes later" without waiting.
export async function readStatusFile(
  path: string,
  staleThresholdSeconds: number,
  now: Date = new Date(),
): Promise<ReadResult> {
  let mtime: Date | null;
  try {
    mtime = (await Deno.stat(path)).mtime;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return { file: null, ageSeconds: -1, stale: false, error: `no status file at ${path}` };
    }
    return { file: null, ageSeconds: -1, stale: false, error: `cannot stat ${path}: ${describe(err)}` };
  }
  if (mtime === null) {
    return { file: null, ageSeconds: -1, stale: false, error: `no modification time for ${path}` };
  }

  // Clamped at 0: a file stamped slightly in the future (clock skew) is fresh, not negative.
  const ageSeconds = Math.max(0, Math.floor((now.getTime() - mtime.getTime()) / 1000));
  const stale = ageSeconds > staleThresholdSeconds;

  let text: string;
  try {
    text = await Deno.readTextFile(path);
  } catch (err) {
    return { file: null, ageSeconds, stale, error: `cannot read ${path}: ${describe(err)}` };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { file: null, ageSeconds, stale, error: `${path} is not valid JSON` };
  }

  const problem = shapeProblem(parsed);
  if (problem) {
    return { file: null, ageSeconds, stale, error: `${path} is not a status file: ${problem}` };
  }
  return { file: parsed as StatusFile, ageSeconds, stale };
}

// Checks only what the agent relies on: a server name, and checks whose
// status it can roll up (D16). Everything else in a check is passed through
// verbatim, as CONTRACT §4 says.
function shapeProblem(value: unknown): string | null {
  if (!isObject(value)) return "expected a JSON object";
  if (typeof value.server !== "string") return `"server" is not a string`;
  if (!isObject(value.checks)) return `"checks" is not an object`;
  for (const [key, check] of Object.entries(value.checks)) {
    if (!isObject(check)) return `check "${key}" is not an object`;
    if (!(STATUSES as readonly unknown[]).includes(check.status)) {
      return `check "${key}" has status ${JSON.stringify(check.status)}`;
    }
  }
  return null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
