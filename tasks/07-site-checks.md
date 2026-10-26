# 07 · Site checks and the lost-connection banner

## Context

**Promise.** The page also says whether the public sites answer, measured from
the phone itself. When Atrium is down, the page still opens (from the
browser's cache or a fresh load that fails) and shows a banner with how old
its last good hub response is, with the site checks still live underneath.

**Acceptance**
- [ ] `frontend/sites.json` lists the public URLs; `app.js` checks them per
      CONTRACT §6 (`no-cors` fetch, timeout, `http_status` 0 when opaque)
- [ ] Merged local state per §6; site results rendered alongside the servers
- [ ] Hub unreachable → banner with the age of `hub_last_seen`; servers from
      the last response stay visible, dimmed
- [ ] Tests for the merge and the staleness rendering decisions (pure
      functions in `app.js` tested under `deno test`)
- [ ] Verified by Erez on the phone: stop Atrium; the banner appears; the site
      checks keep updating
