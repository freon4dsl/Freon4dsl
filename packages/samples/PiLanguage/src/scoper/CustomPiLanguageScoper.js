"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPiLanguageScoper = void 0;
/**
 * Class 'CustomPiLanguageScoper' is meant to be a convient place to add any
 * custom code for scoping.
 */
var CustomPiLanguageScoper = /** @class */ (function () {
    function CustomPiLanguageScoper() {
    }
    CustomPiLanguageScoper.prototype.resolvePathName = function (modelelement, doNotSearch, pathname, metatype) {
        return undefined;
    };
    CustomPiLanguageScoper.prototype.isInScope = function (modelElement, name, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomPiLanguageScoper.prototype.getVisibleElements = function (modelelement, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomPiLanguageScoper.prototype.getFromVisibleElements = function (modelelement, name, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomPiLanguageScoper.prototype.getVisibleNames = function (modelelement, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomPiLanguageScoper.prototype.additionalNamespaces = function (element) {
        return undefined;
    };
    return CustomPiLanguageScoper;
}());
exports.CustomPiLanguageScoper = CustomPiLanguageScoper;
