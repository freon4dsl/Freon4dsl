#!/usr/bin/env bash

# Patch JS file generated from Peggy to use ESM mopdule syntax (import and export) instead of commonjs

cat LanguageGrammar.js | tail -r | tail -n +6 | tail -r > tmp.js
cat patch-import.txt tmp.js patch-export.txt > LanguageGrammar.js
