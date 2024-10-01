// Generated my Freon once, will NEVER be overwritten.
import {
    InterpreterContext,
    IMainInterpreter,
    RtObject,
    RtNumber,
    isRtError,
    RtString,
    RtBoolean, RtArray, RtError, isRtBoolean, jsonAsString
} from "@freon4dsl/core";
import { RtFlowDescription } from "../runtime/RtFlowDescription.js";
import { RtGrade } from "../runtime/RtGrade.js";
import { RtPage } from "../runtime/RtPage.js";
import {
    Function,
    FractionLiteralExpression,
    Scenario,
    Step,
    StringLiteralExpression,
    BooleanLiteralExpression,
    Answer,
    NumberLiteralExpression,
    PlusExpression,
    EqualsExpression,
    AndExpression,
    OrExpression, QuestionRef, FunctionCase, PageResult, Test, FlowRule, GreaterThenExpression
} from "../language/gen/index.js";
import { RtFraction } from "../runtime/RtFraction.js";
import { EducationInterpreterBase } from "./gen/EducationInterpreterBase.js";

let main: IMainInterpreter;

/**
 * The class containing all interpreter functions written by the language engineer.
 * This class is initially empty,  and will not be overwritten if it already exists.
 */
export class EducationInterpreter extends EducationInterpreterBase {

    constructor(m: IMainInterpreter) {
        super();
        main = m;
    }

    override evalTest(node: Test, ctx: InterpreterContext): RtObject {
        ctx.set("CURRENT_FLOW", new RtFlowDescription(node.flow.referred));
        for (const s of node.scenarios) {
            const result = main.evaluate(s, ctx) as RtArray<RtBoolean>;
            const nrSucceeds = result.array.filter(b => b.asBoolean()).length;
            const nrFailures = result.array.filter(b => !b.asBoolean()).length;
            if (nrFailures > 0) {
                return new RtString("Scenario " + s.description + " has " + nrFailures + " failed steps");
            }
        }
        return null;
    }

    override evalScenario(node: Scenario, ctx: InterpreterContext): RtObject {
        // console.log("Eval Scenario " + node.description);
        const result = new RtArray();
        const newCtx = new InterpreterContext(ctx);
        for (const step of node.steps) {
            const stepResult = main.evaluate(step, newCtx);
            result.array.push(stepResult);
            // console.log("    Scenario result is " + jsonAsString(stepResult));
            if (isRtError(stepResult)) {
                return stepResult;
            }
        }
        return result;
    }

    override evalStep(node: Step, ctx: InterpreterContext): RtObject {
        const currentPage = node.fromPage.referred;
        ctx.set("CURRENT_PAGE", new RtPage(currentPage));
        for (const answer of node.answersGiven) {
            const actualAnswer = main.evaluate(answer.expr, ctx);
            // Store the actual answer with the question.
            ctx.set(answer.question.referred, actualAnswer);
            // const expectedAnswer = main.evaluate(answer.question.referred.correctAnswer, ctx);
            // result.array.push(new RtAnswer(answer.question.referred, actualAnswer));
        }
        const pageScore = main.evaluate(node.fromPage.referred.calcResult, ctx) as RtGrade;
        console.log("Page score for page " + currentPage.name + " is " + jsonAsString(pageScore));

        //  Find rule for current page
        const rule: FlowRule = (ctx.find("CURRENT_FLOW") as RtFlowDescription).flow.rules.find(r =>
            r.page.referred === currentPage
        );
        const expectedPage = node.expectedPage.referred;
        const usedTransition = rule.transitions.find(trans => trans.condition.$grade === pageScore.grade);
        const actualPage = usedTransition.$toPage;
        console.log("Step actual is [" + actualPage.name + "] expected [" + expectedPage.name + "]");
        return RtBoolean.of(expectedPage === actualPage);
    }

    override evalAnswer(node: Answer, ctx: InterpreterContext): RtObject {
        const actualAnswer = main.evaluate(node.expr, ctx);
        const expectedAnswer = main.evaluate(node.question.referred.correctAnswer, ctx);
        return actualAnswer.equals(expectedAnswer);
    }

    override evalQuestionRef(node: QuestionRef, ctx: InterpreterContext): RtObject {
        const question = node?.question?.referred;
        if (question === undefined || question === null) {
            throw new RtError("evalQuestionRef: Question is not found");
        }
        const result = ctx.find(question);
        if (result === undefined || result === null) {
            throw new RtError("evalQuestionRef: Question does not have a result value");
        }
        return result;
    }

    override evalFunction(node: Function, ctx: InterpreterContext): RtObject {
        for (const cse of node.cases) {
            const caseResult = main.evaluate(cse, ctx);
            if (caseResult !== undefined) {
                return caseResult;
            }
        }
        return undefined;
    }

    override evalFunctionCase(node: FunctionCase, ctx: InterpreterContext): RtObject {
        const condition = main.evaluate(node.formula, ctx);
        if (isRtBoolean(condition)) {
            if (condition.asBoolean()) {
                return new RtGrade(node.grade.referred);
            }
        }
        return undefined;
    }

    override evalPageResult(node: PageResult, ctx: InterpreterContext): RtObject {
        // Find current page
        const page = ctx.find("CURRENT_PAGE") as RtPage;
        return main.evaluate(page.page.calcResult, ctx);
    }

    //////////////////// Literals

    override evalFractionLiteralExpression(node: FractionLiteralExpression, ctx: InterpreterContext): RtObject {
        return new RtFraction(new RtNumber(node.numerator), new RtNumber(node.denominator));
    }

    override evalNumberLiteralExpression(node: NumberLiteralExpression, ctx: InterpreterContext): RtObject {
        return new RtNumber(node.value);
    }

    override evalStringLiteralExpression(node: StringLiteralExpression, ctx: InterpreterContext): RtObject {
        return new RtString(node.value);
    }

    override evalBooleanLiteralExpression(node: BooleanLiteralExpression, ctx: InterpreterContext): RtObject {
        return RtBoolean.of(node.value);
    }

    ///////////////// STANDARD EXPRESSIONS

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

    evalAndExpression(node: AndExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtBoolean;
        const right = main.evaluate(node.right, ctx) as RtBoolean;
        return (left).and(right);
    }

    evalOrExpression(node: OrExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtBoolean;
        const right = main.evaluate(node.right, ctx) as RtBoolean;
        return (left).or(right);
    }

    evalGreaterThenExpression(node: GreaterThenExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtNumber;
        const right = main.evaluate(node.right, ctx) as RtNumber;
        return RtBoolean.of(left.value > right.value);
    }

}
