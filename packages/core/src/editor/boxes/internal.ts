/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that base concepts are exported before the
 * concepts that are extending them.
 */

export * from "./Box";

// the following classes directly inherit from Box
export * from "./AbstractChoiceBox";
export * from "./GridBox";
export * from "./IndentBox";
export * from "./LabelBox";
export * from "./ListBox";
export * from "./AliasBox"; // inherits from AbstractChoiceBox, is needed in OptionalBox
export * from "./OptionalBox";
export * from "./SvgBox";
export * from "./TextBox";
export * from "./SelectBox";
export * from "./BoxFactory";

// the following files contain export that do not depend on any other file
export * from "./SelectOption";
export * from "./ChoiceTextHelper";
