import { IMainInterpreter, InterpreterContext } from "@freon4dsl/core";
import { Multiply, Plus } from "../../../../language/gen/index";
import { IMathInterpreter } from "./IMathInterpreter";

let mainInterpreter: IMainInterpreter;

export class MathInterpreter implements IMathInterpreter {

    constructor(main: IMainInterpreter) {
        mainInterpreter = main;
    }

    evaluateMultiply(node: Multiply, ctx: InterpreterContext): Object {
        const leftValue = mainInterpreter.evaluate(node.piLeft(), ctx) as Number;
        const rightValue = mainInterpreter.evaluate(node.piRight(), ctx) as Number;
        return new Number(leftValue.valueOf() * rightValue.valueOf());
    }

    evaluatePlus(node: Plus, ctx: InterpreterContext): Object {
        // console.log("Execute Plus");
        const leftValue = mainInterpreter.evaluate(node.piLeft(), ctx) as Number;
        // console.log("Execute Plus left: " + leftValue);
        const rightValue = mainInterpreter.evaluate(node.piRight(), ctx) as Number;
        // console.log("Execute Plus right: " + rightValue);
        return new Number(leftValue.valueOf() + rightValue.valueOf());
    }

}
