{{
import * as expCreate from "./ExpressionCreators.js"
}}

LanguageExpressions_Definition
  = ws "expressions" ws "for" ws "language" ws languageName:var ws cr:(conceptExps)*
    {
        return expCreate.createTest({
            "languageName": languageName,
            "conceptExps": cr,
            "location": location()
        });
    }

conceptExps = classifierRef:classifierReference ws curly_begin ws exps:expWithSeparator* curly_end
    {
        return expCreate.createClassifierExps({
          "classifierRef": classifierRef,
          "exps": exps,
          "location": location()
        });
    }


expWithSeparator = exp:langExpression semicolon_separator { return exp; }
