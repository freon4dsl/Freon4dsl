import { IMainInterpreter } from "@freon4dsl/core";
import { BaseInterpreter } from "./BaseInterpreter";

export function initBaseInterpreter(main: IMainInterpreter){
    const interpreter = new BaseInterpreter(main);
    main.registerFunction("NumberLiteral", interpreter.evaluateNumberLiteral);
}
