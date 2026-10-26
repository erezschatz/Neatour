# 03 · Agent on `podcasts`, behind its proxy, polled from Atrium by hand

## Context

**Promise.** From a shell on `atrium`,
`curl -H 'X-Neatour-Token: …' https://<podcasts host>/neatour/status`
returns the agent's body; without the token it returns 401 from nginx, not
from Deno. The status file is still hand-written at this point (D12).

**Acceptance**
- [ ] `podcasts`: system user, Deno, `/opt/neatour/agent`, `/var/lib/neatour`,
      config, systemd unit, nginx location — deployed by following
      `docs/SETUP.md` by hand
- [ ] `docs/SETUP.md` corrected with every deviation met on the real server
      (distro, Deno install method, paths); the Podcasts row filled in
- [ ] `journalctl -u neatour-agent` shows one log line per poll
- [ ] Verified by Erez from `atrium`: with token → 200 and the §4 body;
      without → 401; agent stopped → nginx 502
