#!/usr/bin/env bash

# Patch JS file generated from Peggy to use ESM mopdule syntax (import and export) instead of commonjs

cat ExpressionGrammar.js | tail -r | tail -n +6 | tail -r > etmp.js
cat patch-expression-import.txt etmp.js patch-expression-export.txt > ExpressionGrammar.js
