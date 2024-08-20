/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that base concepts are exported before the
 * concepts that are extending them.
 */

export * from "./AbstractExternalBox";
export * from "./AbstractExternalPropertyBox";
export * from "./AbstractPropertyWrapperBox";
export * from "./BooleanWrapperBox";
export * from "./ExternalBooleanBox";
export * from "./ExternalNumberBox";
export * from "./ExternalPartBox";
export * from "./ExternalPartListBox";
export * from "./ExternalRefBox";
export * from "./ExternalRefListBox";
export * from "./ExternalSimpleBox";
export * from "./ExternalStringBox";
export * from "./FragmentWrapperBox";
export * from "./NumberWrapperBox";
export * from "./PartWrapperBox";
export * from "./PartListWrapperBox";
export * from "./RefWrapperBox";
export * from "./RefListWrapperBox";
export * from "./StringWrapperBox";
