# Playwright: GitHub Pages to application journeys

These tests start from the same URLs visitors use on [aryankk.github.io](https://aryankk.github.io), then exercise the StreaKit hosted demo and the public Unloop macOS artifact.

## What is modeled after what

| Source you use elsewhere | What we mirror here |
|--------------------------|---------------------|
| **StreaKit** `apps/demo` playground | After opening the demo from the site, we run **Record Activity**, **Freeze (2 days)**, **Unfreeze**, and assert **Current streak** and **State** text. That parallels a short StreaKit user-journey pass on the real SDK UI (localStorage-backed). |
| **Unloop proto1** `tmp_unloop_v2_page_smoke.cjs` | That script hits **localhost:1420** and walks nav + quickstart; we cannot run the `.app` on Linux CI. Instead we validate the **public distribution funnel**: links on this site point at `raw.githubusercontent.com/.../unloop-desktop-macos-test.zip`, SHA-256 matches `downloads/manifest.json`, and `unzip -l` shows `unloop_desktop_proto1.app` per `docs/TESTING_DOWNLOADS.md`. |
| **Unloop** archive Playwright reports (TIC/ANX journeys) | Those are full product flows inside the desktop shell. This repo only asserts you can **download the same artifact** the docs describe and that the archive **contains the bundle name** you install locally. |

## Requirements

- **Node 20** + `npm ci`
- **Chromium** via `npx playwright install chromium`
- **`unzip`** on `PATH` (preinstalled on `ubuntu-latest`; macOS has it)

## Run locally

```bash
python3 -m http.server 4174 --directory .
BASE_URL=http://127.0.0.1:4174 npm run test:e2e
```

Production smoke (after Pages deploy):

```bash
BASE_URL=https://aryankk.github.io npm run test:e2e
```
