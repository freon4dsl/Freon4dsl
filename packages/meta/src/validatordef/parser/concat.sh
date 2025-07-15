#!/usr/bin/env bash

LANGDEV=../../languagedef/parser
LANGEXPDEV=../../langexpressions/parser

cat  ValidatorGrammar.part.pegjs $LANGEXPDEV/ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > ValidatorGrammar.pegjs
