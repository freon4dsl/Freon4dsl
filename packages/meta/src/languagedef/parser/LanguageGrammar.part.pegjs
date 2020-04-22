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

abstractKey     = ws "abstract" ws { return true; }
rootKey         = ws "root" ws { return true; }
binaryKey       = ws "binary" ws { return true; }
expressionKey   = ws "expression" ws { return true; }
baseKey         = ws "base" ws { return true; }
placeholderKey  = ws "placeholder" ws { return true; }
enumKey         = ws "enum" ws { return true; }
partKey         = ws "part" ws
referenceKey    = ws "reference" ws
priorityKey     = ws "priority" ws
implementsKey   = ws "implements" ws

langdef = c:(concept) { return c;} / e:(enumeration) {return e;}/ t:(union) {return t;} / i:(interface) {return i;}

concept = isRoot:rootKey? abs:abstractKey? binary:binaryKey? expression:expressionKey? isExpressionPlaceHolder:placeholderKey?
         "concept" ws name:var ws base:base? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* priority:priority? curly_end
    {
        return create.createParseClass({
            "isRoot": (!!isRoot),
            "isAbstract": (!!abs),
            "isBinary": (!!binary),
            "isExpression": (!!expression),
            "_isExpressionPlaceHolder": !!isExpressionPlaceHolder,
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "priority": (!!priority ? priority : 0),
            "location": location()
        });
    }

interface = "interface" ws name:var ws base:base? curly_begin props:property* curly_end
                {
                    return create.createInterface({
                        "name": name,
                        "base": base,
                        "properties": props,
                        "location": location()
                    });
                }

base = baseKey conceptReference:conceptReference { return conceptReference; }

property =  att:attribute { return att; }
            / part:part { return part; }
            / ref:reference { return ref; }

attribute = name:var ws name_separator ws type:var isList:"[]"? ws
    {
      if (type === "string" || type === "boolean" || type === "number") {
        return create.createPrimitiveProperty({"name": name, "primType": type, "isList": (isList?true:false), "location": location() });
      } else {
        const enumRef = create.createConceptReference({"name": type, "location": location()});
        return create.createEnumerationProperty({"name": name, "type": enumRef, "isList": (isList?true:false), "location": location() })
      }
    }

part = partKey ws name:var ws name_separator ws type:conceptReference isList:"[]"? ws
    { 
        return create.createPartProperty({"name": name, "type": type, "isList": (isList?true:false), "location": location() })
    }

reference = referenceKey ws name:var ws name_separator ws type:conceptReference isList:"[]"? ws
    { 
        return create.createReferenceProperty({"name": name, "type": type, "isList": (isList?true:false), "location": location() })
    }

conceptReference = referredName:var {
    return create.createConceptReference({"name": referredName, "location": location()})
}

implementedInterfaces = implementsKey conceptRefs:(
                                             head:conceptReference
                                             tail:(comma_separator v:conceptReference { return v; })*
                                             { return [head].concat(tail); }
                                       )
    { return conceptRefs; }


priority = priorityKey ws "=" ws "\"" value:string "\"" ws {
    return Number.parseInt(value);
}  

// TODO should we accept base and interfaces for enumerations?
enumeration = "enumeration" ws name:var curly_begin
                    literals:var+
                curly_end
                {
                    return create.createEnumeration({ "name": name, "literals": literals, "location": location()});
                }

// TODO remove union
union = "union" ws name:var curly_begin
                    members:conceptReference+
                curly_end
                {
                    return create.createUnion({ "name": name, "members": members, "location": location()});
                }

