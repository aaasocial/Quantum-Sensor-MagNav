#!/usr/bin/env bash
# Build dist/qollab-capture-py.zip: the Forte 1 capture Python project (QS-05).
#   main.py (from capture/main.py), magnav/{__init__,quantum,qjob}.py, data/circuit_freeze.json,
#   requirements.txt, LICENSE, README.md. Never index.html/main.js: it must run as a Python project.
# Uploading this zip to an unpublished Qollab project is allowed; running it on the IonQ hardware
# backend needs Eason's explicit in-session approval (CLAUDE.md submission approval gate).
set -euo pipefail

cd "$(dirname "$0")/.."

MAX_FILES=100
MAX_BYTES=2097152      # 2 MB per file
MAX_README_CHARS=65000
ZIP=dist/qollab-capture-py.zip
FORBIDDEN='__pycache__|\.DS_Store|node_modules|\.env|\.venv|\.planning|web/|credentials|\.pem$|\.key$|id_rsa|\.npmrc|\.netrc'
# Content scan (lifted from the sister packager). Keyword assignments are case-insensitive; key shapes are exact.
SECRET_ASSIGN='(api[_-]?key|access[_-]?key|secret[_-]?key|client[_-]?secret|auth[_-]?token|access[_-]?token|token|secret|passw(or)?d)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"'[:space:]]{8,}'
SECRET_SHAPES='AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,}|xox[abprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'

fail() { echo "FAIL: $*" >&2; exit 1; }

if [ ! -f requirements.txt ]; then
  echo "qiskit>=2.5.2,<3.0.0" > requirements.txt
fi

SOURCES=(capture/main.py magnav/__init__.py magnav/quantum.py magnav/qjob.py data/circuit_freeze.json requirements.txt LICENSE README.md)

for f in "${SOURCES[@]}"; do
  [ -f "$f" ] || fail "allowlisted file missing: $f"
  size=$(wc -c < "$f" | tr -d ' ')
  [ "$size" -lt "$MAX_BYTES" ] || fail "$f is $size bytes (limit < $MAX_BYTES)"
done
chars=$(wc -m < README.md | tr -d ' ')
[ "$chars" -lt "$MAX_README_CHARS" ] || fail "README.md has $chars characters (limit < $MAX_README_CHARS)"

hits=$( { grep -nIiE -- "$SECRET_ASSIGN" "${SOURCES[@]}" || true; grep -nIE -- "$SECRET_SHAPES" "${SOURCES[@]}" || true; } | cut -c1-200)
if [ -n "$hits" ]; then
  printf '%s\n' "$hits" >&2
  fail "possible secret in files to be zipped (see matches above)"
fi

STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$STAGE/magnav" "$STAGE/data"
cp capture/main.py "$STAGE/main.py"
cp magnav/__init__.py magnav/quantum.py magnav/qjob.py "$STAGE/magnav/"
cp data/circuit_freeze.json "$STAGE/data/"
cp requirements.txt LICENSE README.md "$STAGE/"

mkdir -p dist
rm -f "$ZIP"
OUT="$(pwd)/$ZIP"
(cd "$STAGE" && zip -X -q -r "$OUT" main.py magnav data requirements.txt LICENSE README.md)

listing=$(zipinfo -1 "$ZIP")
count=$(printf '%s\n' "$listing" | grep -c . || true)
[ "$count" -le "$MAX_FILES" ] || fail "$ZIP has $count entries (limit $MAX_FILES)"
if printf '%s\n' "$listing" | grep -qE "$FORBIDDEN"; then
  printf '%s\n' "$listing" | grep -E "$FORBIDDEN" >&2
  fail "$ZIP contains forbidden entries (pattern: $FORBIDDEN)"
fi

# Exact, literal match. No -q: an early grep exit would SIGPIPE zipinfo and trip pipefail.
has_entry() { zipinfo -1 "$1" | grep -xF -- "$2" >/dev/null; }
for f in main.py magnav/__init__.py magnav/quantum.py magnav/qjob.py data/circuit_freeze.json; do
  has_entry "$ZIP" "$f" || fail "$ZIP is missing $f"
done
for f in index.html main.js main.css; do
  if has_entry "$ZIP" "$f"; then
    fail "$ZIP must not contain $f (it would run as a JS project)"
  fi
done

echo "== $ZIP ($count entries)"
printf '%s\n' "$listing"
ls -l "$ZIP"
echo "OK: $ZIP ready (Python-project capture script)"
