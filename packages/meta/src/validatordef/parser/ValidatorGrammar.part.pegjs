{
    let create = require("./ValidatorCreators");
    let expCreate = require("../../languagedef/parser/ExpressionCreators");
}

Validator_Definition
  = ws "validator" ws validatorName:var ws "for" ws "language" ws languageName:var ws cr:(conceptRule)*
    {
        return create.createValidatorDef({
            "validatorName": validatorName,
            "languageName": languageName,
            "conceptRules": cr,
            "location": location()
        });
    } 

validnameKey = "validIdentifier" ws
typecheckKey = "typecheck" ws
notEmptyKey = "notEmpty" ws
thisKey = "this" ws
comparator = "<=" / "=" / ">=" / ">" / "<"

conceptRule = conceptRef:conceptRef ws curly_begin ws rules:rule* curly_end 
    { 
        return create.createConceptRule({ 
          "conceptRef": conceptRef, 
          "rules": rules,
          "location": location()
        }); 
    }

rule =  rule1: typeEqualsRule   semicolon_separator { return rule1; }
      / rule2: typeConformsRule semicolon_separator { return rule2; }
      / rule3: notEmptyRule     semicolon_separator { return rule3; }
      / rule4: validNameRule    semicolon_separator { return rule4; }
      / rule5: expressionRule   semicolon_separator { return rule5; }

validNameRule = validnameKey property:langExpression? ws {
  return create.createValidNameRule( {
    "property": property,
    "location": location()
  });
}

notEmptyRule = notEmptyKey property:langExpression ws {
  return create.createNotEmptyRule( {
    "property": property,
    "location": location()
  })
}

typeEqualsRule = typecheckKey "equalsType" ws round_begin ws type1:langExpression ws comma_separator ws type2:langExpression ws round_end ws {
  return create.createTypeEqualsRule( {
    "type1": type1,
    "type2": type2,
    "location": location()
  });
}

typeConformsRule = typecheckKey "conformsTo" ws round_begin ws type1:langExpression ws comma_separator ws type2:langExpression ws round_end ws {
  return create.createTypeConformsRule( {
    "type1": type1,
    "type2": type2,
    "location": location()
  });
}

expressionRule = exp1:langExpression ws comparator:comparator ws exp2:langExpression {
  return create.createExpressionRule( {
    "exp1": exp1,
    "exp2": exp2,
    "comparator": comparator,
    "location": location()
  });
}

