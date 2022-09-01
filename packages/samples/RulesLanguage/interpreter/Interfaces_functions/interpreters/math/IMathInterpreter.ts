import { InterpreterContext } from "@projectit/core";
import { Multiply, Plus } from "../../../../language/gen/index";

export interface IMathInterpreter {
    evaluatePlus(node: Plus, ctx: InterpreterContext): Object;
    evaluateMultiply(node: Multiply, ctx: InterpreterContext): Object;
}
