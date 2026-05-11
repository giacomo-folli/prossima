# Progress Tracker

A simple workout and exercise tracking app built with SvelteKit.

The goal of this project is to keep exercise tracking simple and effortless. The app focuses on daily progress, exercise completion, and keeping a clear overview of training activity.

## Features

* Exercise overview page
* Individual exercise pages
* Progress tracking


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

The project is configured for GitHub Pages using `@sveltejs/adapter-static` and GitHub Actions.

Production builds are automatically deployed when changes are pushed to the `master` branch.

## Project Structure

```text
src/
├── lib/
├── routes/
├── app.html
└── app.css
```

## Notes

Because the app is deployed under a GitHub Pages subpath, internal routes use SvelteKit path resolution instead of hardcoded absolute URLs.

## Next Steps

Planned improvements for the project:

- [x] Local persistence with localStorage
- [ ] Import/export progress data to `training_plan.yaml` 
- [ ] Dashboard and statistics
  -  [ ] Weekly and monthly progress summaries
- [ ] Better mobile layout
- [ ] Custom exercise creation
- [ ] Weekly schedule
- [ ] Authentication and profile
- [ ] Offline support
- [ ] Workout routines and grouped sessions

## License

MIT
