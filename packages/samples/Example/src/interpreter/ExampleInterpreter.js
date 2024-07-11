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
exports.ExampleInterpreter = void 0;
// Generated my Freon once, will NEVER be overwritten.
var core_1 = require("@freon4dsl/core");
var ExampleInterpreterBase_1 = require("./gen/ExampleInterpreterBase");
var main;
/**
 * The class containing all interpreter functions twritten by thge language engineer.
 * This class is initially empty,  and will not be overwritten if it already exists..
 */
var ExampleInterpreter = /** @class */ (function (_super) {
    __extends(ExampleInterpreter, _super);
    function ExampleInterpreter(m) {
        var _this = _super.call(this) || this;
        main = m;
        return _this;
    }
    ExampleInterpreter.prototype.evalBooleanLiteralExpression = function (node, ctx) {
        return core_1.RtBoolean.of(node.value);
    };
    ExampleInterpreter.prototype.evalNumberLiteralExpression = function (node, ctx) {
        return new core_1.RtNumber(node.value);
    };
    ExampleInterpreter.prototype.evalPlusExpression = function (node, ctx) {
        var left = main.evaluate(node.left, ctx);
        var right = main.evaluate(node.right, ctx);
        return left.plus(right);
    };
    ExampleInterpreter.prototype.evalEqualsExpression = function (node, ctx) {
        var left = main.evaluate(node.left, ctx);
        var right = main.evaluate(node.right, ctx);
        return (left).equals(right);
    };
    return ExampleInterpreter;
}(ExampleInterpreterBase_1.ExampleInterpreterBase));
exports.ExampleInterpreter = ExampleInterpreter;
