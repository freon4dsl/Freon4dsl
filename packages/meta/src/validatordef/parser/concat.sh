#!/usr/bin/env bash

LANGDEV=../../languagedef/parser

cat  ValidatorGrammar.part.pegjs $LANGDEV/ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > ValidatorGrammar.pegjs
