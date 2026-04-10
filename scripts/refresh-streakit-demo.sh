#!/usr/bin/env bash
# Rebuild @streakit/demo from StreaKit-Dev-Kit and copy into this site's streakit-demo/ folder.
# Requires: git, Node (for corepack/pnpm), network for pnpm install.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${ROOT}/streakit-demo"
REPO="${STREAKIT_REPO:-https://github.com/AryanKK/StreaKit-Dev-Kit.git}"
REF="${STREAKIT_REF:-main}"
TMP="${TMPDIR:-/tmp}/streakit-dev-kit-build-$$"

cleanup() {
  rm -rf "${TMP}"
}
trap cleanup EXIT

echo "Cloning ${REPO} (${REF})…"
git clone --depth 1 --branch "${REF}" "${REPO}" "${TMP}"

cd "${TMP}"

if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@9.15.4 --activate >/dev/null 2>&1 || true
fi

echo "pnpm install…"
pnpm install

echo "Building workspace (core + demo deps)…"
pnpm -r build

echo "Building demo for GitHub Pages base /streakit-demo/…"
pnpm --filter @streakit/demo exec vite build --base=/streakit-demo/

echo "Copying to ${DEST}…"
rm -rf "${DEST}"
mkdir -p "${DEST}"
cp -R "${TMP}/apps/demo/dist/"* "${DEST}/"

echo "Done. Commit streakit-demo/ and push to update the live site."
