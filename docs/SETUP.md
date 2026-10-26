# Setup

Machines, toolchain, pinned versions. Read for toolchain or environment
problems, not for what Neatour is.

## Machines

| Machine     | Role                         | OS            | Notes |
|-------------|------------------------------|---------------|-------|
| MacBook Pro (arm64) | development; `deno test`, `deno check`, commits | macOS | Erez's machine. Also where Claude Code runs. |
| Claude's workspace | implementation; `deno test`, `deno check`, the hook tests | Linux x86_64 | No access to any server. Deno installed via `npm i -g deno`. |
| `php`       | agent                        | Linux, Apache 2 | *fill in distro and version at step 03/06* |
| `atrium`    | agent + hub (Atrium chamber) | Arch Linux, nginx | Atrium runs as one Deno process; see `docs/ATRIUM.md` |
| `podcasts`  | agent                        | Linux, nginx | *fill in distro and version at step 03* |

## Toolchain

| Tool | Version | Where | Why |
|------|---------|-------|-----|
| Deno | 2.x — pin the exact version at step 01 and record it here | Mac, workspace, every server | agent, hub, hooks, compiler |
| jq   | any 1.6+ | every server | `assemble.sh` |
| bash | 4+ | every server | checks |
| cron, systemd | the server's own | every server | scheduling the checks; running the agent |
| git  | any recent | Mac, workspace | `git config core.hooksPath .githooks` once per clone (`deno task hooks`) |
| Node | ≥ 18 | Mac, workspace | the commit hooks and the changelog compiler (D15); never on a server |

## First clone

```sh
git clone https://github.com/erezschatz/Neatour neatour
cd neatour
deno task hooks     # git config core.hooksPath .githooks — installs the commit gate
deno task test      # must pass before touching anything
```

## Agent deployment (manual; step 08 scripts this)

On the server, as root:

1. `useradd --system --no-create-home --shell /usr/sbin/nologin neatour`
2. Install Deno for that user or system-wide; record how, here.
3. `mkdir -p /opt/neatour/agent && cp -r agent/* /opt/neatour/agent/`
4. `mkdir -p /var/lib/neatour && chown root:neatour /var/lib/neatour && chmod 750 /var/lib/neatour`
5. `cp agent.config.example.json agent.config.json`, edit `server`, `port`,
   paths; `chown neatour:neatour`, `chmod 640`.
6. `cp neatour-agent.service /etc/systemd/system/`, set `NEATOUR_SECRET` in
   it, `systemctl daemon-reload && systemctl enable --now neatour-agent`.
7. In the host's web server, proxy `/neatour/` to `http://127.0.0.1:9100/` and
   reject requests whose `X-Neatour-Token` is not the secret (D3). nginx:

   ```nginx
   location /neatour/ {
       if ($http_x_neatour_token != "<secret>") { return 401; }
       proxy_pass http://127.0.0.1:9100/;
   }
   ```

   Apache (`php`): the equivalent with `<Location>`, `RewriteCond` on
   `%{HTTP:X-Neatour-Token}`, and `ProxyPass`. Written out at step 06.
8. `echo '*/5 * * * * root /opt/neatour/agent/scripts/assemble.sh /opt/neatour/agent/servers/<name>.sh >> /var/log/neatour-assemble.log 2>&1' > /etc/cron.d/neatour`

Steps 3–8 are the procedure `agent/install.sh` automates at step 08. Until
then, whatever deviates from this list on a real server is written back here
in the same scene.

## Hub deployment

On `atrium`: symlink `hub/` into Atrium's `chambers/` directory, add an entry
to `chambers.json`, copy `hub.config.example.json` to `hub.config.json` and fill
in the agents and the data directory, restart Atrium. Details in
`docs/ATRIUM.md`; the exact lines are recorded at step 04.
