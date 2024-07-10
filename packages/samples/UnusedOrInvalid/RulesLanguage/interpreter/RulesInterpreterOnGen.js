"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesInterpreterOnGen = void 0;
var core_1 = require("@freon4dsl/core");
var RulesLanguageInterpreterInit_1 = require("./gen/RulesLanguageInterpreterInit");
var getPropertyFunction = function (node) {
    var index = node.piOwnerDescriptor().propertyIndex;
    return node.piOwnerDescriptor().propertyName + (index !== undefined ? "[" + index + "]" : "");
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
var RulesInterpreterOnGen = /** @class */ (function () {
    function RulesInterpreterOnGen() {
        if (RulesInterpreterOnGen.main === null) {
            RulesInterpreterOnGen.main = core_1.MainInterpreter.instance(RulesLanguageInterpreterInit_1.RulesLanguageInterpreterInit, getConceptFunction, getPropertyFunction);
        }
    }
    RulesInterpreterOnGen.prototype.setTracing = function (value) {
        RulesInterpreterOnGen.main.setTracing(value);
    };
    RulesInterpreterOnGen.prototype.getTrace = function () {
        return RulesInterpreterOnGen.main.getTrace();
    };
    RulesInterpreterOnGen.prototype.evaluate = function (node) {
        RulesInterpreterOnGen.main.reset();
        return RulesInterpreterOnGen.main.evaluate(node, core_1.InterpreterContext.EMPTY_CONTEXT);
    };
    RulesInterpreterOnGen.main = null;
    return RulesInterpreterOnGen;
}());
exports.RulesInterpreterOnGen = RulesInterpreterOnGen;
