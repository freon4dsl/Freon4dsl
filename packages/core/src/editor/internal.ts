/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that boxes and other concepts are exported before the
 * concepts that are using them.
 */

export * from "./FreTableDefinition";
export * from "./boxes";
export * from "./actions";
export * from "./util";
export * from "./simplifiedBoxAPI";
export * from "./FreCombinedActions";
export * from "./FreStyle";

export * from "./projections";

// load FreEditor last, as it needs one or more of the above definitions
export * from "./FreEditor";
