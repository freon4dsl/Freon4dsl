/**
 * This index deploys the pattern from Michael Weststrate
 * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
 * in order to avoid problem with circular imports.
 *
 * The exports are sorted such that basic concepts are recursive before the
 * concepts that are using them.
 */

// dependent only upon editor
export * from "./MatchUtil.js";

// the rest of this package depends on FreUtils
export * from "./FreUtils.js";

// the others
export * from "./BalanceTreeUtils.js";

export * from "./IdProvider.js";
export * from "./SimpleIdProvider.js";
export * from "./Json.js";
