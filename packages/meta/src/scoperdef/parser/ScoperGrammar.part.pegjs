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
namespaceKey = ws "namespace" ws
plus_separator = ws "+" ws

namespaces = isnamespaceKey curly_begin conceptRefs:(conceptRef)* ws curly_end
    { 
        return conceptRefs;
    }

conceptDefinition = name:conceptRef curly_begin nsDef:namespaceDefinition curly_end
    {
        return create.createScoperConceptDef({ "conceptRef":name, "namespaceDef":nsDef, "location":location() });
    }

namespaceDefinition = namespaceKey equals_separator list:expressionlist
    {
        return create.createNamespaceDef({ "expressions": list, "location":location() });
    }

expressionlist =
      head:langExpression
      tail:(plus_separator v:langExpression { return v; })*
      { return [head].concat(tail); }



