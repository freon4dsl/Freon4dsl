import { IMainInterpreter, InterpreterContext } from "@projectit/core";
import { FunctionCall, ParameterRef, RFunction, RuleExpression } from "../../../../language/gen/index";
import { IFunctionsInterpreter } from "./IFunctionsInterpreter";

let mainInterpreter: IMainInterpreter;

export class FunctionsInterpreter implements IFunctionsInterpreter {

    constructor(main: IMainInterpreter) {
        mainInterpreter = main;
    }

    evaluateFunctionCall(node: FunctionCall, ctx: InterpreterContext): Object {
        const newContext = new InterpreterContext(ctx);
        node.arguments.forEach((argument: RuleExpression, index: number) => {
            const argValue = mainInterpreter.evaluate(argument, ctx);
            newContext.set(node.func.referred.parameters[index], argValue);
        });
        const result = mainInterpreter.evaluate(node.func.referred, newContext);
        return result;
    }

    evaluateRFunction(node: RFunction, ctx: InterpreterContext): Object {
        const result = mainInterpreter.evaluate(node.body, ctx);
        // console.log("result of funccall is " + result)
        return result;
    }

    evaluateParameterRef(node: ParameterRef, ctx: InterpreterContext): Object {
        const result = ctx.find(node.par.referred);
        // console.log("ParRef result is " + result)
        return result;
    }


}
