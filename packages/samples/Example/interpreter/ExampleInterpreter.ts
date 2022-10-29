// Generated my Freon once, will NEVER be overwritten.
import { InterpreterContext, IMainInterpreter, RtObject, RtBoolean, RtNumber } from "@projectit/core";
import { BooleanLiteralExpression, EqualsExpression, NumberLiteralExpression, PlusExpression } from "../language/gen/index";
import { ExampleInterpreterBase } from "./gen/ExampleInterpreterBase";
import { ExampleInterpreterContext, IExampleMainInterpreter } from "./gen/ExampleInterpreterInterpreterTypes";

let main: IExampleMainInterpreter;

/**
 * The class containing all interpreter functions twritten by thge language engineer.
 * This class is initially empty,  and will not be overwritten if it already exists..
 */
export class ExampleInterpreter extends ExampleInterpreterBase {
    constructor(m: IExampleMainInterpreter) {
        super();
        main = m;
    }

    evalBooleanLiteralExpression(node: BooleanLiteralExpression, ctx: ExampleInterpreterContext): RtObject {
        return RtBoolean.of(node.value);
    }

    evalNumberLiteralExpression(node: NumberLiteralExpression, ctx: ExampleInterpreterContext): RtObject {
        return new RtNumber(node.value);
    }

    evalPlusExpression(node: PlusExpression, ctx: ExampleInterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx);
        const right = main.evaluate(node.right, ctx);
        return (left as RtNumber).plus(right as RtNumber);
    }

    evalEqualsExpression(node: EqualsExpression, ctx: ExampleInterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx);
        const right = main.evaluate(node.right, ctx);
        return left.equals(right);
    }
}
