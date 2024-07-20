/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that the editor and boxes are exported before the
 * concepts that are using them.
 */

// ast and logging depends on nothing
export * from "./logging/index";
export * from "./ast/index";
// language holds dependencies on ast, editor, and util
export * from "./language/index";
// ast-utils depends on language, ast, util
export * from "./ast-utils/index";

// editor and util depend upon each other, and upon language
export * from "./util/index";
export * from "./editor/index";

// the following parts depend upon language and ast
export * from "./environment/index";
export * from "./reader/index";
export * from "./scoper/index";
export * from "./searchers/index";
export * from "./storage/index";
export * from "./stdlib/index";
export * from "./typer/index";
export * from "./validator/index";
export * from "./writer/index";

// environment depends on most of the other parts
export * from "./environment/index";

// change manager
export * from "./change-manager/index";

export * from "./interpreter/index";
