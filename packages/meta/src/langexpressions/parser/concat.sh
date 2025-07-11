#!/usr/bin/env bash

LANGDEV=../../languagedef/parser

cat  ExpressionGrammar.part.header.pegjs ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > ExpressionGrammar.pegjs
