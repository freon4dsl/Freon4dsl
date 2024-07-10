"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionsInterpreter = void 0;
var core_1 = require("@freon4dsl/core");
var mainInterpreter;
var FunctionsInterpreter = /** @class */ (function () {
    function FunctionsInterpreter(main) {
        mainInterpreter = main;
    }
    FunctionsInterpreter.prototype.evaluateFunctionCall = function (node, ctx) {
        var newContext = new core_1.InterpreterContext(ctx);
        node.arguments.forEach(function (argument, index) {
            var argValue = mainInterpreter.evaluate(argument, ctx);
            newContext.set(node.func.referred.parameters[index], argValue);
        });
        var result = mainInterpreter.evaluate(node.func.referred, newContext);
        return result;
    };
    FunctionsInterpreter.prototype.evaluateRFunction = function (node, ctx) {
        var result = mainInterpreter.evaluate(node.body, ctx);
        // console.log("result of funccall is " + result)
        return result;
    };
    FunctionsInterpreter.prototype.evaluateParameterRef = function (node, ctx) {
        var result = ctx.find(node.par.referred);
        // console.log("ParRef result is " + result)
        return result;
    };
    return FunctionsInterpreter;
}());
exports.FunctionsInterpreter = FunctionsInterpreter;
