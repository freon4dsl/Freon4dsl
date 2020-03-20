{
    let create = require("./PiTyperCreators");
}

Typer_Definition
  = ws "typer" ws name:var ws "for" ws "language" ws languageName:var ws tr:(typeRule)*
    {
//        return create.createTyperDef({
//            "name": name,
//            "languageName": languageName,
//            "typeRules": tr,
//        });
    } 

isTypeKey     = "@isType" ws
inferenceKey  = "@inferType" ws
conformsKey   = "@conformsTo" ws
equalsKey     = "@equalsType" ws
allKey        = "@all" ws
typeOfKey     = "typeOf" ws
superTypeKey  = "commonSuperType" ws
abstractKey   = "abstract" ws { return true; }
thisKey       = "this" ws
trueKey       = "true" ws
falseKey      = "false" ws

typeRule =  infr:inferenceRule { return infr; }
          / itr: isTypeRule { return itr }
          / cfr: conformanceRule { return cfr; }
          / eqr: equalsRule { return eqr; }

inferenceRule = conceptRef:conceptRef ws abs:abstractKey? inferenceKey property:calculation? 
    { 
//        return create.createInferenceRule({ 
//          "conceptRef": conceptRef, 
//          "propertyRef": propertyRef,
//          "isAbstract": (!!abs)
//         }); 
    }

calculation = 
              typeOfKey round_begin ws xx:langRefExpression ws round_end
            / superTypeKey round_begin ws xx:langRefExpression ws comma_separator ws yy:langRefExpression round_end  
            / property:langRefExpression? 

conceptRef = name:var { return create.createConceptReference( { "name": name}); }

isTypeRule = isTypeKey curly_begin ws type1:conceptRef ws (comma_separator ws types:conceptRef)* ws curly_end {
//  return create.createIsTypeRule( {
//    "type1": type1
//    "types": types
//  });
}

conformanceRule = conformsKey round_begin ws type1:allOrRef ws comma_separator ws type2:allOrRef ws round_end ws 
            ws equals_separator (t:trueKey / f:falseKey) 
{
//  return create.createConformanceRule( {
//    "type1": type1,
//    "type2": type2,
//    "value": (!!t)
//  });
}

equalsRule = equalsKey round_begin ws type1:allOrRef ws comma_separator ws type2:allOrRef ws round_end 
            ws equals_separator (t:trueKey / f:falseKey) 
{
//  return create.createTypeEqualsRule( {
//    "type1": type1,
//    "type2": type2,
//    "value": (!!t)
//  });
}

allOrRef = isTypeKey appliedFeature:dotExpression? 
          / allKey {
            //return create.createAllTypesRef();
            }
          / ref:langRefExpression {return ref;}

// the following are equal to the parsing rules for the validator

langRefExpression = enumRefExpression:enumRefExpression { return enumRefExpression; } 
                  / thisExpression:thisExpression       { return thisExpression; }

enumRefExpression = sourceName:var ':' literalName:var {
  return create.createEnumReference ({
    "sourceName": sourceName,
    "literalName": literalName
  })
}

thisExpression = sourceName:var appliedFeature:dotExpression {
  return create.createThisExpression ({
    "sourceName": sourceName,
    "appliedFeature": appliedFeature
  })
}

dotExpression = '.' sourceName:var appliedFeature:dotExpression?  {
  return create.createPropertyRefExpression
( {
    "sourceName": sourceName,
    "appliedFeature": appliedFeature
  })
}

// the following is basic stuff 

curly_begin    = ws "{" ws 
curly_end      = ws "}" ws
round_begin    = ws "(" ws 
round_end      = ws ")" ws
comma_separator = ws "," ws
name_separator  = ws ":" ws
equals_separator  = ws "=" ws

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
