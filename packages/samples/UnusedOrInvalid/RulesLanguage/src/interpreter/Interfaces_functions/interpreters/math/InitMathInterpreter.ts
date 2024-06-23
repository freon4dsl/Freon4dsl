import { IMainInterpreter } from "@freon4dsl/core";
import { Multiply, Plus } from "../../../../language/gen/index";
import { MathInterpreter } from "./MathInterpreter";

export function initMathInterpreter(main: IMainInterpreter){
    const interpreter = new MathInterpreter(main);
    main.registerFunction("Plus", interpreter.evaluatePlus);
    main.registerFunction("Multiply", interpreter.evaluateMultiply);
}
