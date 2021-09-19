{
    let create = require("./LanguageCreators");
}

Language_Definition
  = ws "language" rws name:var rws langparts:(langdef)*
    {
        return create.createLanguage({
            "name": name,
            "concepts": langparts,
            "location": location()
        });
    } 

abstractKey     = "abstract" rws { return true; }
modelKey        = "model" rws { return true; }
unitKey         = "modelunit" rws { return true; }
publicKey       = "public" rws { return true; }
limitedKey      = "limited" rws {return true; }
interfaceKey    = "interface" rws
binaryKey       = "binary" rws { return true; }
expressionKey   = "expression" rws { return true; }
conceptKey      = "concept" rws
baseKey         = "base" rws { return true; }
referenceKey    = "reference" rws
priorityKey     = "priority" rws
optionalKey     = ws "?" ws
implementsKey   = "implements" rws

langdef = m:modelOrUnit {return m;} / c:concept { return c;} / t:limited {return t;} / i:interface {return i;} / e:expression {return e;}

modelOrUnit = isPublic:publicKey? isModel:modelKey? isUnit:unitKey? name:var rws base:conceptbase? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* curly_end
    {
        return create.createConcept({
            "isPublic": (!!isPublic),
            "isModel": (!!isModel),
            "isUnit": (!!isUnit),
            "isAbstract": false,
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "location": location()
        });
    }

concept = isPublic:publicKey? abs:abstractKey? conceptKey name:var rws base:conceptbase? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* curly_end
    {
        return create.createConcept({
            "isPublic": (!!isPublic),
            "isModel": false,
            "isUnit": false,
            "isAbstract": (!!abs),
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "location": location()
        });
    }

limited = isPublic:publicKey? limitedKey ws name:var rws base:conceptbase? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* instances:instance* curly_end
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

interface = isPublic:publicKey? interfaceKey ws name:var rws base:interfacebase? curly_begin props:property* curly_end
    {
        return create.createInterface({
            "isPublic": (!!isPublic),
            "name": name,
            "base": base,
            "properties": props,
            "location": location()
        });
    }

expression = isPublic:publicKey? abs:abstractKey? binary:binaryKey? expressionKey ws name:var rws base:conceptbase? ws implementedInterfaces:implementedInterfaces?
                curly_begin
                    props:property*
                    priority:priority?
                curly_end
    {
        if (!!binary) {
            return create.createBinaryExpressionConcept({
                "isPublic": (!!isPublic),
                "isModel": false,
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
                "isModel": false,
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

partProperty = isPublic:publicKey? name:var ws isOptional:optionalKey? colon_separator ws type:var isList:"[]"? ws initialvalue:initialvalue? semicolon_separator
    {
        let ref = null;
        let typeName = "";
        if (type === "string" || type === "boolean" || type === "number" || type === "identifier") {
            typeName = type;
        } else {
            ref = create.createClassifierReference({"name": type, "location": location()});
        }
        return create.createPartOrPrimProperty({
            "isPublic": (!!isPublic),
            "name": name,
            "isOptional": (isOptional?true:false),
            "isList": (isList?true:false),
            "initialValue": initialvalue,
            "typeName": typeName,
            "type": ref,
            "location": location()
        });
    }

referenceProperty = isPublic:publicKey? referenceKey ws name:var ws isOptional:optionalKey? colon_separator ws type:classifierReference isList:"[]"? semicolon_separator
    { return create.createReferenceProperty({
        "isPublic": (!!isPublic),
        "name": name,
        "type": type,
        "isOptional": (isOptional?true:false),
        "isList": (isList?true:false),
        "location": location()
    }) }

classifierReference = referredName:var ws
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

// shorthand for "{name: "name"}"
instance2 = name:var semicolon_separator
    { return create.createInstance( {"name": name, "location": location() } ); }

propDefList = head:propDef tail:(comma_separator v:propDef { return v; })*
    { return [head].concat(tail); }

// the name may or may not be surrounded by quotes
propDef = "\"" name:var "\"" colon_separator value:propValue
    { return create.createPropDef( {"name": name, "value": value, "location": location() } ); }
    / name:var colon_separator value:propValue
    { return create.createPropDef( {"name": name, "value": value, "location": location() } ); }

propValue = "\"" value:string "\""      { return value; }
          / "false"                     { return false; }
          / "true"                      { return true; }
          / number:numberliteral        { return Number.parseInt(number); }
          / "[" ws list:propValueList ws "]"  { return list; }
          / "[]"

propValueList = head:propValue tail:(comma_separator v:propValue { return v; })*
                    { return [head].concat(tail); }

initialvalue = equals_separator value:propValue
    { return value; }
