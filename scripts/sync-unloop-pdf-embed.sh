#!/usr/bin/env bash
# Refresh the local copy of the public Unloop product overview PDF used for same-origin iframe preview.
# (raw.githubusercontent.com sets X-Frame-Options: deny, so the site cannot embed the PDF cross-origin.)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${ROOT}/embeds/unloop-product-overview.pdf"
URL="${UNLOOP_PDF_URL:-https://raw.githubusercontent.com/AryanKK/Unloop-Application/main/assets/Unloop_V2_Product_Overview.pdf}"

mkdir -p "$(dirname "${OUT}")"
echo "Downloading PDF…"
curl -sSL -o "${OUT}" "${URL}"
echo "Wrote ${OUT}"
