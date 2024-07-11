"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBaseInterpreter = void 0;
var BaseInterpreter_1 = require("./BaseInterpreter");
function initBaseInterpreter(main) {
    var interpreter = new BaseInterpreter_1.BaseInterpreter(main);
    main.registerFunction("NumberLiteral", interpreter.evaluateNumberLiteral);
}
exports.initBaseInterpreter = initBaseInterpreter;
