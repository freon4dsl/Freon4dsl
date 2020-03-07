{
    let create = require("./ScoperCreators");
}

Scoper_Definition
  = ws "scoper" ws scoperName:var ws "for" ws "language" ws languageName:var ws ns:(namespace)*
    {
        return create.createScopeDef({
            "scoperName": scoperName,
            "languageName": languageName,
            "namespaces": ns,
        });
    } 

namespaceKey = "@namespace" ws

namespace = namespaceKey curly_begin conceptRefs:(conceptRef)* ws curly_end 
    { 
        return create.createNamespace({ "conceptRefs": conceptRefs }); 
    }

conceptRef = name:var { return create.createConceptReference( { "name": name}); }

// the following is basic stuff 

curly_begin    = ws "{" ws 
curly_end      = ws "}" ws
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
