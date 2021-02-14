#!/usr/bin/env bash

cat  LanguageGrammar.part.pegjs BasicGrammar.part.pegjs > LanguageGrammar.pegjs
cat  ExpressionGrammar.part.header.pegjs ExpressionGrammar.part.pegjs BasicGrammar.part.pegjs > ExpressionGrammar.pegjs
