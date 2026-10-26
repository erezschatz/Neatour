import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import type { AgentResponse } from "./contract.ts";
import type { Config } from "./config.ts";
import { AGENT_VERSION, makeHandler } from "./handler.ts";

const fixtures = fileURLToPath(new URL("./fixtures/", import.meta.url));
const SECRET = "test-secret";

function configFor(statusFile: string): Config {
  return { server: "laptop-config", port: 9100, status_file: `${fixtures}${statusFile}`, stale_threshold_seconds: 600 };
}

// A clock 60 s after the fixture's mtime, so "fresh" holds however old the checkout is.
async function clockAfterMtime(statusFile: string, seconds: number): Promise<() => Date> {
  const mtime = (await Deno.stat(`${fixtures}${statusFile}`)).mtime;
  if (mtime === null) throw new Error("no mtime");
  return () => new Date(mtime.getTime() + seconds * 1000);
}

function get(path: string, token: string | null = SECRET, method = "GET"): Request {
  const headers = new Headers();
  if (token !== null) headers.set("X-Neatour-Token", token);
  return new Request(`http://127.0.0.1:9100${path}`, { method, headers });
}

// The handler logs one line per request; keep test output clean.
async function quietly<T>(fn: () => Promise<T>): Promise<T> {
  const log = console.log;
  console.log = () => {};
  try {
    return await fn();
  } finally {
    console.log = log;
  }
}

Deno.test("401 with a JSON body when the token is missing or wrong", async () => {
  const handler = makeHandler(configFor("status.fresh.json"), SECRET);
  for (const token of [null, "wrong", "test-secreT", ""]) {
    const res = await quietly(() => handler(get("/status", token)));
    assert.equal(res.status, 401);
    assert.equal(res.headers.get("Content-Type"), "application/json");
    assert.ok(typeof (await res.json()).message === "string");
  }
});

Deno.test("401 comes before 404: no route is revealed without the token", async () => {
  const handler = makeHandler(configFor("status.fresh.json"), SECRET);
  const res = await quietly(() => handler(get("/anything", null)));
  assert.equal(res.status, 401);
  await res.body?.cancel();
});

Deno.test("404 with a JSON body for any other route or method", async () => {
  const handler = makeHandler(configFor("status.fresh.json"), SECRET);
  for (const req of [get("/"), get("/status/"), get("/acknowledge"), get("/status", SECRET, "POST")]) {
    const res = await quietly(() => handler(req));
    assert.equal(res.status, 404);
    assert.match((await res.json()).message, /no route/);
  }
});

Deno.test("200 with checks: the CONTRACT §4 body for a fresh file", async () => {
  const handler = makeHandler(configFor("status.fresh.json"), SECRET, await clockAfterMtime("status.fresh.json", 60));
  const res = await quietly(() => handler(get("/status")));
  assert.equal(res.status, 200);
  const body: AgentResponse = await res.json();
  assert.deepEqual(Object.keys(body), [
    "agent", "agent_version", "polled_at", "status_file_age_seconds", "status_file_stale", "status", "checks",
  ]);
  assert.equal(body.agent, "laptop"); // from the file, not the config
  assert.equal(body.agent_version, AGENT_VERSION);
  assert.equal(body.status_file_age_seconds, 60);
  assert.equal(body.status_file_stale, false);
  assert.equal(body.status, "warn"); // worst of ok, warn, ok
  const file = JSON.parse(await Deno.readTextFile(`${fixtures}status.fresh.json`));
  assert.deepEqual(body.checks, file.checks); // verbatim
});

Deno.test("200 with checks but unknown when the file is stale", async () => {
  const handler = makeHandler(configFor("status.fresh.json"), SECRET, await clockAfterMtime("status.fresh.json", 601));
  const body: AgentResponse = await (await quietly(() => handler(get("/status")))).json();
  assert.equal(body.status_file_stale, true);
  assert.equal(body.status, "unknown");
  assert.equal(Object.keys(body.checks).length, 3); // still shown, not believed
});

Deno.test("200 without checks: unknown, {} and a message when there is no usable file", async () => {
  for (const file of ["does-not-exist.json", "status.invalid.json", "status.wrong-shape.json"]) {
    const handler = makeHandler(configFor(file), SECRET);
    const res = await quietly(() => handler(get("/status")));
    assert.equal(res.status, 200);
    const body: AgentResponse = await res.json();
    assert.equal(body.agent, "laptop-config"); // nothing else to take it from
    assert.equal(body.status, "unknown");
    assert.deepEqual(body.checks, {});
    assert.ok(body.message && body.message.length > 0);
  }
});

Deno.test("AGENT_VERSION matches the repo version in the root deno.json", async () => {
  // Only meaningful in the repo; the installed agent folder has no root deno.json and runs no tests.
  const root = JSON.parse(await Deno.readTextFile(new URL("../deno.json", import.meta.url)));
  assert.equal(AGENT_VERSION, root.version, "bump AGENT_VERSION in agent/handler.ts with version in deno.json");
});
