/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 */

export * from "./PiLangUtil";
export * from "./PiLangConceptType";
export * from "./PiLangEveryConcept"
export * from "./PiLangScoper";
export * from "./PiMetaEnvironment";
export * from "./PiElementReference";
export * from "./PiLanguage";
export * from "./PiLangExpressions";
export * from "./PiLanguageChecker";
export * from "./PiLangExpressionChecker";

// Do not include PiElementReference.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
