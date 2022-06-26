/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that the editor and boxes are exported before the
 * concepts that are using them.
 */

// ast and logging depends on nothing
export * from "./logging";
export * from "./ast";
// language holds dependencies on ast, editor, and util
export * from "./language";
// ast-utils depends on language, ast, util
export * from "./ast-utils";

// editor and util depend upon each other, and upon language
export * from "./util";
export * from "./editor";

// the following parts depend upon language and ast
export * from "./environment";
export * from "./reader";
export * from "./scoper";
export * from "./searchers";
export * from "./storage";
export * from "./stdlib";
export * from "./typer";
export * from "./validator";
export * from "./writer";

// environment depends on most of the other parts
export * from "./environment";

// change manager
export * from "./change-manager";


