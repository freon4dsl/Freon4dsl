"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANUAL_CUSTOM_ACTIONS = exports.MANUAL_BINARY_EXPRESSION_ACTIONS = exports.CustomPiLanguageActions = void 0;
/**
 * Class CustomPiLanguageActions provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These custom build additions are merged with the default and definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */
var CustomPiLanguageActions = /** @class */ (function () {
    function CustomPiLanguageActions() {
        this.binaryExpressionActions = exports.MANUAL_BINARY_EXPRESSION_ACTIONS;
        this.customActions = exports.MANUAL_CUSTOM_ACTIONS;
    }
    return CustomPiLanguageActions;
}());
exports.CustomPiLanguageActions = CustomPiLanguageActions;
exports.MANUAL_BINARY_EXPRESSION_ACTIONS = [
// Add your own custom binary expression actions here
];
exports.MANUAL_CUSTOM_ACTIONS = [
// Add your own custom behavior here
];
