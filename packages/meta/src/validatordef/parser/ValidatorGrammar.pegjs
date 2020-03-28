{
    let create = require("./ValidatorCreators");
    let expCreate = require("../../languagedef/parser/LanguageExpressionCreators"); 
}

Validator_Definition
  = ws "validator" ws validatorName:var ws "for" ws "language" ws languageName:var ws cr:(conceptRule)*
    {
        return create.createValidatorDef({
            "validatorName": validatorName,
            "languageName": languageName,
            "conceptRules": cr,
        });
    } 

validnameKey = "@validName" ws
typecheckKey = "@typecheck" ws
notEmptyKey = "@notEmpty" ws
thisKey = "this" ws

conceptRule = conceptRef:conceptRef ws curly_begin ws rules:rule* curly_end 
    { 
        return create.createConceptRule({ 
          "conceptRef": conceptRef, 
          "rules": rules,
        }); 
    }

conceptRef = name:var { return create.createConceptReference( { "name": name}); }

rule =  rule1: typeEqualsRule   { return rule1; }
      / rule2: typeConformsRule { return rule2; }
      / rule3: notEmptyRule     { return rule3; }
      / rule4: validNameRule    { return rule4; }

validNameRule = validnameKey property:langRefExpression? ws {
  return create.createValidNameRule( {
    "property": property
  });
}

notEmptyRule = notEmptyKey property:langRefExpression ws {
  return create.createNotEmptyRule( {
    "property": property
  })
}

typeEqualsRule = typecheckKey "equalsType" ws round_begin ws type1:langRefExpression ws comma_separator ws type2:langRefExpression ws round_end ws {
  return create.createTypeEqualsRule( {
    "type1": type1,
    "type2": type2,
  });
}

typeConformsRule = typecheckKey "conformsTo" ws round_begin ws type1:langRefExpression ws comma_separator ws type2:langRefExpression ws round_end ws {
  return create.createTypeConformsRule( {
    "type1": type1,
    "type2": type2,
  });
}

// the following are the parsing rules for the expressions over the language structure,
// as defined in meta/src/languagedef/metalanguage/PiLangExpressions.ts

langRefExpression = enumRefExpression:enumRefExpression    { return enumRefExpression; } 
                  / expression:expression                  { return expression; }
                  / functionExpression:functionExpression  { return functionExpression; }

enumRefExpression = sourceName:var ':' appliedfeature:var {
  return expCreate.createEnumReference ({
    "sourceName": sourceName,
    "appliedfeature": appliedfeature
  })
}

expression = sourceName:var appliedfeature:dotExpression {
  return expCreate.createExpression ({
    "sourceName": sourceName,
    "appliedfeature": appliedfeature
  })
}

functionExpression = sourceName:var round_begin actualparams:(
      head:langRefExpression
      tail:(comma_separator v:langRefExpression { return v; })*
      { return [head].concat(tail); }
    ) 
    round_end {
  return expCreate.createFunctionCall ({
    "sourceName": sourceName,
    "actualparams": actualparams
  })
}

dotExpression = '.' sourceName:var appliedfeature:dotExpression?  {
  return expCreate.createAppliedFeatureExp
( {
    "sourceName": sourceName,
    "appliedfeature": appliedfeature
  })
}

// the following is basic stuff 

curly_begin    = ws "{" ws 
curly_end      = ws "}" ws
round_begin    = ws "(" ws 
round_end      = ws ")" ws
comma_separator = ws "," ws
name_separator  = ws ":" ws

ws "whitespace" = (([ \t\n\r]) / (SingleLineComment))*

var "var"
  = first:varLetter rest:varLetterOrDigit* ws { return first + rest.join(""); }

string           = chars:anyChar* { return chars.join(""); }

varLetter           = [a-zA-Z]
varLetterOrDigit    = [a-zA-Z0-9]
anyChar             = [*a-zA-Z0-9'/\-[\]+<>=]

// van javascript example
SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*

LineTerminator
  = [\n\r\u2028\u2029]

SourceCharacter
  = .
  
// from JSOM example
char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\"

unescaped
  = [^\0-\x1F\x22\x5C]

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]
