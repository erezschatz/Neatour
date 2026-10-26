# Atrium — what the hub must obey

Read when touching `hub/`. Facts taken from the Atrium repo
(`erezschatz/Atrium`, `core/types.ts`, `CLAUDE.md`, `core/chambers/domo/mod.ts`)
on 2026-10-26. If Atrium changes, this file changes in the same scene as the
hub.

## A chamber is a fetch handler, not a server

Atrium is one Deno process. It imports each chamber's `mod.ts` at startup and
calls its `fetch` for every request whose hostname is that chamber's domain.
No subprocess, no port, no PM2. The hub therefore:

- exports, as default, an object satisfying

  ```ts
  interface Chamber {
    domain: string;        // leave "" — Atrium sets it from chambers.json
    displayName: string;   // shown on Domo's dashboard
    fetch: (req: Request) => Response | Promise<Response>;
  }
  ```

- never calls `Deno.serve` except inside `if (import.meta.main)`, for
  standalone development;
- runs its poller from module scope: the `setInterval` starts when Atrium
  imports the module and lives as long as Atrium's process. There is no
  "start" call. A thrown error during import stops Atrium from starting, so
  config errors must be reported and tolerated, not thrown;
- must not assume `Deno.cwd()` is the hub folder. Paths are resolved from
  `import.meta.dirname` (static files) or taken from `hub.config.json` (the
  data directory);
- cannot rely on its own `deno.json` for permissions: Atrium's
  `deno task start` grants `--allow-run --allow-net --allow-read --allow-write
  --allow-env --allow-sys` to the whole process. The hub needs `net` (polling),
  `read` and `write` (state file and config), nothing else. Atrium's `dev`
  task lacks `--allow-write`; the hub's state write must fail soft there.

## Registration

On `atrium`, in Atrium's root:

```json
// chambers.json (gitignored in Atrium)
{
  "neatour": { "path": "/chambers/neatour/" }
}
```

`chambers/neatour` is a symlink to this repo's `hub/` folder. Domain defaults
to `neatour.<ATRIUM_DOMAIN>`; a `"domain"` field overrides it.

## Auth and domains

A chamber whose domain is `ATRIUM_DOMAIN` or a subdomain of it sits behind
Atrium's session login (HMAC-signed cookie scoped to `.ATRIUM_DOMAIN`). That is
the page's only login and it is enough (D8). A chamber on an unrelated domain
gets no auth from Atrium at all — the hub must stay on a subdomain.

Atrium bypasses auth for `/manifest.json`, `/sw.js`, images and fonts, so a
PWA manifest can be served without a login; the page itself cannot. Atrium
also injects a session-expiry script into every HTML response; the page should
not be surprised by an extra `<script>` before `</head>`.

## Hostname dispatch

Atrium routes on `new URL(req.url).hostname`, not the `Host` header (null under
HTTP/2 TLS). The hub's `fetch` receives the full original request; it should
route on `url.pathname` only.

## Dependencies

Atrium resolves imports through its own `import_map.json`; `npm install` is
never run. The hub must import nothing that is not a `node:` or `jsr:`/`https:`
specifier Deno can resolve on first use, and in phase 1 it imports nothing
outside the standard library (D9).

## Domo as the model

`core/chambers/domo/mod.ts` is the smallest working chamber: hand-routes
`/api/*` to a handler, everything else to a static handler built from
`import.meta.dirname`, and has an `import.meta.main` block for standalone
use. The hub copies that shape.
