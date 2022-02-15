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
severityKey  = "severity" ws
messageKey   = "message" ws
comparator   = "<=" / "=" / ">=" / ">" / "<"
modelReferenceStart = "${"
modelReferenceEnd = "}"

conceptRule = conceptRef:classifierReference curly_begin rules:rule* curly_end
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

ruleExtras = curly_begin severity:severity message:(comma_separator e:errormessage { return e; })? curly_end {
    return { "severity": severity, "message": message };
}
    / curly_begin message:errormessage severity:(comma_separator s:severity { return s; } )? curly_end {
    return { "severity": severity, "message": message };
}

severity = severityKey colon_separator value:var {
  return create.createSeverity( {
    "value": value,
    "location": location()
  });
}

errormessage = messageKey colon_separator "\"" content:messageContent "\"" {
  return create.createErrorMessage( {
    "content": content,
    "location": location()
  });
}

messageContent = head:messagePart tail:(" " v:messagePart { return v; })*
                     { return [head].concat(tail); }

messagePart = ref:modelReference { return ref; }
            / value:text {
    return create.createValidationMessageText({
      "value": value,
      "location": location()
    });
}

modelReference = modelReferenceStart ws exp:expression ws modelReferenceEnd {
    return create.createValidationMessageReference({
      "expression": exp,
      "location": location()
    });
}

text = chars:anythingBut+
            {
                return chars.join("");
            }

anythingBut = !(" ${") src:char
            {
                return src;
            }

validNameRule = validnameKey property:langExpression? ws extra:ruleExtras? {
  return create.createValidNameRule( {
    "property": property,
    "severity": (!!extra ? extra.severity : undefined),
    "message": (!!extra ? extra.message : undefined),
    "location": location()
  });
}

notEmptyRule = notEmptyKey property:langExpression ws extra:ruleExtras? {
  return create.createNotEmptyRule( {
    "property": property,
    "severity": (!!extra ? extra.severity : undefined),
    "message": (!!extra ? extra.message : undefined),
    "location": location()
  })
}

typeEqualsRule = typecheckKey "equalsType" round_begin type1:langExpression comma_separator type2:langExpression round_end extra:ruleExtras? {
  return create.createTypeEqualsRule( {
    "type1": type1,
    "type2": type2,
    "severity": (!!extra ? extra.severity : undefined),
    "message": (!!extra ? extra.message : undefined),
    "location": location()
  });
}

typeConformsRule = typecheckKey "conformsTo" round_begin type1:langExpression comma_separator type2:langExpression round_end extra:ruleExtras? {
  return create.createTypeConformsRule( {
    "type1": type1,
    "type2": type2,
    "severity": (!!extra ? extra.severity : undefined),
    "message": (!!extra ? extra.message : undefined),
    "location": location()
  });
}

expressionRule = exp1:langExpression ws comparator:comparator ws exp2:langExpression extra:ruleExtras? {
  return create.createExpressionRule( {
    "exp1": exp1,
    "exp2": exp2,
    "comparator": comparator,
    "severity": (!!extra ? extra.severity : undefined),
    "message": (!!extra ? extra.message : undefined),
    "location": location()
  });
}

isuniqueRule = isuniqueKey exp1:langExpression rws inKey exp2:langExpression extra:ruleExtras? {
  return create.createIsuniqueRule( {
    "listproperty": exp1,
    "list": exp2,
    "severity": (!!extra ? extra.severity : undefined),
    "message": (!!extra ? extra.message : undefined),
    "location": location()
  });
}
