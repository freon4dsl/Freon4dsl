import { InterpreterContext } from "@projectit/core";
import { FunctionCall, RFunction } from "../../../../language/gen/index";

export interface IFunctionsInterpreter {
    evaluateFunctionCall(node: FunctionCall, ctx: InterpreterContext): Object;
    evaluateRFunction(node: RFunction, ctx: InterpreterContext): Object;
}
