"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFunctionsInterpreter = void 0;
var FunctionsInterpreter_1 = require("./FunctionsInterpreter");
function initFunctionsInterpreter(main) {
    var interpreter = new FunctionsInterpreter_1.FunctionsInterpreter(main);
    main.registerFunction("FunctionCall", interpreter.evaluateFunctionCall);
    main.registerFunction("RFunction", interpreter.evaluateRFunction);
    main.registerFunction("ParameterRef", interpreter.evaluateParameterRef);
}
exports.initFunctionsInterpreter = initFunctionsInterpreter;
