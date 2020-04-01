{
    let create = require("./LanguageCreators");
}

// TODO the order of the element should not be fixed
// TODO name chould be changed into Langauge_Definition
Editor_Definition
  = ws "language" ws name:var ws defs:(langdef)* 
    {
        return create.createLanguage({
            "name": name,
            "defs": defs
        });
    } 

abstractKey     = "abstract" ws { return true; }
rootKey         = "root" ws { return true; }
binaryKey       = "binary" ws { return true; }
expressionKey   = "expression" ws { return true; }
baseKey         = "base" ws { return true; }
placeholderKey  = "placeholder" ws { return true; }
enumKey         = "enum" { return true; }
partKey         = "part" 
referenceKey    = "reference" 
priorityKey     = "priority" 

langdef = c:(concept) { return c;} / e:(enumeration) {return e;}/ t:(union) {return t;}

base = baseKey name:var { return create.createConceptReference( { "name": name}); }

// TODO one should be able to mingle parts, references and attributes
concept = isRoot:rootKey? abs:abstractKey? binary:binaryKey? expression:expressionKey? isExpressionPlaceHolder:placeholderKey?
         "concept" ws name:var ws base:base? curly_begin props:property* priority:priority? curly_end 
    {
        return create.createParseClass({
            "isRoot": (!!isRoot),
            "isAbstract": (!!abs),
            "isBinary": (!!binary),
            "isExpression": (!!expression),
            "_isExpressionPlaceHolder": !!isExpressionPlaceHolder,
            "name": name,
            "base": base,
            "properties": props,
            "priority": (!!priority ? priority : 0)
        });
    }

property =  att:attribute { return att; }
            / part:part { return part; }
            / ref:reference { return ref; }

attribute = name:var ws name_separator ws type:var isList:"[]"? ws
    {
      // we always create an EnumerationProperty, even if it is a PrimitiveProperty
      // this is corrected in the Checker
      const enumRef = create.createEnumerationReference({"name": type});
      return create.createEnumerationProperty({"name": name, "type": enumRef, "isList": (isList?true:false) })
    }

part = partKey ws name:var ws name_separator ws type:conceptReference isList:"[]"? ws
    { 
        return create.createPart({"name": name, "type": type, "isList": (isList?true:false) }) 
    }

reference = referenceKey ws name:var ws name_separator ws type:conceptReference isList:"[]"? ws
    { 
        return create.createReference({"name": name, "type": type, "isList": (isList?true:false) }) 
    }

conceptReference = referredName:var {
    return create.createConceptReference({"name": referredName})
}

priority = priorityKey ws "=" ws "\"" value:string "\"" ws {
    return Number.parseInt(value);
}  

enumeration = "enumeration" ws name:var curly_begin
                    literals:var+
                curly_end
                {
                    return create.createEnumeration({ "name": name, "literals": literals});
                }

union = "union" ws name:var curly_begin
                    members:conceptReference+
                curly_end
                {
                    return create.createUnion({ "name": name, "members": members});
                }
                
curly_begin    = ws "{" ws 
curly_end      = ws "}" ws
name_separator  = ws ":" ws

ws "whitespace" = (([ \t\n\r]) / (SingleLineComment) / (MultiLineComment) )*

var "var"
  = first:varLetter rest:identifierChar* ws { return first + rest.join(""); }

string           = chars:anyChar* { return chars.join(""); }

varLetter           = [a-zA-Z]
identifierChar      = [a-zA-Z0-9_$] // anychar but not /.,!?@~%^&*-=+(){}"':;<>?[]\/
anyChar             = [*a-zA-Z0-9'/\-[\]+<>=#$_.,!?@~%^&*-=+(){}:;<>?]

// van javascript example
SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*

LineTerminator
  = [\n\r\u2028\u2029]

SourceCharacter
  = .

Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

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
