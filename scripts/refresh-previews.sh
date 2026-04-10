#!/usr/bin/env bash
# Refresh all preview assets shipped with this site (StreaKit demo build + mirrored Unloop PDF).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"${SCRIPT_DIR}/sync-unloop-pdf-embed.sh"
"${SCRIPT_DIR}/refresh-streakit-demo.sh"
