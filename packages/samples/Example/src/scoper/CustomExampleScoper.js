"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomExampleScoper = void 0;
/**
 * Class 'CustomExampleScoper' is meant to be a convient place to add any
 * custom code for scoping.
 */
var CustomExampleScoper = /** @class */ (function () {
    function CustomExampleScoper() {
    }
    CustomExampleScoper.prototype.resolvePathName = function (modelelement, doNotSearch, pathname, metatype) {
        return undefined;
    };
    CustomExampleScoper.prototype.isInScope = function (modelElement, name, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomExampleScoper.prototype.getVisibleElements = function (modelelement, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomExampleScoper.prototype.getFromVisibleElements = function (modelelement, name, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomExampleScoper.prototype.getVisibleNames = function (modelelement, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomExampleScoper.prototype.additionalNamespaces = function (element) {
        return undefined;
    };
    return CustomExampleScoper;
}());
exports.CustomExampleScoper = CustomExampleScoper;
