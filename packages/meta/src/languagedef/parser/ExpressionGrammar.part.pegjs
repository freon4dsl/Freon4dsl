// These are the parsing rules for the expressions over the language structure,
// as defined in meta/src/languagedef/metalanguage/PiLangExpressions.ts
// They are not meant to be used separately, they should be used in the parser for 
// projectIt parts that use the language expressions.
// Because they are common they are developed and tested separately, together with the
// creator functions in LanguageExpressionCreators.ts.

LanguageExpressions_Definition
  = ws "expressions" ws "for" ws "language" ws languageName:var ws cr:(conceptExps)*
    {
        return expCreate.createTest({
            "languageName": languageName,
            "conceptExps": cr,
            "location": location()
        });
    } 

conceptExps = conceptRef:conceptRef ws curly_begin ws exps:expWithSeparator* curly_end 
    { 
        return expCreate.createConceptExps({ 
          "conceptRef": conceptRef, 
          "exps": exps,
          "location": location()
        }); 
    }


expWithSeparator = exp:langExpression semicolon_separator { return exp; }

// the following rules should be part of a parser that wants to use PiLangExpressions.ts

conceptRef = name:var { return expCreate.createConceptReference( { "name": name, "location":location()}); }

langExpression = functionExpression:functionExpression  { return functionExpression; }
                  / expression:expression                  { return expression; }

expression = sourceName:var ':' literal:var  {
                                                return expCreate.createEnumReference ({
                                                  "sourceName": sourceName,
                                                  "appliedfeature": literal,
                                                  "location": location()
                                                })
                                              }
            / sourceName:var appliedfeature:dotExpression
            {
                return expCreate.createExpression ({
                    "sourceName": sourceName,
                    "appliedfeature": appliedfeature,
                    "location": location()
                })
            }
            / sourceName:var
            {
                return expCreate.createExpression ({
                    "sourceName": sourceName,
                    "location": location()
                })
            }

dotExpression = '.' sourceName:var appliedfeature:dotExpression?  {
  return expCreate.createAppliedFeatureExp
( {
    "sourceName": sourceName,
    "appliedfeature": appliedfeature,
    "location": location()
  })
}

functionExpression = sourceName:var round_begin actualparams:(
      head:langExpression
      tail:(comma_separator v:langExpression { return v; })*
      { return [head].concat(tail); }
    )
    round_end {
  return expCreate.createFunctionCall ({
    "sourceName": sourceName,
    "actualparams": actualparams,
    "location": location()
  })
}


