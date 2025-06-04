// This is a partial grammar file
// Needs to be concatenated with the Basic and Expression grammars
// The necessary require statements for all grammars should be defined here
//{
//    let create = require("./ScoperCreators");
//    let expCreate = require("../../languagedef/parser/ExpressionCreators");
//}

Scoper_Definition
  = ws "scoper" ws "for" ws "language" ws languageName:var ws ns:namespaces defs:conceptDefinition*
    {
        return create.createScopeDef({
            "languageName": languageName,
            "namespaces": ns,
            "scopeConceptDefs": defs,
            "location": location()
        });
    } 

isnamespaceKey          = "isnamespace" rws
additionKey             = "import" rws
replacementNamespaceKey = "alternative" rws
recursiveKey            = "recursive" ws

namespaces = isnamespaceKey curly_begin conceptRefs:(
                                              head:classifierReference
                                              tail:(comma_separator v:classifierReference { return v; })*
                                              { return [head].concat(tail); }
                                            ) ws curly_end
    {
        return conceptRefs;
    }

conceptDefinition = name:classifierReference curly_begin nsDef:namespaceAddition curly_end
    {
        return create.createScoperConceptDef({
            "conceptRef":name,
            "namespaceAddition": nsDef,
            "location":location()
        });
    }
    / name:classifierReference curly_begin namespaceReplacement:namespaceReplacement curly_end
        {
            return create.createScoperConceptDef({
                "conceptRef":name,
                "namespaceReplacement": namespaceReplacement,
                "location":location()
            });
        }

namespaceAddition = additionKey curly_begin list:singleNamespaceExpression+ curly_end
    {
        return create.createNamespaceAddition({ "expressions": list, "location": location() });
    }

namespaceReplacement = replacementNamespaceKey curly_begin list:singleNamespaceExpression+ curly_end
    {
        return create.createNamespaceReplacement({
            "expressions": list,
            "location": location()
        });
    }

singleNamespaceExpression = exp:langExpression ws recursive:recursiveKey? semicolon_separator
    {
        return create.createNamespaceExpression({
            "expression": exp,
            "recursive": (recursive?true:false),
            "location": location()
        });
    }
