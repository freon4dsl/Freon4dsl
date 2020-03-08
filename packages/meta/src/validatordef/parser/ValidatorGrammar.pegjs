{
    let create = require("./ValidatorCreators");
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

// TODO order of different kind of rules is set, these should be mixable
conceptRule = conceptRef:conceptRef ws curly_begin ws validname:validnameKey? ws typeRules:typeRule* ws notEmptyRules:notEmptyRule* curly_end 
    { 
        return create.createConceptRule({ 
          "conceptRef": conceptRef, 
          "validNameRule": !!validname,
          "typeRules": typeRules,
          "notEmptyRules": notEmptyRules
        }); 
    }

conceptRef = name:var { return create.createConceptReference( { "name": name}); }

notEmptyRule = notEmptyKey ws partRef:var ws {
  return create.createNotEmpty( {
    "property": partRef
  })
}

typeRule = rule1:typeEqualsRule { return rule1; }
          / rule2: typeConformsRule { return rule2; }

typeEqualsRule = typecheckKey "equalsType" ws round_begin ws type1:typeRef ws comma_separator ws type2:typeRef ws round_end ws {
  return create.createTypeEqualsRule( {
    "type1": type1,
    "type2": type2,
  });
}

typeConformsRule = typecheckKey "conformsTo" ws round_begin ws type1:typeRef ws comma_separator ws type2:typeRef ws round_end ws {
  return create.createTypeConformsRule( {
    "type1": type1,
    "type2": type2,
  });
}

optionalPartName = SourceCharacter partName:conceptRef  {
  return partName;
} 

typeRef = sourceName:conceptRef ws partName:optionalPartName?  {
  return create.createTypeReference( {
    "sourceName": sourceName,
    "partName": partName
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
