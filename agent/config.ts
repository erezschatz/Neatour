import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface Config {
  server: string; // the name reported when there is no status file to take it from
  port: number;
  status_file: string; // absolute, after loading
  stale_threshold_seconds: number;
}

const DEFAULT_PORT = 9100;
const DEFAULT_STALE_THRESHOLD_SECONDS = 600; // two missed five-minute cron runs

// The config is a file written by hand on the server, so every field is
// checked rather than trusted. A bad config stops the agent at start, where
// systemd and journalctl show it, instead of serving wrong answers.
export async function loadConfig(path: string): Promise<Config> {
  const raw: unknown = JSON.parse(await Deno.readTextFile(path));
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error(`${path}: expected a JSON object`);
  }
  const fields = raw as Record<string, unknown>;

  if (typeof fields.server !== "string" || fields.server === "") {
    throw new Error(`${path}: "server" must be a non-empty string`);
  }
  if (typeof fields.status_file !== "string" || fields.status_file === "") {
    throw new Error(`${path}: "status_file" must be a non-empty string`);
  }
  const port = fields.port ?? DEFAULT_PORT;
  if (typeof port !== "number" || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${path}: "port" must be an integer from 1 to 65535`);
  }
  const stale = fields.stale_threshold_seconds ?? DEFAULT_STALE_THRESHOLD_SECONDS;
  if (typeof stale !== "number" || !(stale > 0)) {
    throw new Error(`${path}: "stale_threshold_seconds" must be a positive number`);
  }

  // A relative status_file is relative to the config file, not to wherever
  // the process was started, so the dev config in fixtures/ works from any cwd.
  const statusFile = isAbsolute(fields.status_file)
    ? fields.status_file
    : join(dirname(path), fields.status_file);

  return { server: fields.server, port, status_file: statusFile, stale_threshold_seconds: stale };
}

// Default location: agent.config.json beside main.ts (SPEC: Configuration).
export function defaultConfigPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "agent.config.json");
}
