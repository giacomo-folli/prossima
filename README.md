# Progress Tracker

A simple workout and exercise tracking app built with SvelteKit.

The goal of this project is to keep exercise tracking simple and effortless. The app focuses on daily progress, exercise completion, and configurable training plans using YAML.

## Features

* Exercise overview page
* Individual exercise detail pages
* Progress tracking with session summaries
* Training plan settings with YAML editor and file upload
* Analytics and training review pages


## Development

Prerequisites:

- Node.js 22.13 or newer and pnpm 11.5.0 (the version declared in `package.json`).
- Docker, with the daemon running, for local Supabase and database tests.
- Chromium installed for Playwright (`pnpm exec playwright install chromium`).

```bash
# Install dependencies:
pnpm install --frozen-lockfile

# Run the development server:
pnpm dev

# Build for production:
pnpm build

# Preview the production build:
pnpm preview
```

### Local Supabase

The local stack applies every migration and then loads deterministic fixtures
for two isolated users from `supabase/seed.sql`. The fixtures and their
credentials are only for the disposable local database.

```bash
# Start the local services (requires Docker):
pnpm db:start

# Reapply migrations and deterministic seed data:
pnpm db:reset

# Regenerate src/lib/database.types.ts from the migrated public schema:
pnpm db:types
```

Regenerate the database types after every schema migration and commit the
result. The Supabase client consumes these generated types directly. Browser
tests run Vite in `test` mode and use the public local-only values in
`.env.test`; they never use production data.

### Tests

Run `pnpm db:start` and `pnpm db:reset` once before the integration and
authenticated browser suites. Install Chromium once with
`pnpm exec playwright install chromium`.

| Command | Layer |
| --- | --- |
| `pnpm test:unit` | Vitest unit/module and Svelte DOM tests, with HTML, LCOV, and terminal coverage |
| `pnpm test:integration` | pgTAP migrations and row-level-security policies against local Supabase |
| `pnpm test:e2e` | Authenticated Playwright flows at desktop, mobile, and 320 px viewports |
| `pnpm test:a11y` | axe checks against rendered routes in Chromium |
| `pnpm test:worker` | Worker tests inside Cloudflare's Workers runtime |
| `pnpm test` | Every layer above, in dependency order |

The generated Playwright authentication state is written to
`playwright/.auth/` and is ignored by Git because it contains a reusable local
session. Test and coverage reports are also ignored.


## Deployment

The project is configured for GitHub Pages using `@sveltejs/adapter-static`.

Production builds output static files to the `build/` directory, and the app uses a production base path of `/prossima`.

## Project Structure

```text
src/
├─ app.css
├─ app.html
├─ lib/
│   ├─ components/
│   ├─ stores/
│   └─ utils/
└─ routes/
    ├─ analytics/
    ├─ exercises/
    ├─ settings/
    └─ training/
```

## Notes

Because the app is deployed under a GitHub Pages subpath, internal routes use SvelteKit path resolution and the production base path is configured in `svelte.config.js`.

## Guiding Principles

Planned improvements for the project:

- Optimize for local-micro competitions and winnability (competitive motivation)
- Kudos, increase future run frequency 
- Less feature is more
- Streaks becomes motivation to obligation
- Use random rewards
- Encourage closing open loops [Gestalt's Principle]

## License

MIT
