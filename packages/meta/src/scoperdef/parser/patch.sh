#!/usr/bin/env bash

# Patch JS file generated from Peggy to use ESM mopdule syntax (import and export) instead of commonjs


LINES=$(wc -l <ScoperGrammar.js)
LAST_KEEP_LINE=$((LINES-6))
head -n $LAST_KEEP_LINE ScoperGrammar.js > tmp.js
#cat ScoperGrammar.js | tail -r | tail -n +6 | tail -r > tmp.js
cat patch-import.txt tmp.js patch-export.txt > ScoperGrammar.js
