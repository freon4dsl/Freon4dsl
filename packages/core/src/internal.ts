/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that the editor and boxes are recursive before the
 * concepts that are using them.
 */

// ast and logging depends on nothing
export * from "./logging/index.js";
export * from "./ast/index.js";
// language holds dependencies on ast, editor, and util
export * from "./language/index.js";
// ast-utils depends on language, ast, util
export * from "./ast-utils/index.js";

// editor and util depend upon each other, and upon language
export * from "./util/index.js";
export * from "./editor/index.js";

// the following parts depend upon language and ast
export * from "./environment/index.js";
export * from "./reader/index.js";
export * from "./scoper/index.js";
export * from "./searchers/index.js";
export * from "./storage/index.js";
export * from "./stdlib/index.js";
export * from "./typer/index.js";
export * from "./validator/index.js";
export * from "./writer/index.js";

// environment depends on most of the other parts
export * from "./environment/index.js";

// change manager
export * from "./change-manager/index.js";

export * from "./interpreter/index.js";
