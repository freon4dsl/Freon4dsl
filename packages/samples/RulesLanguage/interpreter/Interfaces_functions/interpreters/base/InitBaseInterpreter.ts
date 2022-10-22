import { IMainInterpreter } from "@projectit/core";
import { BaseInterpreter } from "./BaseInterpreter";

export function initBaseInterpreter(main: IMainInterpreter){
    const interpreter = new BaseInterpreter(main);
    main.registerFunction("NumberLiteral", interpreter.evaluateNumberLiteral);
}
