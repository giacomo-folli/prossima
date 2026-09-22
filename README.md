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
result. The Supabase client consumes these generated types directly. Browser tests build
with `--mode test` and preview the static app under `/prossima/`, exercising the
same base path as GitHub Pages. The test runner reads the running local stack's
keys with `supabase status` and overrides environment-file values. The local
service-role key is used only by Node test fixtures, never exposed to the app.

### Tests

Run `pnpm db:start` before the integration and browser suites. Install Chromium
once with `pnpm exec playwright install chromium` (use `--with-deps` on Linux
when browser system dependencies are missing). No hosted credentials are needed.
Tests create and clean up their own data; resetting the database is unnecessary.
If your local stack was already running before the test rate-limit configuration
changed, restart it with `pnpm exec supabase stop` then `pnpm db:start` (data is
preserved).

| Command | Layer |
| --- | --- |
| `pnpm test:unit` | Vitest unit/module and Svelte DOM tests, with HTML, LCOV, and terminal coverage |
| `pnpm test:integration` | pgTAP migrations and row-level-security policies against local Supabase |
| `pnpm test:e2e` | Authenticated Playwright flows at desktop, mobile, and 320 px viewports |
| `pnpm test:a11y` | axe checks against the authentication route in Chromium |
| `pnpm test:browser` | All e2e viewports and accessibility checks against one test build |
| `pnpm test:worker` | Worker tests inside Cloudflare's Workers runtime |
| `pnpm test` | Unit, worker, database, and all browser checks |
| `pnpm test:ci` | Type checks followed by every test layer; the deployment gate |

Browser coverage includes login errors, login/logout and protected routes;
exercise creation, validation, editing, deletion, progress and undo; analytics;
workout logging, saved sets, session editing/deletion; profile updates; theme
persistence; and isolation between users. Feature mutations use the real local
Supabase API and are checked after page reloads. AI generation and offline/service
worker behavior are outside this suite; service workers are blocked for isolation.

Each browser test gets a unique account, isolated browser storage, and its own
exercise data. Fixtures clean up even on failure, so parallel runs and retries do
not share mutable state. Database policy fixtures roll back after each run.

To focus a browser run:

```bash
pnpm test:browser --project=desktop-chromium tests/e2e/exercises.spec.ts
```

CI retains the Playwright HTML report, failure screenshots/traces, and unit
coverage for seven days. They may contain disposable test sessions. Locally,
reports are ignored by Git; open CI's downloaded report with
`pnpm exec playwright show-report playwright-report`.


## Deployment

The project is configured for GitHub Pages using `@sveltejs/adapter-static`.

The workflow runs `pnpm test:ci` on pull requests targeting `master` and pushes
to `master`. It starts disposable Supabase services with migrations, installs
Chromium, and runs the tests without production secrets. A failed check blocks
the production build and deployment. Only successful pushes to `master` build
with production credentials and publish to Pages; pull requests only run checks.
PR concurrency groups are separate from the deployment group.

CI setup follows the [Playwright CI guide](https://playwright.dev/docs/ci) and
[Supabase local testing guide](https://supabase.com/docs/guides/local-development/testing/overview).

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
