/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that the editor and boxes are exported before the
 * concepts that are using them.
 */

// language holds no dependencies upon other parts
export * from "./language";

// editor and util depend upon each other, and upon language
export * from "./util";
export * from "./editor";

// the following parts depend upon language
export * from "./environment";
export * from "./reader";
export * from "./scoper";
export * from "./storage";
export * from "./stdlib";
export * from "./typer";
export * from "./validator";
export * from "./writer";

// environment depends on most of the other parts
export * from "./environment";


