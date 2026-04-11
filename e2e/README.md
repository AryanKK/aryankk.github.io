# Playwright: GitHub Pages journeys

These tests start from the same URLs visitors use on [aryankk.github.io](https://aryankk.github.io), then exercise the StreaKit hosted demo and the Unloop documentation links from Showcase and Projects.

## What is modeled after what

| Source you use elsewhere | What we mirror here |
|--------------------------|---------------------|
| **StreaKit** `apps/demo` playground | After opening the demo from the site, we run **Record Activity**, **Freeze (2 days)**, **Unfreeze**, and assert **Current streak** and **State** text. |
| **Unloop** public distribution | There is **no** published macOS zip on `main` while disclaimers and packaging are prepared. We assert Showcase and Projects link to **docs/DISCLAIMER.md**, **docs/TESTING_DOWNLOADS.md**, **PRODUCT_BRIEF.md**, **PRIVACY_AND_SAFETY.md**, and **PUBLIC_REPO_POLICY.md** on [Unloop-Application](https://github.com/AryanKK/Unloop-Application). |

## Requirements

- **Node 20** + `npm ci`
- **Chromium** via `npx playwright install chromium`

## Run locally

```bash
python3 -m http.server 4174 --directory .
BASE_URL=http://127.0.0.1:4174 npm run test:e2e
```

Production smoke (after Pages deploy):

```bash
BASE_URL=https://aryankk.github.io npm run test:e2e
```
