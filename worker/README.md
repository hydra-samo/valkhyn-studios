# valkhyn-api Worker

API Worker for `https://api.valkhyn.site`. Deployed from this directory via Cloudflare Workers Builds on the `valkhyn-studios` repo.

- `index.ts` — Worker routes: `GET /health`, `GET /api`, `GET /api/projects`, `POST /api/contact`, `GET /api/inquiries`, `POST /api/publish`, `POST|DELETE /api/media/<key>`.
- `wrangler.toml` — D1 (`valkhyn-db`) and R2 (`valkhyn-media`) bindings. `PUBLISH_TOKEN` is a Cloudflare Worker secret, never in Git.
- `d1/migrations/0001_init.sql` — schema already applied to the live D1 database.

The public site uses a `mailto:` brief form and does not call this API. These endpoints exist for the future private publishing dashboard and integrations.
