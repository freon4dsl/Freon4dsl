"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseInterpreter = void 0;
var mainInterpreter;
var BaseInterpreter = /** @class */ (function () {
    function BaseInterpreter(main) {
        mainInterpreter = main;
    }
    BaseInterpreter.prototype.evaluateNumberLiteral = function (node, ctx) {
        return new Number(node.value);
        ;
    };
    return BaseInterpreter;
}());
exports.BaseInterpreter = BaseInterpreter;
