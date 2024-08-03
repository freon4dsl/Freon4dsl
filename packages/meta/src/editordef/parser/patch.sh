#!/usr/bin/env bash

# Patch JS file generated from Peggy to use ESM module syntax (import and export) instead of commonjs

LINES=$(wc -l <FreEditGrammar.js)
LAST_KEEP_LINE=$((LINES-6))
head -n $LAST_KEEP_LINE FreEditGrammar.js > tmp.js
#cat FreEditGrammar.js | tail -r | tail -n +6 | tail -r > tmp.js
cat patch-import.txt tmp.js patch-export.txt > FreEditGrammar.js
