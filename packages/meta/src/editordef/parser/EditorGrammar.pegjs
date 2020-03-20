{
    let creator = require("./EditorCreators");
}

Editor_Definition
  = ws "editor" ws name:var ws "for" ws "language" ws languageName:var ws c:(concept)* ws
    {
        return creator.createLanguageEditor({
            "name": name,
            "concepts": c
        });
    } 

conceptKey      = "concept" ws
binaryKey       = "binary" ws { return true; }
expressionKey   = "expression" ws { return true; }
placeholderKey  = "placeholder" ws { return true; }

conceptRef = conceptKey name:var { return creator.createConceptReference( { "name": name}); }

concept = concept:conceptRef ws binary:binaryKey? expression:expressionKey? isExpressionPlaceHolder:placeholderKey?
         trigger:trigger?
         symbol:symbol?
         priority: priority?
         "projection" ws name:var curly_begin
          l:line*
          curly_end
    { 
        return creator.createConceptEditor({
            "isBinaryExpression": !!binary,
            "isExpression": (!!expression),
            "isExpressionPlaceHolder": !!isExpressionPlaceHolder,
            "trigger": ( !!trigger),
            "symbol": ( !!symbol),
            "priority": ( !!priority),
            "projection": creator.createProjection({ "lines" : l})
        }); 
    }

spaces      = s:[ ]+
                {
                    return creator.createIndent( { "indent": s.join("") });
                }

expression  = "${" t:var "}"
                {
                    return creator.createPropertyRef( { "propertyName": t });
                }
text        = chars:anythingBut+
            {
                return creator.createText( chars.join("") );
             }

anythingBut = !("${" / newline / "]]" ) src:sourceChar
            {
                return src;
            }

sourceChar = .

newline     = "\r"? "\n"            { return "\n"; }

line        = items:(s:spaces / t:text / e:expression)* newline
                {
                    return creator.createLine( {"items": items} );
                }

conceptReference = referredName:var {
    return creator.createConceptReference({"name": referredName})
}

trigger = "trigger" ws ":" ws "\"" value:string "\"" ws
    {
        return { "trigger": value }
    }
symbol = "symbol" ws ":" ws "\"" value:string "\"" ws
    {
        return { "symbol": value }
    }
priority = "priority" ws ":" ws "\"" value:string "\"" ws
    {
        return { "priority": value }
    }


curly_begin    = ws "[[" newline
curly_end      = "]]" ws
name_separator  = ws ":" ws

ws "whitespace" = [ \t\n\r]*

var "var"
  = first:varLetter rest:varLetterOrDigit* ws { return first + rest.join(""); }

string           = chars:anyChar* { return chars.join(""); }

varLetter           = [a-zA-Z]
varLetterOrDigit    = [a-zA-Z0-9]
anyChar             = [*a-zA-Z0-9'/\-[\]+<>=]

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
