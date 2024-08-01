// Generated by the ProjectIt Language Generator.
import {
    InterpreterContext,
    IMainInterpreter,
    RtObject,
    RtNumber,
    RtEmpty,
    isRtNumber,
    isRtString, RtError, isRtEmpty
} from "@freon4dsl/core";
import {
    NumberLiteral,
} from "../language/gen/index";
import { RulesModelInterpreter } from "./RulesModelInterpreter"

let main: IMainInterpreter;

export class RulesLanguageInterpreter extends RulesModelInterpreter {
    constructor(m: IMainInterpreter) {
        super(m);
        main = m;
    }

    // override evalMultiply(node: Multiply, ctx: InterpreterContext): RtObject {
    //     const leftValue = main.evaluate(node.piLeft(), ctx);
    //     const rightValue = main.evaluate(node.piRight(), ctx);
    //     if (isRtNumber(leftValue)) {
    //         return leftValue.multiply(rightValue);
    //     }
    //     return new RtError("Multiply type error: " + rightValue.rtType);
    // }
    //
    // override evalPlus(node: Plus, ctx: InterpreterContext): RtObject {
    //     const leftValue = main.evaluate(node.piLeft(), ctx);
    //     const rightValue = main.evaluate(node.piRight(), ctx);
    //     if (isRtNumber(leftValue)) {
    //         return leftValue.plus(rightValue);
    //     } else if (isRtString(leftValue)) {
    //         return leftValue.plus(rightValue);
    //     } else if( isRtEmpty(rightValue)) {
    //         return leftValue;
    //     }
    //     return new RtError("Plus type eror")
    // }
    //
    // override evalFunctionCall(node: FunctionCall, ctx: InterpreterContext): RtObject {
    //     const newContext = new InterpreterContext(ctx);
    //     node.arguments.forEach((argument: RuleExpression, index: number) => {
    //         const argValue = main.evaluate(argument, ctx);
    //         newContext.set(node.func.referred.parameters[index], argValue);
    //     });
    //     const result = main.evaluate(node.func.referred, newContext);
    //     return result;
    // }
    //
    // override evalRFunction(node: RFunction, ctx: InterpreterContext): RtObject {
    //     const result = main.evaluate(node.body, ctx);
    //     return result;
    // }
    //
    // override evalParameterRef(node: ParameterRef, ctx: InterpreterContext): RtObject {
    //     const result = ctx.find(node.par.referred);
    //     return result;
    // }

    override evalNumberLiteral(node: NumberLiteral, ctx: InterpreterContext): RtObject {
        // if( node.value === "3") {
        //     return new RtError("33333 error");
        //     throw new RtError("33333333");
        // }
        return new RtNumber(Number.parseFloat(node.value));;
    }
}
