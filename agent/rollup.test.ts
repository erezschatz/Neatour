import assert from "node:assert/strict";
import type { Check, Status } from "./contract.ts";
import { rollup, worst } from "./rollup.ts";

Deno.test("worst follows error > warn > unknown > ok", () => {
  assert.equal(worst(["ok", "ok"]), "ok");
  assert.equal(worst(["ok", "unknown"]), "unknown");
  assert.equal(worst(["unknown", "warn", "ok"]), "warn");
  assert.equal(worst(["warn", "error", "unknown"]), "error");
});

Deno.test("an empty set rolls up to unknown", () => {
  assert.equal(worst([]), "unknown");
  assert.equal(rollup({}), "unknown");
});

Deno.test("rollup reads the status of each check", () => {
  const check = (status: Status): Check => ({ status, value: 1, message: "", checked_at: "" });
  assert.equal(rollup({ a: check("ok"), b: check("warn") }), "warn");
});
