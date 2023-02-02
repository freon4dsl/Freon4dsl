#!/usr/bin/env bash
set -e

# start vedaccio as local npm registry in the background
# If it is already running it will fail to start, that is ok
verdaccio &

# publish freon
lerna run build-release
lerna run unpublish-local
lerna run publish-local

# checkout and build example project
mkdir -p ../tmp
cd ../tmp
rm -rf Freon-example
git clone https://github.com/freon4dsl/Freon-example.git
cd Freon-example
git checkout release-0.5.0-preparation
yarn install-local
yarn generate
# yarn build
yarn model-server &
yarn prepare-app
yarn dev
