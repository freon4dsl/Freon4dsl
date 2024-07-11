"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathInterpreter = void 0;
var mainInterpreter;
var MathInterpreter = /** @class */ (function () {
    function MathInterpreter(main) {
        mainInterpreter = main;
    }
    MathInterpreter.prototype.evaluateMultiply = function (node, ctx) {
        var leftValue = mainInterpreter.evaluate(node.piLeft(), ctx);
        var rightValue = mainInterpreter.evaluate(node.piRight(), ctx);
        return new Number(leftValue.valueOf() * rightValue.valueOf());
    };
    MathInterpreter.prototype.evaluatePlus = function (node, ctx) {
        // console.log("Execute Plus");
        var leftValue = mainInterpreter.evaluate(node.piLeft(), ctx);
        // console.log("Execute Plus left: " + leftValue);
        var rightValue = mainInterpreter.evaluate(node.piRight(), ctx);
        // console.log("Execute Plus right: " + rightValue);
        return new Number(leftValue.valueOf() + rightValue.valueOf());
    };
    return MathInterpreter;
}());
exports.MathInterpreter = MathInterpreter;
