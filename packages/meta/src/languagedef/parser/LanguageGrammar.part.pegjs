/**
 * Grammar for language definition syntax (.ast files)
 */

{{
import * as create from "./LanguageCreators.js"
}}

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
privateKey      = "private" rws { return true; }
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
fileExtensionKey   = "file-extension" rws

langdef = m:model {return m;} / u:unit {return u;} / c:concept { return c;} / t:limited {return t;} / i:interface {return i;} / e:expression {return e;}

model = isModel:modelKey name:var
    curly_begin props:property* curly_end    {
        return create.createModel({
            "name": name,
            "properties": props,
            "location": location()
        });
    }

unit = isUnit:unitKey name:var ws implementedInterfaces:implementedInterfaces?
        curly_begin
            props:property*
            fileExtension:(fileExtensionKey equals_separator "\"" fileExt:var "\"" semicolon_separator {return fileExt;})?
         curly_end    {
        return create.createUnit({
            "name": name,
            "properties": props,
            "interfaces": implementedInterfaces,
            "fileExtension": (!!fileExtension ? fileExtension : ""),
            "location": location()
        });
    }

concept = abs:abstractKey? conceptKey name:var rws base:conceptbase? ws implementedInterfaces:implementedInterfaces?
            curly_begin
                props:property*
            curly_end
    {
        return create.createConcept({
            "isAbstract": (!!abs),
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "location": location()
        });
    }

limited = abs:abstractKey? limitedKey ws name:var rws base:conceptbase? ws implementedInterfaces:implementedInterfaces? curly_begin props:property* instances:instance* curly_end
    {
        return create.createLimitedConcept({
            "isAbstract": (!!abs),
            "name": name,
            "base": base,
            "interfaces": implementedInterfaces,
            "properties": props,
            "instances": instances,
            "location": location()
        });
    }

interface = interfaceKey ws name:var rws base:interfacebase?
            curly_begin
                props:property*
            curly_end
    {
        return create.createInterface({
            "name": name,
            "base": base,
            "properties": props,
            "location": location()
        });
    }

expression = abs:abstractKey? binary:binaryKey? expressionKey ws name:var rws base:conceptbase? ws implementedInterfaces:implementedInterfaces?
                curly_begin
                    props:property*
                    priority:priority?
                curly_end
    {
        if (!!binary) {
            return create.createBinaryExpressionConcept({
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

partProperty = isPrivate:privateKey? name:var ws isOptional:optionalKey? colon_separator ws type:classifierReference isList:"[]"? ws initialvalue:initialvalue? semicolon_separator
    {
        return create.createPartOrPrimProperty({
            "isPublic": (isPrivate?false:true),
            "name": name,
            "isOptional": (isOptional?true:false),
            "isList": (isList?true:false),
            "initialValue": initialvalue,
            "typeReference": type,
            "location": location()
        });
    }

referenceProperty = isPrivate:privateKey? referenceKey ws name:var ws isOptional:optionalKey? colon_separator ws type:classifierReference isList:"[]"? semicolon_separator
    {
     return create.createReferenceProperty({
        "isPublic": (isPrivate?false:true),
        "name": name,
        "typeReference": type,
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
          / instance:instanceExpression { return instance }

propValueList = head:propValue tail:(comma_separator v:propValue { return v; })*
                    { return [head].concat(tail); }

initialvalue = equals_separator value:propValue
    { return value; }

initialvalueref = equals_separator value:instanceExpression
    { return value; }
    
instanceExpression = conceptName:var ':' instance:var
    {
        return create.createEnumValue({
                "sourceName": conceptName,
                "instanceName": instance,
                "location": location()
            })
    }
