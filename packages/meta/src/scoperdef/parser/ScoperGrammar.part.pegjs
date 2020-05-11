// This is a partial grammar file
// Needs to be concatenated with the Basic and Expression grammars
// The necessary require statements for all grammars should be defined here
{
    let create = require("./ScoperCreators");
    let expCreate = require("../../languagedef/parser/ExpressionCreators");
}

Scoper_Definition
  = ws "scoper" ws scoperName:var ws "for" ws "language" ws languageName:var ws ns:namespaces defs:conceptDefinition*
    {
        return create.createScopeDef({
            "scoperName": scoperName,
            "languageName": languageName,
            "namespaces": ns,
            "scopeConceptDefs": defs,
            "location": location()
        });
    } 

isnamespaceKey = ws "isnamespace" ws
additionKey = ws "namespace_addition" ws
alternativeScopeKey = ws "scope" ws

namespaces = isnamespaceKey curly_begin conceptRefs:(
                                              head:conceptRef
                                              tail:(comma_separator v:conceptRef { return v; })*
                                              { return [head].concat(tail); }
                                            ) ws curly_end
    { 
        return conceptRefs;
    }

conceptDefinition = name:conceptRef curly_begin nsDef:namespaceAddition? alternativeScope:alternativeScope? curly_end
    {
        return create.createScoperConceptDef({
            "conceptRef":name,
            "namespaceAdditions": nsDef,
            "alternativeScope": alternativeScope,
            "location":location()
        });
    }

namespaceAddition = additionKey equals_separator list:expressionlist semicolon_separator
    {
        return create.createNamespaceDef({ "expressions": list, "location":location() });
    }

expressionlist =
      head:langExpression
      tail:(plus_separator v:langExpression { return v; })*
      { return [head].concat(tail); }

alternativeScope = alternativeScopeKey equals_separator exp:langExpression semicolon_separator
    {
        return create.createAlternativeScope({
            "expression": exp,
            "location": location()
        });
    }


