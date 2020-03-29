{
    let creator = require("./EditorCreators");
}

Editor_Definition
  = ws "editor" ws name:var ws "for" ws "language" ws languageName:var ws concepts:(conceptEditor)* ws
    {
        return creator.createLanguageEditor({
            "name"          : name,
            "conceptEditors": concepts
        });
    } 

conceptRef = name:var { return creator.createConceptReference( { "name": name}); }

conceptEditor =
            concept:conceptRef curly_begin ws
                projection:projection?
                trigger:trigger?
                symbol:symbol?
            curly_end
{
    return creator.createConceptEditor({
        "trigger"   : !!trigger,
        "symbol"    : !!symbol,
        "projection": projection
    });
}

projection = "@projection" ws name:var projection_begin
                   lines:line*
              projection_end
              {
                    return creator.createProjection({ "lines" : lines, "name": name });
              }

templateSpace = s:[ ]+
                {
                    return creator.createIndent( { "indent": s.join("") });
                }

sub_projection = "[[" ws "this" ws "." ws prop:var ws
                        join:listJoin?
                 "]]"
            {
                return creator.createSubProjection( { "propertyName": prop, "listJoin": join });
            }

listJoin =  l:listJoinSimple+
                {
                    let directionObject = l.find(j => !!j.direction);
                    let joinTypeObject  = l.find(j => !!j.joinType);
                    let joinTextObject  = l.find(j => !!j.joinText);

                    return creator.createListJoin( {"direction": (!!directionObject ? directionObject.direction : undefined),
                                                    "joinType" : (!!joinTypeObject ? joinTypeObject.joinType    : undefined),
                                                    "joinText" : (!!joinTextObject ? joinTextObject.joinText    : undefined) } );
                }

listJoinSimple =      (direction:direction  { return {"direction" : direction }; } )
                    / (type:listJoinType    { return {"joinType"  : type      }; } )
                    / (t:joinText           { return {"joinText"  : t         }; } )

joinText = "[" t:anythingButEndBracket* "]" ws
            {
                return t.join("");
            }

direction = dir:("@horizontal" / "@vertical") ws
                {
                    return creator.createListDirection( {"direction": dir } );
                }

listJoinType = joinType:("@separator" / "@terminator") ws
                {
                    return creator.createJoinType( {"type": joinType } );
                }

expression  = "${" t:var "}"
                {
                    return creator.createPropertyRef( { "propertyName": t });
                }
text        = chars:anythingBut+
            {
                return creator.createText( chars.join("") );
             }

anythingButEndBracket = !("]" ) src:sourceChar
            {
                return src;
            }

anythingBut = !("${" / newline / "]" / "[[" ) src:sourceChar
            {
                return src;
            }

sourceChar = .

newline     = "\r"? "\n"
                {
                    return creator.createNewline();
                }

line        = items:(s:templateSpace / t:text / p:sub_projection / e:expression / w:newline )+
                {
                    return creator.createLine( {"items": items} );
                }

conceptReference = referredName:var {
    return creator.createConceptReference({"name": referredName})
}

trigger = "@trigger" ws "\"" value:string "\"" ws
    {
        return { "trigger": value }
    }
symbol = "@symbol" ws "\"" value:string "\"" ws
    {
        return { "symbol": value }
    }
priority = "priority" ws ":" ws "\"" value:string "\"" ws
    {
        return { "priority": value }
    }


projection_begin    = ws "["
projection_end      = "]" ws
curly_begin    = ws "{" newline
curly_end      = "}" ws
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
