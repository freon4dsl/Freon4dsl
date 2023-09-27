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
rm -rf Freon-template
git clone https://github.com/freon4dsl/Freon-template.git
cd Freon-template
git checkout 0.6.0-beta.1
yarn install --registry http://localhost:4873
yarn generate
yarn build
yarn prepare-app
yarn model-server &
yarn dev
