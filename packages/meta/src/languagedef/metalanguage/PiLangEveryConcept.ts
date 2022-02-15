import {
    PiBinaryExpressionConcept,
    PiConcept,
    PiModelDescription,
    PiUnitDescription,
    PiConceptProperty,
    PiExpressionConcept,
    PiInstance,
    PiInterface,
    PiFunction,
    PiParameter,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiProperty,
    PiInstanceProperty,
    PiClassifier,
    PiLangElement
} from "./internal";

export type PiLangEveryConcept =
    | PiLangElement
    | PiLanguage
    | PiClassifier
    | PiModelDescription
    | PiUnitDescription
    | PiInterface
    | PiConcept
    | PiExpressionConcept
    | PiBinaryExpressionConcept
    | PiLimitedConcept
    | PiProperty
    | PiConceptProperty
    | PiPrimitiveProperty
    | PiInstance
    | PiInstanceProperty
    | PiFunction
    | PiParameter;
