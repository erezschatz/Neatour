# 04 · Hub chamber and the page — the milestone

## Context

**Promise.** Open `https://neatour.<atrium domain>` on the phone, log in to
Atrium, and see `podcasts` with its checks and when it was last polled. Stop
the agent on `podcasts`; within one poll interval the page shows it as
unreachable with its last-known checks dimmed. This is the step that proves
the project (D12).

**Acceptance**
- [ ] `hub/mod.ts` exports a valid `Chamber` (docs/ATRIUM.md), hand-routes
      `/api/status` and static, runs standalone under `import.meta.main`
- [ ] `hub/poller.ts`, `state.ts`, `routes.ts`, `contract.ts`, `config.ts`,
      `hub.config.example.json`; state persisted under the configured data dir
      and reloaded on start; a write failure logs and continues (Atrium's `dev`
      task has no `--allow-write`)
- [ ] Tests: poller against a fake agent (200 body, non-200, timeout, bad
      JSON → `reachable: false`); state round-trip; routes for §5 body;
      contract identity with `agent/contract.ts`
- [ ] `frontend/index.html`, `style.css`, `app.js`: renders servers worst-first,
      each with its checks; polls `/api/status`; no framework, no build
- [ ] Registered in Atrium's `chambers.json` on `atrium`; the exact lines
      recorded in `docs/SETUP.md`
- [ ] Verified by Erez on the phone: the page shows `podcasts`; after stopping
      the agent, shows it unreachable within a poll interval
