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


```bash
# Install dependencies:
pnpm install

# Run the development server:
pnpm dev

# Build for production:
pnpm build

# Preview the production build:
pnpm preview
```


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

## Next Steps

Planned improvements for the project:

- [x] Add support for PWA on mobile
- [x] Dashboard and statistics
- [ ] Custom exercise creation
- [ ] Weekly schedule
- [ ] Workout routines and grouped sessions

## License

MIT
