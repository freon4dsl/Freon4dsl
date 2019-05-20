#!/usr/bin/env bash
echo LOG cd
cd packages/tools/antora-preprocess/src
echo LOG Run Fix
ts-node FixIncludes -d ../../../docs/component-main/modules/projectit-main/pages/ -e ../../../docs/component-main/modules/projectit-main/examples/
echo LOG cd docs
cd ../../../../packages/docs
echo LOG run antora
antora --attribute demodir=example\$ site.yml

