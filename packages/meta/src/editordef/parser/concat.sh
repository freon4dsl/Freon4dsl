#!/usr/bin/env bash

LANGDEV=../../languagedef/parser

cat  PiEditGrammar.part.pegjs $LANGDEV/ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > PiEditGrammar.pegjs
