#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# SAFE FILENAME LOOP
#
# This loop reads filenames safely from the `find ... -print0` command below.
# The construction:
#
#   while IFS= read -r -d '' file; do
#
# is the POSIX-portable, safe way to iterate over files. Each part has a purpose:
#
#   IFS=        → prevents trimming or splitting on whitespace
#   read -r     → prevents backslash escaping (reads raw filenames)
#   -d ''       → read until NUL byte (0x00) instead of newline
#
# `find` with -print0 produces filenames separated by NUL bytes, not newlines,
# which guarantees correct handling of filenames containing:
#   - spaces
#   - tabs
#   - quotes
#   - newlines
#   - any other special characters
#
# Process substitution:
#
#   done < <(find ... -print0)
#
# runs the find command and feeds its NUL-terminated output directly into
# the while-loop via standard input.
#
# In summary:
#   - `find ... -print0` outputs safe NUL-terminated filenames
#   - `read -d ''` reads one full filename per iteration
#   - No filename can be split or corrupted
#
# This is the most reliable, cross-platform way to loop over filesystem paths
# in Bash (Linux, macOS, Windows Git Bash).
# ---------------------------------------------------------------------------


# Optional argument: root folder to scan (default = current dir)
ROOT_DIR="${1:-.}"

echo "Collecting .ts and .svelte files (excluding .d.ts and node_modules)..."

# Build the 'find' command once for counting
total_files=$(
  find "$ROOT_DIR" \
    -type d -name node_modules -prune -o \
    -type f \( -name '*.ts' -o -name '*.svelte' \) ! -name '*.d.ts' -print \
    | wc -l \
    | tr -d ' '
)

if [ "$total_files" -eq 0 ]; then
  echo "No .ts or .svelte files found. Nothing to do."
  exit 0
fi

bad_files=()
count=0

# Actual scan (null-separated for safety)
while IFS= read -r -d '' file; do
  count=$((count + 1))

  # Progress indicator
  if (( count % 100 == 0 )) || (( count == total_files )); then
    echo "Processed $count / $total_files files..."
  fi

  # 1. import/export lines
  # 2. with relative path ./, ../, or /
  # 3. that do NOT end in .js
  # 4. ignoring @freon4dsl/core, @freon4dsl/core-svelte, mobx, and vitest
if grep -E '^[[:space:]]*(import\b|export\b.*from\b)' "$file" \
  | grep -E '[\"'\'' ](\./|\../|/)' \
  | grep -Ev '\.(js|svelte)["'\'']' \
  | grep -Ev '@freon4dsl/core(-svelte)?|@freon4dsl/test-helpers|mobx|vitest' \
  > /dev/null
then
  bad_files+=("$file")
fi

done < <(find "$ROOT_DIR" \
           -type d -name node_modules -prune -o \
           -type f \( -name '*.ts' -o -name '*.svelte' \) ! -name '*.d.ts' -print0)

echo
echo "Scan complete."

if ((${#bad_files[@]})); then
  echo "❌ Found files with incorrect relative imports:"
  printf '%s\n' "${bad_files[@]}" | sort -u
  echo
else
  echo "============================================================"
  echo "🎉  ALL CLEAR — No incorrect imports were found.  ✔️💚"
  echo "============================================================"
fi

