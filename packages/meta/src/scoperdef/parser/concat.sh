#!/usr/bin/env bash

LANGDEV=../../languagedef/parser

cat  ScoperGrammar.part.pegjs $LANGDEV/ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > ScoperGrammar.pegjs
