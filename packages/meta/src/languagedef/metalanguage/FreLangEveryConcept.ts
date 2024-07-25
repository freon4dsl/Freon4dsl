import {
    FreMetaBinaryExpressionConcept,
    FreMetaConcept,
    FreMetaModelDescription,
    FreMetaUnitDescription,
    FreMetaConceptProperty,
    FreMetaExpressionConcept,
    FreMetaInstance,
    FreMetaInterface,
    FreMetaFunction,
    FreMetaParameter,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    FreMetaPrimitiveProperty,
    FreMetaProperty,
    FreMetaInstanceProperty,
    FreMetaClassifier,
    FreMetaLangElement
} from "./internal.js";

export type FreLangEveryConcept =
    | FreMetaLangElement
    | FreMetaLanguage
    | FreMetaClassifier
    | FreMetaModelDescription
    | FreMetaUnitDescription
    | FreMetaInterface
    | FreMetaConcept
    | FreMetaExpressionConcept
    | FreMetaBinaryExpressionConcept
    | FreMetaLimitedConcept
    | FreMetaProperty
    | FreMetaConceptProperty
    | FreMetaPrimitiveProperty
    | FreMetaInstance
    | FreMetaInstanceProperty
    | FreMetaFunction
    | FreMetaParameter;
