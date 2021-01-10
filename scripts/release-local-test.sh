#!/usr/bin/env bash

# start vedaccio as local npm registry in the background
# If it is already running it will fail to start, that is ok
verdaccio &

# publish projectit
lerna run build-release
lerna run unpublish-local
lerna run publish-local

# checkout and build example project
mkdir ../tmp
cd ../tmp
rm -rf ProjectIt-example
git clone https://github.com/projectit-org/ProjectIt-example.git
cd ProjectIt-example
git checkout release-0.1.0-preparation
yarn install --registry http://localhost:4873
yarn generate
yarn build
