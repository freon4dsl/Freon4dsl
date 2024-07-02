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
exports.StudyConfigurationModelInterpreter = void 0;
// Generated my Freon once, will NEVER be overwritten.
var core_1 = require("@freon4dsl/core");
var StudyConfigurationModelInterpreterBase_1 = require("./gen/StudyConfigurationModelInterpreterBase");
var language = require("../language/gen/index");
var main;
/**
 * The class containing all interpreter functions twritten by thge language engineer.
 * This class is initially empty,  and will not be overwritten if it already exists..
 */
var StudyConfigurationModelInterpreter = /** @class */ (function (_super) {
    __extends(StudyConfigurationModelInterpreter, _super);
    function StudyConfigurationModelInterpreter(m) {
        var _this = _super.call(this) || this;
        main = m;
        return _this;
    }
    StudyConfigurationModelInterpreter.prototype.evalNumber = function (node, ctx) {
        return new core_1.RtNumber(node.value);
    };
    StudyConfigurationModelInterpreter.prototype.evalDay = function (node, ctx) {
        return new core_1.RtNumber(node.startDay);
    };
    StudyConfigurationModelInterpreter.prototype.evalWhen = function (node, ctx) {
        return main.evaluate(node.startWhen, ctx);
    };
    // Why have both StartDay and StudyStart?
    StudyConfigurationModelInterpreter.prototype.evalStudyStart = function (node, ctx) {
        return new core_1.RtNumber(1);
    };
    StudyConfigurationModelInterpreter.prototype.evalStartDay = function (node, ctx) {
        return new core_1.RtNumber(1);
    };
    StudyConfigurationModelInterpreter.prototype.evalEventReference = function (node, ctx) {
        // console.log("Entered evalEventReference");
        // console.log("evalEventReference node.$id: " + node.$id);
        // console.log("referenced event: " + node.$event);
        var timeline = ctx.find("timeline");
        var referencedEvent = node.$event;
        var lastInstanceOfReferencedEvent = timeline.getLastInstanceForThisEvent(referencedEvent);
        // console.log("evalEventReference reference to: " + referencedEvent.name + " lastInstanceOfReferencedEvent: " + lastInstanceOfReferencedEvent.day);
        return new core_1.RtNumber(lastInstanceOfReferencedEvent.startDay);
    };
    StudyConfigurationModelInterpreter.prototype.evalEventStart = function (node, ctx) {
        if (node instanceof language.Day) {
            console.log("evalEventStart: node is a Day");
            return main.evaluate(node, ctx);
        }
        else if (node instanceof language.When) {
            console.log("evalEventStart: node is a When");
            return main.evaluate(node, ctx);
        }
        else {
            console.log("evalEventSchedule: eventStart is not a Day or When");
            throw new core_1.RtError("evalEventSchedule: eventStart is not a Day");
        }
    };
    ///////////////// STANDARD EXPRESSIONS
    StudyConfigurationModelInterpreter.prototype.evalPlusExpression = function (node, ctx) {
        var left = main.evaluate(node.left, ctx);
        var right = main.evaluate(node.right, ctx);
        return left.plus(right);
    };
    StudyConfigurationModelInterpreter.prototype.evalEqualsExpression = function (node, ctx) {
        var left = main.evaluate(node.left, ctx);
        var right = main.evaluate(node.right, ctx);
        return (left).equals(right);
    };
    StudyConfigurationModelInterpreter.prototype.evalAndExpression = function (node, ctx) {
        var left = main.evaluate(node.left, ctx);
        var right = main.evaluate(node.right, ctx);
        return (left).and(right);
    };
    StudyConfigurationModelInterpreter.prototype.evalOrExpression = function (node, ctx) {
        var left = main.evaluate(node.left, ctx);
        var right = main.evaluate(node.right, ctx);
        return (left).or(right);
    };
    StudyConfigurationModelInterpreter.prototype.evalGreaterThenExpression = function (node, ctx) {
        var left = main.evaluate(node.left, ctx);
        var right = main.evaluate(node.right, ctx);
        return core_1.RtBoolean.of(left.value > right.value);
    };
    return StudyConfigurationModelInterpreter;
}(StudyConfigurationModelInterpreterBase_1.StudyConfigurationModelInterpreterBase));
exports.StudyConfigurationModelInterpreter = StudyConfigurationModelInterpreter;
