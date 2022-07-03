#!/usr/bin/env bash
set -e

# start vedaccio as local npm registry in the background
# If it is already running it will fail to start, that is ok
verdaccio &

# publish projectit
lerna run build-release
lerna run unpublish-local
lerna run publish-local

# checkout and build example project
mkdir -p ../tmp
cd ../tmp
rm -rf ProjectIt-example
git clone https://github.com/projectit-org/ProjectIt-example.git
cd ProjectIt-example
git checkout release-0.4.4-preparation
yarn install-local
yarn generate
# yarn build
yarn model-server &
yarn prepare-app
yarn dev
