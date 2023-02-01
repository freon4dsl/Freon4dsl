import { IMainInterpreter } from "@projectit/core";
import { initBaseInterpreter } from "./base/InitBaseInterpreter";
import { initFunctionsInterpreter } from "./functions/InitFunctionsInterpreter";
import { initMathInterpreter as im } from "./math/InitMathInterpreter";

export function initMainInterpreter(main: IMainInterpreter): void {
    initBaseInterpreter(main);
    im(main);
    initFunctionsInterpreter(main);
}
