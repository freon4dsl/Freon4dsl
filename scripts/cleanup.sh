#!/usr/bin/env bash
# set -e

rm -f $(find ./src -name "*.d.ts" -type f)
rm -f $(find ./src -name "*.d.ts.map" -type f)
rm -f $(find ./src -name "*.js.map" -type f)
rm -f $(find ./src -name "*.js" -type f)
rm -rf dist
rm -rf node_modules
