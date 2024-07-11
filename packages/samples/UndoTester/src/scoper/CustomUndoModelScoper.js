"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomUndoModelScoper = void 0;
/**
 * Class 'CustomUndoModelScoper' is meant to be a convient place to add any
 * custom code for scoping.
 */
var CustomUndoModelScoper = /** @class */ (function () {
    function CustomUndoModelScoper() {
    }
    CustomUndoModelScoper.prototype.resolvePathName = function (modelelement, doNotSearch, pathname, metatype) {
        return undefined;
    };
    CustomUndoModelScoper.prototype.isInScope = function (modelElement, name, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomUndoModelScoper.prototype.getVisibleElements = function (modelelement, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomUndoModelScoper.prototype.getFromVisibleElements = function (modelelement, name, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomUndoModelScoper.prototype.getVisibleNames = function (modelelement, metatype, excludeSurrounding) {
        return undefined;
    };
    CustomUndoModelScoper.prototype.additionalNamespaces = function (element) {
        return undefined;
    };
    return CustomUndoModelScoper;
}());
exports.CustomUndoModelScoper = CustomUndoModelScoper;
