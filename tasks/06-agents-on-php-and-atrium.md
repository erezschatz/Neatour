# 06 · Agents on `php` and `atrium`

## Context

**Promise.** All three servers are on the page with real checks. `php` shows
Apache, php-fpm, MySQL, the two PM2 apps, disk and memory; `atrium` shows
Atrium's own process, disk and memory. Daily use starts here.

**Acceptance**
- [ ] `php`: deployed by hand per `docs/SETUP.md`; the Apache equivalent of the
      nginx token gate written into SETUP; `agent/servers/php.sh` complete
- [ ] `atrium`: deployed by hand; `agent/servers/atrium.sh` complete; the hub
      polls its own host through nginx like any other
- [ ] `hub.config.json` on `atrium` lists all three agents
- [ ] `docs/SETUP.md` rows for `php` and `atrium` filled in, deviations recorded
- [ ] Verified by Erez on the phone: three servers, all reachable, real checks
