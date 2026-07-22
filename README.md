# github-demo — a GitHub Flow task board

A small task board built with **vanilla HTML, CSS, and JavaScript** (no framework, no
build step). Its real purpose is to demonstrate the **GitHub Flow**: create a branch,
open a pull request, let CI check it, merge to `main`, and let CD deploy the result to
**GitHub Pages**.

## What the app does

- Add, complete, and delete tasks
- Filter by All / Active / Completed
- Persist tasks in the browser via `localStorage`

## Project layout

```
index.html                  App shell (loads src/app.js as an ES module)
src/
  taskStore.js              Pure, DOM-free task logic (unit-tested)
  app.js                    DOM wiring + localStorage (imports taskStore)
  styles.css                Styles
scripts/serve.mjs           Zero-dependency static server (local + E2E)
test/
  unit/taskStore.test.js    Unit tests (node:test)
  e2e/app.spec.js           End-to-end tests (Playwright)
.github/workflows/
  ci.yml                    CI: lint + unit tests + E2E, on every PR
  deploy.yml                CD: deploy to GitHub Pages, on push to main
```

The key design choice: **logic lives in `taskStore.js` as pure functions**, separate
from the DOM. That is what lets the unit tests run in milliseconds and keeps the CI
meaningful — a broken rule turns a pull request red before it can merge.

## Local development

Requires Node.js 20+.

```bash
npm install          # first time only; commit the generated package-lock.json
npm run serve        # open http://localhost:4173
npm test             # unit tests (node:test)
npm run lint         # eslint + prettier --check
npm run test:e2e     # Playwright E2E (installs a browser on first run)
```

If it is your first Playwright run locally:

```bash
npx playwright install chromium
```

## The GitHub Flow, step by step

1. **Create a branch** off `main`:
   ```bash
   git switch -c feature/add-due-dates
   ```
2. **Commit** your change on that branch.
3. **Open a pull request.** Opening (or updating) a PR triggers `ci.yml`, which runs
   three jobs in parallel: **Lint**, **Unit tests**, and **E2E**. The PR shows a green
   check when all pass, red when any fails.
4. **Review and merge.** Once CI is green and the change is reviewed, merge to `main`.
5. **Automatic deploy.** The push to `main` triggers `deploy.yml`, which publishes the
   site to GitHub Pages. The live URL appears in the workflow's `github-pages`
   environment.

## One-time GitHub setup

To make CI and Pages work after you push this repository:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. That is all Pages needs — `deploy.yml` handles the rest.
3. (Recommended, to teach the flow properly) **Settings → Branches → add a branch
   protection rule** for `main`: require a pull request and require the CI status
   checks to pass before merging. This is what makes the red/green check a real gate.

Once Pages is enabled and `main` has been deployed at least once, the app is live at:

```
https://rojoudotcom.github.io/github-demo/
```
