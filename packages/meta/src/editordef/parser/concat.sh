#!/usr/bin/env bash

LANGDEV=../../languagedef/parser

cat  EditorGrammar.part.pegjs $LANGDEV/ExpressionGrammar.part.pegjs $LANGDEV/BasicGrammar.part.pegjs > EditorGrammar.pegjs
