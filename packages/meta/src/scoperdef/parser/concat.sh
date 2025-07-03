#!/usr/bin/env bash

LANGDEV=../../languagedef/parser
LANGEXPDEV=../../langexpressions/parser

cat  ScoperGrammar.part.pegjs $LANGEXPDEV/ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > ScoperGrammar.pegjs
