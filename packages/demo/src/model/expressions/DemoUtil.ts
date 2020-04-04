import { PiBinaryExpression } from "@projectit/core";
import { DemoComparisonExpression } from "@projectit/demo";

export function symbol(exp: PiBinaryExpression){
    switch( exp.piLanguageConcept()) {
        case "DemoPlusExpression": return "+";
        case "DemoMultiplyExpression": return "*";
        case "DemoDivideExpression": return "/";
        case "DemoAndExpression": return "and";
        case "DemoOrExpression": return "or";
        case "DemoEqualExpression": return "==";
        case "DemoPowerExpression": return "^";
        case "DemoComparisonExpression": return(exp as DemoComparisonExpression).comparisonType
        // case "DemoComparisonExpression": return(exp as DemoComparisonExpression).comparisonType
    }
    return "BIN-EXP";
}
