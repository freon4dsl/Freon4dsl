"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesInterpreter = void 0;
var core_1 = require("@freon4dsl/core");
var InitMainInterpreter_1 = require("./InitMainInterpreter");
var getPropertyFunction = function (node) {
    return node.piOwnerDescriptor().propertyName;
};
/**
 * Function that returns the concept name for `node`.
 * Used by the interpreter to find which evaluator should be use for each node.
 */
var getConceptFunction = function (node) {
    if (node === undefined) {
        return "";
    }
    return node.piLanguageConcept();
};
/**
 * The facade around the actual interpreter to avoid improper usage.
 * Sets the functions used to access the expression tree.
 * Ensures all internal interpreter state is cleaned when creating a new instance.
 */
var RulesInterpreter = /** @class */ (function () {
    function RulesInterpreter() {
        if (RulesInterpreter.main === null) {
            RulesInterpreter.main = core_1.MainInterpreter.instance(InitMainInterpreter_1.initMainInterpreter, getConceptFunction, getPropertyFunction);
        }
    }
    RulesInterpreter.prototype.setTracing = function (value) {
        RulesInterpreter.main.setTracing(value);
    };
    RulesInterpreter.prototype.getTrace = function () {
        return RulesInterpreter.main.getTrace();
    };
    RulesInterpreter.prototype.evaluate = function (node) {
        RulesInterpreter.main.reset();
        return RulesInterpreter.main.evaluate(node, core_1.InterpreterContext.EMPTY_CONTEXT);
    };
    RulesInterpreter.main = null;
    return RulesInterpreter;
}());
exports.RulesInterpreter = RulesInterpreter;
