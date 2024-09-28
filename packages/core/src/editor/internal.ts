/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that boxes and other concepts are exported before the
 * concepts that are using them.
 */

export * from "./FreTableDefinition.js";
export * from "./boxes/index.js";
export * from "./actions/index.js";
export * from "./util/index.js";
export * from "./simplifiedBoxAPI/index.js";
export * from "./FreCombinedActions.js";
export * from "./FreStyle.js";

export * from "./projections/index.js";

// load FreEditor last, as it needs one or more of the above definitions
export * from "./FreEditor.js";
