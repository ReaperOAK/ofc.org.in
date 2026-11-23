#!/usr/bin/env bash
# Run all static quality gates against the built site.
# Usage: ./scripts/audit.sh
set -euo pipefail

PAGES=("/" "/consultancy" "/case-studies" "/about" "/contact")

echo "== Contrast gate =="
python3 scripts/contrast-check.py

echo
echo "== Build =="
npm run build

echo
echo "== Structure checks =="
for page in "${PAGES[@]}"; do
  if [ "$page" = "/" ]; then
    file="dist/index.html"
  else
    file="dist${page}/index.html"
  fi

  if [ ! -f "$file" ]; then
    echo "FAIL  $page did not build ($file missing)"
    exit 1
  fi

  h1_count=$(grep -o '<h1' "$file" | wc -l | tr -d ' ')
  if [ "$h1_count" -ne 1 ]; then
    echo "FAIL  $page has $h1_count <h1> elements (must be exactly 1)"
    exit 1
  fi

  grep -q 'Skip to main content' "$file" || { echo "FAIL  $page missing skip link"; exit 1; }
  grep -q '<main' "$file" || { echo "FAIL  $page missing <main> landmark"; exit 1; }

  echo "PASS  $page"
done

echo
echo "All static gates passed. Now run Lighthouse against the preview server."
