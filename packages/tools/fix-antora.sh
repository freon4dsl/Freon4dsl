#!/usr/bin/env bash
cd packages/tools/antora-preprocess/src
ts-node FixIncludes -d ../../../../projectit-doc/component-main/modules/projectit-main/pages/ -e ../../../../projectit-doc/component-main/modules/projectit-main/examples/
cd ../../../../projectit-doc
antora --attribute demodir=example\$ site.yml

