"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesLanguageInterpreter = void 0;
// Generated by the ProjectIt Language Generator.
var core_1 = require("@freon4dsl/core");
var RulesLanguageInterpreterBase_1 = require("./gen/RulesLanguageInterpreterBase");
var main;
var RulesLanguageInterpreter = /** @class */ (function (_super) {
    __extends(RulesLanguageInterpreter, _super);
    function RulesLanguageInterpreter(m) {
        var _this = _super.call(this) || this;
        main = m;
        return _this;
    }
    RulesLanguageInterpreter.prototype.evalMultiply = function (node, ctx) {
        var leftValue = main.evaluate(node.piLeft(), ctx);
        var rightValue = main.evaluate(node.piRight(), ctx);
        if ((0, core_1.isRtNumber)(leftValue)) {
            return leftValue.multiply(rightValue);
        }
        return new core_1.RtError("Multiply type error: " + rightValue.rtType);
    };
    RulesLanguageInterpreter.prototype.evalPlus = function (node, ctx) {
        var leftValue = main.evaluate(node.piLeft(), ctx);
        var rightValue = main.evaluate(node.piRight(), ctx);
        if ((0, core_1.isRtNumber)(leftValue)) {
            return leftValue.plus(rightValue);
        }
        else if ((0, core_1.isRtString)(leftValue)) {
            return leftValue.plus(rightValue);
        }
        else if ((0, core_1.isRtEmpty)(rightValue)) {
            return leftValue;
        }
        return new core_1.RtError("Plus type eror");
    };
    RulesLanguageInterpreter.prototype.evalFunctionCall = function (node, ctx) {
        var newContext = new core_1.InterpreterContext(ctx);
        node.arguments.forEach(function (argument, index) {
            var argValue = main.evaluate(argument, ctx);
            newContext.set(node.func.referred.parameters[index], argValue);
        });
        var result = main.evaluate(node.func.referred, newContext);
        return result;
    };
    RulesLanguageInterpreter.prototype.evalRFunction = function (node, ctx) {
        var result = main.evaluate(node.body, ctx);
        return result;
    };
    RulesLanguageInterpreter.prototype.evalParameterRef = function (node, ctx) {
        var result = ctx.find(node.par.referred);
        return result;
    };
    RulesLanguageInterpreter.prototype.evalNumberLiteral = function (node, ctx) {
        // if( node.value === "3") {
        //     return new RtError("33333 error");
        //     throw new RtError("33333333");
        // }
        return new core_1.RtNumber(Number.parseFloat(node.value));
        ;
    };
    return RulesLanguageInterpreter;
}(RulesLanguageInterpreterBase_1.RulesLanguageInterpreterBase));
exports.RulesLanguageInterpreter = RulesLanguageInterpreter;
