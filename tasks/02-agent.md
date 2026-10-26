# 02 · Agent: reads the status file, answers `GET /status`

## Context

**Promise.** Started on a laptop with a hand-written `status.json`, the agent
answers `GET /status` with the CONTRACT §4 body: the checks verbatim, the
file's age, whether it is stale, the rolled-up status. A missing, unreadable
or malformed file gets `status: "unknown"` and a reason, still HTTP 200. A
wrong token gets 401. Nothing else exists.

**Acceptance**
- [ ] `agent/main.ts`, `handler.ts`, `reader.ts`, `rollup.ts`, `config.ts`,
      `contract.ts`, `deno.json`, `agent.config.example.json`,
      `neatour-agent.service`, each `deno run` flag with its reason
- [ ] Tests beside each unit: rollup priority (incl. empty → `unknown`);
      reader against fixtures for missing / unreadable / invalid / stale /
      fresh; handler for 401, 404, and the two 200 shapes
- [ ] `deno task start` in `agent/` serves `http://127.0.0.1:9100/status`
      against `agent/fixtures/status.fresh.json`, verified by Erez with `curl`
- [ ] `docs/CONTRACT.md` §4 matches the body exactly; any discrepancy fixed in
      one of the two in this scene
