import { InterpreterContext } from "@freon4dsl/core";
import { NumberLiteral } from "../../../../language/gen/index";

export interface IBaseInterpreter {
    evaluateNumberLiteral(node: NumberLiteral, ctx: InterpreterContext): Object;
}
