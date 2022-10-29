// Generated my Freon once, will NEVER be overwritten.
import { InterpreterContext, IMainInterpreter, RtObject, RtBoolean, RtNumber, isRtNumber, RtError, PiElement } from "@projectit/core";
import { BooleanLiteralExpression, EqualsExpression, NumberLiteralExpression, PlusExpression } from "../language/gen/index";
import { ExampleCtx, IExampleMainInterpreter } from "./ExampleInterpreterTypes";
import { ExampleInterpreterBase } from "./gen/ExampleInterpreterBase";

let main: IExampleMainInterpreter;

/**
 * The class containing all interpreter functions twritten by thge language engineer.
 * This class is initially empty,  and will not be overwritten if it already exists..
 */
// shorthand
export class InterpreterBase<A, R> {}

export class ExampleInterpreter extends ExampleInterpreterBase {
    constructor(m: IExampleMainInterpreter) {
        super();
        main = m;
    }

    evalBooleanLiteralExpression(node: BooleanLiteralExpression, ctx: InterpreterContext<PiElement, RtObject>): RtObject {
        return RtBoolean.of(node.value);
    }

    evalNumberLiteralExpression(node: NumberLiteralExpression, ctx: ExampleCtx): RtObject {
        return new RtNumber(node.value);
    }

    preparePlusExpression(node: PlusExpression, ctx: ExampleCtx): RtObject {
        ctx.set(node.left, main.evaluate(node.left, ctx));
        ctx.set(node.right, main.evaluate(node.right, ctx));
        return undefined;
    }

    evalPlusExpressionNew(node: PlusExpression, ctx: ExampleCtx): RtObject {
        const leftValue = ctx.find(node.left);
        const rightValue = ctx.find(node.right);
        if (isRtNumber(leftValue)) {
            // do it
            leftValue.plus(rightValue);
        } else {
            return undefined;
        }
        throw new RtError("evalPlusExpression is not defined");
    }
    evalPlusExpression(node: PlusExpression, ctx: ExampleCtx): RtObject {
        const left = main.evaluate(node.left, ctx);
        const right = main.evaluate(node.right, ctx);
        // TODO Check left and right types, return something sensible when types are not RtNumber
        if (!isRtNumber(left) || !isRtNumber(right)) {
            return null; // TODO ???
        }
        return (left as RtNumber).plus(right as RtNumber);
    }

    evalEqualsExpression(node: EqualsExpression, ctx: ExampleCtx): RtObject {
        const left = main.evaluate(node.left, ctx);
        const right = main.evaluate(node.right, ctx);
        return left.equals(right);
    }
}
