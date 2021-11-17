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
rm -rf ProjectIt-template
git clone https://github.com/projectit-org/ProjectIt-template.git
cd ProjectIt-template
git checkout prepare-0.2.0
yarn install --registry http://localhost:4873
yarn generate
yarn build
yarn model-server &
yarn dev
