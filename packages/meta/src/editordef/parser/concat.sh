#!/usr/bin/env bash

LANGDEV=../../languagedef/parser

cat  FreEditGrammar.part.pegjs $LANGDEV/ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > FreEditGrammar.pegjs
