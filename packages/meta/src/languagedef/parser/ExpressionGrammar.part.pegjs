// These are the parsing rules for the expressions over the language structure,
// as defined in meta/src/languagedef/metalanguage/PiLangExpressions.ts
// They are not meant to be used separately, they should be used in the parser for 
// projectIt parts that use the language expressions.
// Because they are common they are developed and tested separately, together with the
// creator functions in LanguageExpressionCreators.ts.

// the following rules should be part of a parser that wants to use PiLangExpressions.ts

classifierReference = referredName:var
{
    return expCreate.createClassifierReference({"name": referredName, "location": location()})
}

langExpression = functionExpression:functionExpression  { return functionExpression; }
               / instanceExpression:instanceExpression  { return instanceExpression; }
               / expression:expression                  { return expression; }
               / simpleExpression:simpleExpression      { return simpleExpression; }

instanceExpression = conceptName:var ':' instance:var
    {
        return expCreate.createInstanceExp ({
            "sourceName": conceptName,
            "instanceName": instance,
            "location": location()
        })
    }

expression = sourceName:var appliedfeature:dotExpression
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
    )?
    round_end {
  return expCreate.createFunctionCall ({
    "sourceName": sourceName,
    "actualparams": actualparams,
    "location": location()
  })
}

simpleExpression = number:numberliteral {
    return expCreate.createSimpleExpression
( {
    "value": !isNaN(parseInt(number, 10)) ? parseInt(number, 10) : 0, // the default for parseInt is not (!) the decimal system
    "location": location()
  })
}



