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
additionKey             = "namespace_addition" rws
replacementNamespaceKey = "namespace_replacement" rws
reexportKey             = ws "re_export" ws

namespaces = isnamespaceKey curly_begin conceptRefs:(
                                              head:classifierReference
                                              tail:(comma_separator v:classifierReference { return v; })*
                                              { return [head].concat(tail); }
                                            ) ws curly_end
    {
        return conceptRefs;
    }

conceptDefinition = name:classifierReference curly_begin nsDef:namespaceAddition namespaceReplacement:namespaceReplacement? curly_end
    {
        return create.createScoperConceptDef({
            "conceptRef":name,
            "namespaceAddition": nsDef,
            "namespaceReplacement": namespaceReplacement,
            "location":location()
        });
    }
    / name:classifierReference curly_begin namespaceReplacement:namespaceReplacement nsDef:namespaceAddition? curly_end
        {
            return create.createScoperConceptDef({
                "conceptRef":name,
                "namespaceAddition": nsDef,
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

singleNamespaceExpression = exp:langExpression reexport:reexportKey? semicolon_separator
    {
        return create.createNamespaceExpression({
            "expression": exp,
            "reexport": (reexport?true:false),
            "location": location()
        });
    }
