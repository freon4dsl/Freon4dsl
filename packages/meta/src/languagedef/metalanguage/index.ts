/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 */

export {
    PiLangConceptType,
    PiLangEveryConcept,
    PiLanguage,
    PiLangElement,
    PiConcept,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiInstanceExp,
    PiInstance,
    PiClassifier,
    PiBinaryExpressionConcept,
    PiExpressionConcept,
    PiLangExp,
    PiConceptProperty,
    PiFunction,
    PiInterface,
    PiLangAppliedFeatureExp,
    PiLangConceptExp,
    PiLangFunctionCallExp,
    PiLangSelfExp,
    PiLangSimpleExp,
    PiPrimitiveType,
    PiParameter,
    PiProperty,
    PiPropertyInstance,
    PiLanguageChecker,
    PiLangExpressionChecker,
    PiMetaEnvironment,
    PiLangScoper,
    PiLangUtil,
    PiElementReference,
} from "./internal";


// TODO find out whether this import still has problems
// Do not include PiElementReference.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript




