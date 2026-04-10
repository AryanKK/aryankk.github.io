#!/usr/bin/env bash
# Refresh hosted StreaKit demo assets (same as refresh-streakit-demo.sh).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"${SCRIPT_DIR}/refresh-streakit-demo.sh"
