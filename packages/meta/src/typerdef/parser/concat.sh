#!/usr/bin/env bash

LANGDEV=../../languagedef/parser

cat  PiTyperGrammar.part.pegjs $LANGDEV/ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > PiTyperGrammar.pegjs
