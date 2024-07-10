"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMainInterpreter = void 0;
var InitBaseInterpreter_1 = require("./base/InitBaseInterpreter");
var InitFunctionsInterpreter_1 = require("./functions/InitFunctionsInterpreter");
var InitMathInterpreter_1 = require("./math/InitMathInterpreter");
function initMainInterpreter(main) {
    (0, InitBaseInterpreter_1.initBaseInterpreter)(main);
    (0, InitMathInterpreter_1.initMathInterpreter)(main);
    (0, InitFunctionsInterpreter_1.initFunctionsInterpreter)(main);
}
exports.initMainInterpreter = initMainInterpreter;
