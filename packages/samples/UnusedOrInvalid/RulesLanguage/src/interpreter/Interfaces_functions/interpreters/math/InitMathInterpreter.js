"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMathInterpreter = void 0;
var MathInterpreter_1 = require("./MathInterpreter");
function initMathInterpreter(main) {
    var interpreter = new MathInterpreter_1.MathInterpreter(main);
    main.registerFunction("Plus", interpreter.evaluatePlus);
    main.registerFunction("Multiply", interpreter.evaluateMultiply);
}
exports.initMathInterpreter = initMathInterpreter;
