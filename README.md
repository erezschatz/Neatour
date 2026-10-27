# Neatour

neat · tour · ניטור. A bespoke monitor for three personal servers: a thin Deno
agent on each serves a status file written by cron-driven bash checks; a hub,
running as an [Atrium](https://github.com/erezschatz/Atrium) chamber, polls the
agents and serves one page that says whether everything is up.

Start with [`docs/SPEC.md`](docs/SPEC.md). To work here, read
[`CLAUDE.md`](CLAUDE.md), then `docs/DECISIONS.md` and `docs/PLAN.md`.
Setup is in [`docs/SETUP.md`](docs/SETUP.md) — after cloning, run
`deno task hooks` once, then `deno task test`.

The repo is worked under the Unities (`docs/UNITIES.md`): every commit carries
its test, its doc line and its task record, and `CHANGELOG.md` is compiled from
`tasks/`, never edited. The developer's guide is `docs/working-on-a-task.md`.

## License

MIT, see [LICENSE](LICENSE).
