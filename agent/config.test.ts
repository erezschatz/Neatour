import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.ts";

const fixtures = fileURLToPath(new URL("./fixtures/", import.meta.url));

Deno.test("the dev config loads, with status_file resolved beside it", async () => {
  const config = await loadConfig(`${fixtures}agent.config.dev.json`);
  assert.equal(config.server, "laptop");
  assert.equal(config.port, 9100);
  assert.equal(config.status_file, `${fixtures}status.fresh.json`);
  assert.equal(config.stale_threshold_seconds, 600);
});

Deno.test("the example config loads and keeps its absolute path", async () => {
  const config = await loadConfig(fileURLToPath(new URL("./agent.config.example.json", import.meta.url)));
  assert.equal(config.status_file, "/var/lib/neatour/status.json");
});

Deno.test("a config that is not a status-file config is refused at start", async () => {
  await assert.rejects(loadConfig(`${fixtures}status.fresh.json`), /"status_file" must be/);
});
