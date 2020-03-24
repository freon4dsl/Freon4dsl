// These are the parsing rules for the expressions over the language structure,
// as defined in meta/src/languagedef/metalanguage/PiLangExpressions.ts
// They are not meant to be used separately, they should be used in the parser for 
// projectIt parts that use the language expressions.
// Because they are common they are developed and tested separately, together with the
// creator functions in LanguageExpressionCreators.ts.

{
    let expCreate = require("./LanguageExpressionCreators");
}

LanguageExpressions_Definition
  = ws "expressions" ws "for" ws "language" ws languageName:var ws cr:(conceptExps)*
    {
        return expCreate.createTest({
            "languageName": languageName,
            "conceptExps": cr,
        });
    } 

conceptExps = conceptRef:conceptRef ws curly_begin ws exps:expWithSeparator* curly_end 
    { 
        return expCreate.createConceptExps({ 
          "conceptRef": conceptRef, 
          "exps": exps,
        }); 
    }

conceptRef = name:var { return expCreate.createConceptReference( { "name": name}); }

expWithSeparator = exp:langRefExpression semicolon_separator { return exp; }

// the following rules should be part of a parser that wants to use PiLangExpressions.ts
langRefExpression = enumRefExpression:enumRefExpression    { return enumRefExpression; } 
                  / expression:expression                  { return expression; }
                  / functionExpression:functionExpression  { return functionExpression; }
                  / allTypesExp:allTypesExp                { return allTypesExp; }

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

allTypesExp = allKey appliedfeature:dotExpression?  {
  return expCreate.createAnyTypeExp({
    "sourceName": "anyTYpe",
    "appliedfeature": appliedfeature
  })
}

dotExpression = '.' sourceName:var appliedfeature:dotExpression?  {
  return expCreate.createAppliedFeatureExp
( {
    "sourceName": sourceName,
    "appliedfeature": appliedfeature
  })
}

allKey        = "@anyType" ws { return true; }

// the following is basic stuff 

curly_begin    = ws "{" ws 
curly_end      = ws "}" ws
round_begin    = ws "(" ws 
round_end      = ws ")" ws
comma_separator = ws "," ws
semicolon_separator = ws ";" ws
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
