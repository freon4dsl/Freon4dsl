// These are the parsing rules for the expressions over the language structure,
// as defined in meta/src/langexpressions/metalanguage/FreLangExpressions.ts
// They are not meant to be used separately, they should be used in the parser for 
// freon parts that use the language expressions.
// Because they are common they are developed and tested separately, together with the
// creator functions in LanguageExpressionCreators.ts.

// the following rules should be part of a parser that wants to use FreLangExpressions.ts

classifierReference = referredName:var
{
    return expCreate.createClassifierReference({"name": referredName, "location": location()})
}

langExpression = exp:appliedExpression {return exp;}
      / exp:instanceExpression {return exp;}
      / exp:simpleExpression {return exp;}

appliedExpression = name:var ws '(' ws param:langExpression? ws ')' ws applied:dotExpression?
{
    return expCreate.createFunctionExpression({
        "name": name,
        "param": param,
        "applied": applied,
        "location": location()
    })
}
/ name:var applied:dotExpression?
{
    return expCreate.createVarExpression({
        "name": name,
        "applied": applied,
        "location": location()
    })
}

dotExpression = ws '.' ws exp:appliedExpression
{
    return exp;
}

instanceExpression = '#'conceptName:var ':' instance:var
    {
        return expCreate.createLimitedInstanceExp ({
            "conceptName": conceptName,
            "instanceName": instance,
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



