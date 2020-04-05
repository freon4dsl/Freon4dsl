{
    let create = require("./ScoperCreators");
    let expCreate = require("../../languagedef/parser/LanguageExpressionCreators");
}

Scoper_Definition
  = ws "scoper" ws scoperName:var ws "for" ws "language" ws languageName:var ws ns:(namespace)*
    {
        return create.createScopeDef({
            "scoperName": scoperName,
            "languageName": languageName,
            "namespaces": ns,
        });
    } 

namespaceKey = "namespace" ws

namespace = namespaceKey curly_begin conceptRefs:(conceptRef)* ws curly_end 
    { 
        return create.createNamespace({ "conceptRefs": conceptRefs }); 
    }

conceptRef = name:var { return create.createConceptReference( { "name": name}); }



