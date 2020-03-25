{
    let create = require("./LanguageCreators");
}

// TODO the order of the element should not be fixed
// TODO name chould be changed into Langauge_Definition
Editor_Definition
  = ws "language" ws name:var ws c:(concept)* ws e:(enumeration)* ws t:(union)*
    {
        return create.createLanguage({
            "name": name,
            "classes": c,
            "enumerations": e,
            "unions": t
        });
    } 

abstractKey     = "abstract" ws { return true; }
rootKey         = "root" ws { return true; }
binaryKey       = "binary" ws { return true; }
expressionKey   = "expression" ws { return true; }
baseKey         = "base" ws { return true; }
placeholderKey  = "placeholder" ws { return true; }
enumKey         = "enum" { return true; }

base = baseKey name:var { return create.createConceptReference( { "name": name}); }

// TODO one should be able to mingle parts, references and attributes
concept = isRoot:rootKey? abs:abstractKey? binary:binaryKey? expression:expressionKey? isExpressionPlaceHolder:placeholderKey?
         "concept" ws name:var ws base:base? curly_begin 
            att:attribute*
            parts:part* 
            references:reference*
            editorProps:editorProperty*
          curly_end 
    {
        if (!!binary) {
            return create.createBinaryExpressionConcept({
                "primProperties": att.filter(a => !create.isEnumerationProperty(a)),
                "enumProperties": att.filter(a => create.isEnumerationProperty(a)),
                "parts": parts,
                "references": references,
                "name": name,
                "base": base,
                "isAbstract": (!!abs),
                "isRoot": (!!isRoot),
                "_isExpressionPlaceHolder": !!isExpressionPlaceHolder,
                "trigger": ( !!editorProps.find(p => p.trigger) ? editorProps.find(p => p.trigger).trigger : undefined),
                "symbol": ( !!editorProps.find(p => p.symbol) ? editorProps.find(p => p.symbol).symbol : undefined),
                "priority": ( !!editorProps.find(p => p.priority) ? editorProps.find(p => p.priority).priority : undefined)
            });
        } else if (!!expression) {
            return create.createExpressionConcept({
                "primProperties": att.filter(a => !create.isEnumerationProperty(a)),
                "enumProperties": att.filter(a => create.isEnumerationProperty(a)),
                "parts": parts,
                "references": references,
                "name": name,
                "base": base,
                "isAbstract": (!!abs),
                "isRoot": (!!isRoot),
                "_isExpressionPlaceHolder": !!isExpressionPlaceHolder,
                "trigger": ( !!editorProps.find(p => p.trigger) ? editorProps.find(p => p.trigger).trigger : undefined),
                "symbol": ( !!editorProps.find(p => p.symbol) ? editorProps.find(p => p.symbol).symbol : undefined),
                "priority": ( !!editorProps.find(p => p.priority) ? editorProps.find(p => p.priority).priority : undefined)
            });
        } else {
            return create.createClass({
                "primProperties": att.filter(a => !create.isEnumerationProperty(a)),
                "enumProperties": att.filter(a => create.isEnumerationProperty(a)),
                "parts": parts,
                "references": references,
                "name": name,
                "base": base,
                "isAbstract": (!!abs),
                "isRoot": (!!isRoot),
                "trigger": ( !!editorProps.find(p => p.trigger) ? editorProps.find(p => p.trigger).trigger : undefined),
            });
        } 
    }

attribute = name:var ws name_separator ws isEnum:"enum"? ws type:var isList:"[]"? ws
    {
        if( isEnum) {
            const enumRef = create.createEnumerationReference({"name": type});
            return create.createEnumerationProperty({"name": name, "type": enumRef, "isList": (isList?true:false) })
        } else {
            return create.createPrimitiveProperty({"name": name, "primType": type, "isList": (isList?true:false) })
        }
    }

part = "@part" ws name:var ws name_separator ws type:conceptReference isList:"[]"? ws
    { 
        return create.createPart({"name": name, "type": type, "isList": (isList?true:false) }) 
    }

reference = "@reference" ws name:var ws name_separator ws type:conceptReference isList:"[]"? ws
    { 
        return create.createReference({"name": name, "type": type, "isList": (isList?true:false) }) 
    }

conceptReference = referredName:var {
    return create.createConceptReference({"name": referredName})
}

// TODO move to editorDef parser, except 'priority'
editorProperty = "@editor" ws name:var ws name_separator ws type:var ws "=" ws "\"" value:string "\"" ws
    {
        switch(name) {
            case "trigger": return { "trigger": value }
            case "priority": return { "priority": Number.parseInt(value) };
            case "symbol": return { "symbol": value };
        };
        return {"name": name, "type": type, "value": value, "isEditor": true }
    }  

enumeration = "enumeration" ws name:var curly_begin
                    literals:var+
                curly_end
                {
                    return create.createEnumeration({ "name": name, "literals": literals});
                }

union = "union" ws name:var curly_begin
                    members:var+
                curly_end
                {
                    return create.createUnion({ "name": name, "members": members});
                }
                
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
