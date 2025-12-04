// Generated my Freon once, will NEVER be overwritten.
import { InterpreterContext, IMainInterpreter, RtObject, RtBoolean, RtNumber } from "@freon4dsl/core";
import {
    BooleanLiteralExpression,
    EqualsExpression,
    NumberLiteralExpression,
    PlusExpression
} from "../freon/language/index.js";
import { ExampleInterpreterBase } from "../freon/interpreter/ExampleInterpreterBase.js";

let main: IMainInterpreter;

/**
 * The class containing all interpreter functions twritten by thge language engineer.
 * This class is initially empty,  and will not be overwritten if it already exists..
 */
export class ExampleInterpreter extends ExampleInterpreterBase {

    constructor(m: IMainInterpreter) {
        super();
        main = m;
    }

    evalBooleanLiteralExpression(node: BooleanLiteralExpression, ctx: InterpreterContext): RtObject {
        return RtBoolean.of(node.value);
    }

    evalNumberLiteralExpression(node: NumberLiteralExpression, ctx: InterpreterContext): RtObject {
        return new RtNumber(node.value);
    }

    evalPlusExpression(node: PlusExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx);
        const right = main.evaluate(node.right, ctx);
        return (left as RtNumber).plus(right as RtNumber );
    }

    evalEqualsExpression(node: EqualsExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx);
        const right = main.evaluate(node.right, ctx);
        return (left).equals(right);
    }

}
