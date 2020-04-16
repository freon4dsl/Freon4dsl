// This is a partial grammar file
// Needs to be concatenated with the Basic and Expression grammars
// The neccesary require statements for all grammars should be defined here
{
    let create = require("./ScoperCreators");
    let expCreate = require("../../languagedef/parser/ExpressionCreators");
}

Scoper_Definition
  = ws "scoper" ws scoperName:var ws "for" ws "language" ws languageName:var ws ns:(namespace)* defs:conceptDefinition*
    {
        return create.createScopeDef({
            "scoperName": scoperName,
            "languageName": languageName,
            "namespaces": ns,
            "location": location()
        });
    } 

isnamespaceKey = ws "isnamespace" ws
namespaceKey = ws "namespace" ws
plus_separator = ws "+" ws

namespace = isnamespaceKey curly_begin conceptRefs:(conceptRef)* ws curly_end
    { 
        return create.createNamespace({ "conceptRefs": conceptRefs, "location": location() });
    }

conceptDefinition = name:var curly_begin namespaceDefinition curly_end

namespaceDefinition = namespaceKey list:expressionlist

expressionlist = langExpression (plus_separator langExpression)+


