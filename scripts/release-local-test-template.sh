#!/usr/bin/env bash
set -e

# start vedaccio as local npm registry in the background
# If it is already running it will fail to start, that is ok
verdaccio &

# publish freon
npm run build-release
npm run unpublish-local
npm run publish-local

# checkout and build example project
mkdir -p ../tmp
cd ../tmp
rm -rf Freon-template
git clone https://github.com/freon4dsl/Freon-template.git
cd Freon-template
git checkout 0.6.0
npm install --registry http://localhost:4873
npm run generate
npm run build
npm run prepare-app
npm run model-server &
npm run dev
