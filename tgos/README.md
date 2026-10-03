# tgos

That Good Sh*t internal tools at [tgos.app](https://tgos.app). Team members log in with a
texted code. See `AGENTS.md` for architecture.

```sh
pnpm install
cp .env.example .env.local   # fill in
pnpm db:migrate
pnpm dev                     # http://localhost:3000
```
