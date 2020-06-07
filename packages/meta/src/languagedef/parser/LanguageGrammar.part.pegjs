{
    let create = require("./LanguageCreators");
}

Language_Definition
  = ws "language" ws name:var ws concepts:(langdef)*
    {
        return create.createLanguage({
            "name": name,
            "concepts": concepts,
            "location": location()
        });
    } 

abstractKey     = ws "abstract" ws { return true; }
rootKey         = ws "root" ws { return true; }
unitKey         = ws "unit" ws { return true; }
publicKey       = ws "public" ws { return true; }
limitedKey      = ws "limited" ws {return true; }
interfaceKey    = ws "interface" ws
binaryKey       = ws "binary" ws { return true; }
expressionKey   = ws "expression" ws { return true; }
conceptKey      = ws "concept" ws
baseKey         = ws "base" ws { return true; }
referenceKey    = ws "reference" ws
priorityKey     = ws "priority" ws
optionalKey     = ws "?" ws
implementsKey   = ws "implements" ws

langdef = c:concept { return c;} / t:limited {return t;} / i:interface {return i;} / e:expression {return e;}

concept = isPublic:publicKey? isRoot:rootKey? isUnit:unitKey? abs:abstractKey? conceptKey ws name:var ws base:conceptbase? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* curly_end
    {
        return create.createConcept({
            "isPublic": (!!isPublic),
            "isRoot": (!!isRoot),
            "isUnit": (!!isUnit),
            "isAbstract": (!!abs),
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "location": location()
        });
    }

limited = isPublic:publicKey? limitedKey ws name:var ws base:conceptbase? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* instances:instance* curly_end
    {
        return create.createLimitedConcept({
            "isPublic": (!!isPublic),
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "instances": instances,
            "location": location()
        });
    }

interface = isPublic:publicKey? interfaceKey ws name:var ws base:interfacebase? curly_begin props:property* curly_end
    {
        return create.createInterface({
            "isPublic": (!!isPublic),
            "name": name,
            "base": base,
            "properties": props,
            "location": location()
        });
    }

expression = isPublic:publicKey? isRoot:rootKey? abs:abstractKey? binary:binaryKey? expressionKey ws name:var ws base:conceptbase? ws implementedInterfaces:implementedInterfaces?
                curly_begin
                    props:property*
                    priority:priority?
                curly_end
    {
        if (!!binary) {
            return create.createBinaryExpressionConcept({
                "isPublic": (!!isPublic),
                "isRoot": (!!isRoot),
                "isAbstract": (!!abs),
                "name": name,
                "base": base,
                "interfaces": implementedInterfaces,
                "properties": props,
                "priority": (!!priority ? priority : 0),
                "location": location()
            });
        } else {
            return create.createExpressionConcept({
                "isPublic": (!!isPublic),
                "isRoot": (!!isRoot),
                "isAbstract": (!!abs),
                "name": name,
                "base": base,
                "interfaces": implementedInterfaces,
                "properties": props,
                "location": location()
            });
        }
    }

property = part:partProperty      { return part; }
         / ref:referenceProperty  { return ref; }

// TODO add initialvalue
// partProperty = isPublic:publicKey? name:var ws isOptional:optionalKey? name_separator ws type:var isList:"[]"? ws initialvalue:initialvalue? semicolon_separator
partProperty = isPublic:publicKey? name:var ws isOptional:optionalKey? name_separator ws type:var isList:"[]"? semicolon_separator
    {
        if (type === "string" || type === "boolean" || type === "number") {
            return create.createPrimitiveProperty({
                "isPublic": (!!isPublic),
                "name": name,
                "primType": type,
                "isOptional": (isOptional?true:false),
                "isList": (isList?true:false),
                "location": location()
            });
        } else {
            const ref = create.createClassifierReference({"name": type, "location": location()});
            return create.createPartProperty({
                "isPublic": (!!isPublic),
                "name": name,
                "type": ref,
                "isOptional": (isOptional?true:false),
                "isList": (isList?true:false),
                "location": location()
            })
        }
    }

// TODO add initialvalue
// referenceProperty = referenceKey ws name:var isOptional:optionalKey? name_separator ws type:classifierReference isList:"[]"? ws initialvalue:initialvalue? semicolon_separator
referenceProperty = isPublic:publicKey? referenceKey ws name:var isOptional:optionalKey? name_separator ws type:classifierReference isList:"[]"? semicolon_separator
    { return create.createReferenceProperty({
        "isPublic": (!!isPublic),
        "name": name,
        "type": type,
        "isOptional": (isOptional?true:false),
        "isList": (isList?true:false),
        "location": location()
    }) }

classifierReference = referredName:var
    { return create.createClassifierReference({"name": referredName, "location": location()}); }

conceptbase = baseKey classifierReference:classifierReference
    { return classifierReference; }

interfacebase = baseKey intfRefs:( head:classifierReference
                                   tail:(comma_separator v:classifierReference { return v; })*
                                   { return [head].concat(tail); }
                                 )
    { return intfRefs; }

implementedInterfaces = implementsKey intfRefs:( head:classifierReference
                                                    tail:(comma_separator v:classifierReference { return v; })*
                                                    { return [head].concat(tail); }
                                                  )
    { return intfRefs; }

priority = priorityKey ws equals_separator ws value:numberliteral ws semicolon_separator
    { return Number.parseInt(value); }

instance = i1:instance1 { return i1; }
         / i2:instance2 { return i2; }

instance1 = name:var equals_separator curly_begin props:propDefList curly_end
    { return create.createInstance( {"name": name, "props": props, "location": location() } ); }

instance2 = name:var semicolon_separator
    { return create.createInstance( {"name": name, "location": location() } ); }

propDefList = head:propDef tail:(comma_separator v:propDef { return v; })*
    { return [head].concat(tail); }

// the name may or may not be surrounded by quotes
propDef = "\"" name:var "\"" name_separator value:propValue
    { return create.createPropDef( {"name": name, "value": value, "location": location() } ); }
    / name:var name_separator value:propValue
    { return create.createPropDef( {"name": name, "value": value, "location": location() } ); }

propValue = "\"" value:string "\""  { return value; }
          / "false"                 { return "false"; }
          / "true"                  { return "true"; }
          / "[]"                    { return "[]"; }
          / number:numberliteral    { return Number.parseInt(number); }

initialvalue = equals_separator value:propValue
    { return value; }
