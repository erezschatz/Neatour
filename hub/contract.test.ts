import assert from "node:assert/strict";

// D11: the agent cannot import from the hub, so the contract is held twice.
// This is the test that keeps the two copies one contract.
Deno.test("agent/contract.ts and hub/contract.ts are byte-identical", async () => {
  const hub = await Deno.readTextFile(new URL("./contract.ts", import.meta.url));
  const agent = await Deno.readTextFile(new URL("../agent/contract.ts", import.meta.url));
  assert.equal(agent, hub, "edit agent/contract.ts and hub/contract.ts in the same scene");
});
