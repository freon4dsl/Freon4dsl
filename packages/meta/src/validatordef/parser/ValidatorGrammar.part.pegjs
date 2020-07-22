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
typecheckKey = "typecheck" rws
notEmptyKey  = "notEmpty" rws
isuniqueKey  = "isunique" rws
inKey        = "in" rws
comparator   = "<=" / "=" / ">=" / ">" / "<"

conceptRule = conceptRef:conceptRef curly_begin rules:rule* curly_end
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
      / rule6: isuniqueRule     semicolon_separator { return rule6; }

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

typeEqualsRule = typecheckKey "equalsType" round_begin type1:langExpression comma_separator type2:langExpression round_end {
  return create.createTypeEqualsRule( {
    "type1": type1,
    "type2": type2,
    "location": location()
  });
}

typeConformsRule = typecheckKey "conformsTo" round_begin type1:langExpression comma_separator type2:langExpression round_end {
  return create.createTypeConformsRule( {
    "type1": type1,
    "type2": type2,
    "location": location()
  });
}

expressionRule = exp1:langExpression comparator:comparator exp2:langExpression {
  return create.createExpressionRule( {
    "exp1": exp1,
    "exp2": exp2,
    "comparator": comparator,
    "location": location()
  });
}

isuniqueRule = isuniqueKey exp1:langExpression rws inKey exp2:langExpression {
  return create.createIsuniqueRule( {
    "listproperty": exp1,
    "list": exp2,
    "location": location()
  });
}
