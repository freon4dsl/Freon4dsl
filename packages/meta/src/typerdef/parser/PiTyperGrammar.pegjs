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

isTypeKey     = "@istype" ws
inferenceKey  = "@infertype" ws
conformsKey   = "@conformsto" ws
equalsKey     = "@equalsto" ws
anyKey        = "@anytype" ws { return true; }
superTypeKey  = "commonSuperType" ws
abstractKey   = "abstract" ws { return true; }

typerRule = itr:isTypeRule   { return itr; }
          / any:anyTypeRule  { return any; }
          / other:otherRule  { return other; }

isTypeRule = isTypeKey curly_begin types:(
      head:conceptRef
      tail:(comma_separator v:conceptRef { return v; })*
      { return [head].concat(tail); }
    ) curly_end 
{
  return create.createIsType({
    "types":types
  })
}

anyTypeRule = anyKey curly_begin statements:statement* curly_end 
{
  return create.createAnyTypeRule( {
    "statements":statements
  })
}

otherRule = conceptRef:conceptRef curly_begin statements:statement* curly_end
{
  return create.createConceptRule( {
    "conceptRef": conceptRef,
    "statements": statements
  })
}

statement = conformsKey:conformsKey exp:langRefExpression
{
  return create.createStatement({
    "statementtype": "conformsto",
    "exp": exp,
    "isAbstract": false
  })
}            
            / equalsKey:equalsKey exp:langRefExpression
{
  return create.createStatement({
    "statementtype":"equalsto",
    "exp": exp,
    "isAbstract": false
  })
}            
            / abs:abstractKey? inferenceKey:inferenceKey exp:langRefExpression?
{
  return create.createStatement({
    "statementtype":"infertype",
    "exp": exp,
    "isAbstract": (!!abs)
  })
}            

conceptRef = name:var { return expCreate.createConceptReference( { "name": name}); }

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
