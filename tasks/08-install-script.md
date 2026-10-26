# 08 · Install script

## Context

**Promise.** `sudo agent/install.sh <server-name>` on a fresh Linux box with
Deno does everything `docs/SETUP.md` lists for an agent — user, folders,
permissions, config from the example, systemd unit, cron with that server's
check list — and prints the web-server snippet to paste. Running it again on
an installed server updates the files and changes nothing else. Erez has
agreed the finished product needs this (2026-10-26).

**Acceptance**
- [ ] `agent/install.sh` idempotent; refuses to run as non-root; refuses an
      unknown server name; never overwrites an existing `agent.config.json`
      or the secret
- [ ] Tested in a container or chroot in the workspace against a fake
      `systemctl`; the second run is a no-op
- [ ] `docs/SETUP.md` manual section replaced by "run the script", with the
      web-server snippets kept
- [ ] Verified by Erez: run on one of the three servers over the manual
      install; nothing changes except file timestamps
