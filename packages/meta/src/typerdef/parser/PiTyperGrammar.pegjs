{
    let create = require("./PiTyperCreators");
    let expCreate = require("../../languagedef/parser/LanguageExpressionCreators");
}

Typer_Definition
  = ws "typer" ws name:var ws "for" ws "language" ws languageName:var ws tr:(typerRule)*
    {
       return create.createTyperDef({
           "name": name,
           "languageName": languageName,
           "typerRules": tr,
       });
    } 

isTypeKey     = "@isType" ws
//aTypeKey      = "@anyType" ws { return true; }
inferenceKey  = "@inferType" ws
conformsKey   = "@conformsTo" ws
equalsKey     = "@equalsType" ws
allKey        = "@anyType" ws { return true; }
typeOfKey     = "typeOf" ws
superTypeKey  = "commonSuperType" ws
abstractKey   = "abstract" ws { return true; }
thisKey       = "this" ws
trueKey       = "true" ws { return true; }
falseKey      = "false" ws { return false; }

typerRule = infr:inferenceRule    { return infr; }
          / itr: isTypeRule       { return itr }
          / cfr: conformanceRule  { return cfr; }
          / eqr: equalsRule       { return eqr; }

inferenceRule = conceptRef:conceptRef ws abs:abstractKey? inferenceKey calculation:calculation? 
    { 
      return create.createInferenceRule({ 
        "conceptRef": conceptRef, 
        "calculation": calculation,
        "isAbstract": (!!abs)
      }); 
    }

calculation = 
            typeOfKey round_begin ws type:langRefExpression ws round_end 
              { return create.createTypeOfCalculation({
                "type": type
              })}
            / superTypeKey round_begin ws prop1:langRefExpression ws comma_separator ws prop2:langRefExpression round_end 
              { return create.createSuperTypeCalculation({
                "type1": prop1,
                "type2": prop2,
              })}
            / property:langRefExpression? 
              { return create.createPropertyCalculation({ 
                "property": property 
              })}

conceptRef = name:var { return create.createElementReference( { "name": name}); }

isTypeRule = isTypeKey curly_begin ws types:(
      head:conceptRef
      tail:(comma_separator v:conceptRef { return v; })*
      { return [head].concat(tail); }
    )
   ws curly_end {
  return create.createIsTypeRule( {
   "types": types !== null ? types : []
  });
}

conformanceRule = conformsKey round_begin ws type1:typeValue ws comma_separator ws type2:typeValue ws round_end ws 
            ws equals_separator value:booleanValue
{
  return create.createConformanceRule( {
   "type1": type1,
   "type2": type2,
   "value": value
  });
}

equalsRule = equalsKey round_begin ws type1:typeValue ws comma_separator ws type2:typeValue ws round_end 
            ws equals_separator value:booleanValue 
{
  return create.createTypeEqualsRule( {
   "type1": type1,
   "type2": type2, 
   "value": value
  });
}

booleanValue =  trueKey  { return true; }
              / falseKey {return false; }

typeValue = 
//tp:aTypeKey appliedFeature:dotExpression? { 
  //return create.createTypeValue( { 
    //"typeProperty": appliedFeature,
  //  "isAType": (!!tp)
  //}); }
          /// 
          all:allKey appliedFeature:dotExpression? { 
  return create.createTypeValue( {
    "typeProperty": appliedFeature,
    "allTypes": (!!all)
  }); }
          / ref:enumRefExpression { 
  return create.createTypeValue( { 
    "enumRef": ref 
  }); }

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
