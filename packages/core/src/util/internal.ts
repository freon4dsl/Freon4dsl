/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that basic concepts are exported before the
 * concepts that are using them.
 */

// dependent only upon editor
export * from "./MatchUtil";

// the rest of this package depends on FreUtils
export * from "./FreUtils";

// the others
export * from "./BalanceTreeUtils";

export * from "./IdProvider";
export * from "./SimpleIdProvider";
export * from "./Json";
