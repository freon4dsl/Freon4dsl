import { IMainInterpreter } from "@projectit/core";
import { FunctionsInterpreter } from "./FunctionsInterpreter";

export function initFunctionsInterpreter(main: IMainInterpreter){
    const interpreter = new FunctionsInterpreter(main);
    main.registerFunction("FunctionCall", interpreter.evaluateFunctionCall);
    main.registerFunction("RFunction", interpreter.evaluateRFunction);
    main.registerFunction("ParameterRef", interpreter.evaluateParameterRef);
}
