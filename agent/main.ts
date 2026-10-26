import { defaultConfigPath, loadConfig } from "./config.ts";
import { makeHandler } from "./handler.ts";

// Usage: main.ts [path/to/agent.config.json]; defaults to the one beside this file.
const configPath = Deno.args[0] ?? defaultConfigPath();
const config = await loadConfig(configPath);

// The secret never comes from a file in the repo (D3); without one the
// agent would accept nothing, so refuse to start instead.
const secret = Deno.env.get("NEATOUR_SECRET") ?? "";
if (secret === "") {
  console.error("NEATOUR_SECRET is not set; refusing to start");
  Deno.exit(1);
}

console.log(`neatour agent for ${config.server}, config ${configPath}`);
console.log(`reading ${config.status_file}, stale after ${config.stale_threshold_seconds}s`);
// 127.0.0.1 only: the host's web server is the way in, and it checks the token first (D3).
Deno.serve({ hostname: "127.0.0.1", port: config.port }, makeHandler(config, secret));
