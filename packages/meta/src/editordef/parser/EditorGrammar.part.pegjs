{
    let creator = require("./EditorCreators");
    let expCreate = require("../../languagedef/parser/ExpressionCreators");
}

Editor_Definition
  = ws "editor" ws name:var ws "for" ws "language" ws languageName:var ws concepts:(conceptEditor)* ws
    {
        return creator.createLanguageEditor({
            "name"          : name,
            "conceptEditors": concepts
        });
    } 
conceptEditor =
            concept:conceptRef curly_begin ws
                projection:projection?
                trigger:trigger?
                symbol:symbol?
            curly_end
{
    return creator.createConceptEditor({
        "concept"   : concept,
        "trigger"   : trigger,
        "symbol"    : symbol,
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

sub_projection = "[[" ws exp:expression ws
                        join:listJoin?
                 "]]"
            {
                return creator.createSubProjection( {  "expression": exp, "listJoin": join });
            }

//sub_projection = "[[" ws "this" ws "." ws prop:var ws
//                        join:listJoin?
//                 "]]"
//            {
//                return creator.createSubProjection( { "propertyName": prop, "listJoin": join });
//            }

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

projectionexpression  = "${" t:var "}"
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

line        = items:(s:templateSpace / t:text / p:sub_projection / e:projectionexpression / w:newline )+
                {
                    return creator.createLine( {"items": items} );
                }

conceptReference = referredName:var {
    return creator.createConceptReference({"name": referredName})
}

trigger = "@trigger" ws "\"" value:string "\"" ws
    {
        return value
    }
symbol = "@symbol" ws "\"" value:string "\"" ws
    {
        return value
    }
priority = "priority" ws ":" ws "\"" value:string "\"" ws
    {
        return value
    }

projection_begin    = ws "["
projection_end      = "]" ws

