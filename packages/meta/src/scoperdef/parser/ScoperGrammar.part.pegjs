// This is a partial grammar file.
// Needs to be concatenated with the Basic and Expression grammars.
// The necessary import statements for all grammars should be defined here:
{{
import * as create from "./ScoperCreators.js";
import * as expCreate from "../../langexpressions/parser/ExpressionCreators.js";
}}

Scoper_Definition
  = ws "scoper" ws "for" ws "language" ws languageName:var ws ns:namespaces defs:conceptDefinition*
    {
        return create.createScopeDef({
            "languageName"      :languageName,
            "namespaces"        :ns,
            "scopeConceptDefs"  :defs,
            "location"          :location()
        });
    } 

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
            "classifierRef"     :name,
            "namespaceAddition" :nsDef,
            "location"          :location()
        });
    }
    / name:classifierReference curly_begin namespaceReplacement:namespaceReplacement curly_end
        {
            return create.createScoperConceptDef({
                "classifierRef"         :name,
                "namespaceReplacement"  :namespaceReplacement,
                "location"              :location()
            });
        }

namespaceAddition = additionKey curly_begin list:singleNamespaceExpression+ curly_end
    {
        return create.createNamespaceAddition({
            "expressions"   :list,
            "location"      :location()
        });
    }

namespaceReplacement = replacementNamespaceKey curly_begin list:singleNamespaceExpression+ curly_end
    {
        return create.createNamespaceReplacement({
            "expressions"   :list,
            "location"      :location()
        });
    }

singleNamespaceExpression = recursive:recursiveKey? exp:langExpression semicolon_separator
    {
        return create.createNamespaceExpression({
            "expression"    :exp,
            "recursive"     :(recursive?true:false),
            "location"      :location()
        });
    }

isnamespaceKey          = "isNamespace" rws
additionKey             = "imports" rws
replacementNamespaceKey = "alternatives" rws
recursiveKey            = "recursive" ws
