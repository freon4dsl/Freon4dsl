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

concept = isRoot:rootKey? abs:abstractKey? conceptKey ws name:var ws base:conceptbase? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* curly_end
    {
        return create.createConcept({
            "isRoot": (!!isRoot),
            "isAbstract": (!!abs),
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "location": location()
        });
    }

limited = limitedKey ws name:var ws base:conceptbase? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* instances:instance* curly_end
    {
        return create.createLimitedConcept({
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "instances": instances,
            "location": location()
        });
    }

interface = interfaceKey ws name:var ws base:interfacebase? curly_begin props:property* curly_end
    {
        return create.createInterface({
            "name": name,
            "base": base,
            "properties": props,
            "location": location()
        });
    }

expression = isRoot:rootKey? abs:abstractKey? binary:binaryKey? expressionKey ws name:var ws base:conceptbase? ws implementedInterfaces:implementedInterfaces?
                curly_begin
                    props:property*
                    priority:priority?
                curly_end
    {
        if (!!binary) {
            return create.createBinaryExpressionConcept({
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
// TODO make interfaces availbale as type of properties
// partProperty = name:var ws isOptional:optionalKey? name_separator ws type:var isList:"[]"? ws initialvalue:initialvalue? semicolon_separator
partProperty = name:var ws isOptional:optionalKey? name_separator ws type:var isList:"[]"? semicolon_separator
    {
        if (type === "string" || type === "boolean" || type === "number") {
            return create.createPrimitiveProperty({
                "name": name,
                "primType": type,
                "isOptional": (isOptional?true:false),
                "isList": (isList?true:false),
                "location": location()
            });
        } else {
            const ref = create.createClassifierReference({"name": type, "location": location()});
            return create.createPartProperty({
                "name": name,
                "type": ref,
                "isOptional": (isOptional?true:false),
                "isList": (isList?true:false),
                "location": location()
            })
        }
    }

// TODO add initialvalue
// referenceProperty = referenceKey ws name:var isOptional:optionalKey? name_separator ws type:conceptReference isList:"[]"? ws initialvalue:initialvalue? semicolon_separator
referenceProperty = referenceKey ws name:var isOptional:optionalKey? name_separator ws type:classifierReference isList:"[]"? semicolon_separator
    { return create.createReferenceProperty({
        "name": name,
        "type": type,
        "isOptional": (isOptional?true:false),
        "isList": (isList?true:false),
        "location": location()
    }) }

conceptReference = referredName:var
    { return create.createConceptReference({"name": referredName, "location": location()}); }

classifierReference = referredName:var
    { return create.createClassifierReference({"name": referredName, "location": location()}); }

interfaceReference = referredName:var
    { return create.createInterfaceReference({"name": referredName, "location": location()}); }

conceptbase = baseKey conceptReference:conceptReference
    { return conceptReference; }

interfacebase = baseKey intfRefs:( head:interfaceReference
                                   tail:(comma_separator v:interfaceReference { return v; })*
                                   { return [head].concat(tail); }
                                 )
    { return intfRefs; }

implementedInterfaces = implementsKey intfRefs:( head:interfaceReference
                                                    tail:(comma_separator v:interfaceReference { return v; })*
                                                    { return [head].concat(tail); }
                                                  )
    { return intfRefs; }

priority = priorityKey ws equals_separator ws value:string ws
    { return Number.parseInt(value); }

instance = name:var equals_separator curly_begin props:propDefList curly_end
    { return create.createInstance( {"name": name, "props": props, "location": location() } ); }

propDefList = head:propDef tail:(comma_separator v:propDef { return v; })*
    { return [head].concat(tail); }

propDef = "\"" name:var "\"" name_separator value:propValue
    { return create.createPropDef( {"name": name, "value": value, "location": location() } ); }

propValue = "\"" value:string "\""  { return value; }
          / number:string           { return Number.parseInt(number); }
          / "false"                 { return "false"; }
          / "true"                  { return "true"; }
          / "[]"                    { return "[]"; }

initialvalue = equals_separator value:propValue
    { return value; }
