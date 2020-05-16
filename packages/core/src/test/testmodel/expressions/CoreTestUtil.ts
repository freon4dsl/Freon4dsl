import { PiBinaryExpression } from "../../../language";
import { CoretestComparisonExpression } from "./CoretestComparisonExpression";

export function symbol(exp: PiBinaryExpression){
    switch( exp.piLanguageConcept()) {
        case "CoreTestPlusExpression": return "+";
        case "CoreTestMultiplyExpression": return "*";
        case "CoreTestDivideExpression": return "/";
        case "CoreTestAndExpression": return "and";
        case "CoreTestOrExpression": return "or";
        case "CoreTestEqualExpression": return "==";
        case "CoreTestPowerExpression": return "^";
        case "CoreTestComparisonExpression": return(exp as CoretestComparisonExpression).comparisonType
        // case "CoretestComparisonExpression": return(exp as CoretestComparisonExpression).comparisonType
    }
    return "BIN-EXP";
}
