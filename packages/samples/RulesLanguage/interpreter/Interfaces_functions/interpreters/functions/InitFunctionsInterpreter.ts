import { IMainInterpreter } from "@freon4dsl/core";
import { FunctionsInterpreter } from "./FunctionsInterpreter";

export function initFunctionsInterpreter(main: IMainInterpreter){
    const interpreter = new FunctionsInterpreter(main);
    main.registerFunction("FunctionCall", interpreter.evaluateFunctionCall);
    main.registerFunction("RFunction", interpreter.evaluateRFunction);
    main.registerFunction("ParameterRef", interpreter.evaluateParameterRef);
}
