import {
    PiBinaryExpressionConcept,
    PiConcept,
    PiConceptProperty,
    PiExpressionConcept,
    PiInstance,
    PiInterface,
    PiFunction,
    PiParameter,
    PiLanguageUnit,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiProperty,
    PiPropertyInstance,
    PiClassifier
} from "./PiLanguage";
import { PiLangElement } from "./PiLanguage";

export type PiLangEveryConcept =
    | PiLangElement
    | PiLanguageUnit
    | PiClassifier
    | PiInterface
    | PiConcept
    | PiExpressionConcept
    | PiBinaryExpressionConcept
    | PiLimitedConcept
    | PiProperty
    | PiConceptProperty
    | PiPrimitiveProperty
    | PiInstance
    | PiPropertyInstance
    | PiFunction
    | PiParameter;
