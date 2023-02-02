import {
    FreBinaryExpressionConcept,
    FreConcept,
    FreModelDescription,
    FreUnitDescription,
    FreConceptProperty,
    FreExpressionConcept,
    FreInstance,
    FreInterface,
    FreFunction,
    FreParameter,
    FreLanguage,
    FreLimitedConcept,
    FrePrimitiveProperty,
    FreProperty,
    FreInstanceProperty,
    FreClassifier,
    FreLangElement
} from "./internal";

export type FreLangEveryConcept =
    | FreLangElement
    | FreLanguage
    | FreClassifier
    | FreModelDescription
    | FreUnitDescription
    | FreInterface
    | FreConcept
    | FreExpressionConcept
    | FreBinaryExpressionConcept
    | FreLimitedConcept
    | FreProperty
    | FreConceptProperty
    | FrePrimitiveProperty
    | FreInstance
    | FreInstanceProperty
    | FreFunction
    | FreParameter;
