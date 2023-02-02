import { InterpreterContext } from "@freon4dsl/core";
import { FunctionCall, RFunction } from "../../../../language/gen/index";

export interface IFunctionsInterpreter {
    evaluateFunctionCall(node: FunctionCall, ctx: InterpreterContext): Object;
    evaluateRFunction(node: RFunction, ctx: InterpreterContext): Object;
}
