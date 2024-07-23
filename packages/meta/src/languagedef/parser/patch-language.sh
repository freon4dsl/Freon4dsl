#!/usr/bin/env bash

# Patch JS file generated from Peggy to use ESM mopdule syntax (import and export) instead of commonjs

LINES=$(wc -l <LanguageGrammar.js)
LAST_KEEP_LINE=$((LINES-6))
head -n $LAST_KEEP_LINE LanguageGrammar.js > tmp.js
#cat LanguageGrammar.js | tail -r | tail -n +6 | tail -r > tmp.js

cat patch-import.txt tmp.js patch-export.txt > LanguageGrammar.js
