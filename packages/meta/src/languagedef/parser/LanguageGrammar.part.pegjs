{
    let create = require("./LanguageCreators");
}

Language_Definition
  = ws "language" ws name:var ws defs:(langdef)* 
    {
        return create.createLanguage({
            "name": name,
            "defs": defs,
            "location": location()
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
            "priority": (!!priority ? priority : 0),
            "location": location()
        });
    }

property =  att:attribute { return att; }
            / part:part { return part; }
            / ref:reference { return ref; }

attribute = name:var ws name_separator ws type:var isList:"[]"? ws
    {
      if (type === "string" || type === "boolean" || type === "number") {
        return create.createPrimitiveProperty({"name": name, "primType": type, "isList": (isList?true:false), "location": location() });
      } else {
        const enumRef = create.createEnumerationReference({"name": type});
        return create.createEnumerationProperty({"name": name, "type": enumRef, "isList": (isList?true:false), "location": location() })
      }
    }

part = partKey ws name:var ws name_separator ws type:conceptReference isList:"[]"? ws
    { 
        return create.createPart({"name": name, "type": type, "isList": (isList?true:false), "location": location() })
    }

reference = referenceKey ws name:var ws name_separator ws type:conceptReference isList:"[]"? ws
    { 
        return create.createReference({"name": name, "type": type, "isList": (isList?true:false), "location": location() })
    }

conceptReference = referredName:var {
    return create.createConceptReference({"name": referredName, "location": location()})
}

priority = priorityKey ws "=" ws "\"" value:string "\"" ws {
    return Number.parseInt(value);
}  

enumeration = "enumeration" ws name:var curly_begin
                    literals:var+
                curly_end
                {
                    return create.createEnumeration({ "name": name, "literals": literals, "location": location()});
                }

union = "union" ws name:var curly_begin
                    members:conceptReference+
                curly_end
                {
                    return create.createUnion({ "name": name, "members": members, "location": location()});
                }
