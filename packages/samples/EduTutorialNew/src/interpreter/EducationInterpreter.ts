// Generated my Freon once, will NEVER be overwritten.
import {
    InterpreterContext,
    IMainInterpreter,
    RtObject,
    RtNumber,
    RtBoolean,
    RtError,
    RtArray,
    RtString,
    isRtError,
    isRtBoolean,
    isNullOrUndefined, astToString,
} from "@freon4dsl/core";
import {
    AndExpression,
    Answer,
    EqualsExpression, ExamplePage, FlowRule,
    Fraction, Grade,
    GreaterOrEqualsExpression,
    GreaterThenExpression, InDepthMaterial, LastStep,
    LessOrEqualsExpression,
    LessThenExpression,
    NrOfCorrectAnswers,
    NumberLiteralExpression,
    OrExpression, Page,
    QuestionReference,
    Scenario,
    SimpleNumber,
    Step,
    Test, TestFlow, Theory, Video, WorkSheet
} from "../language/gen/index.js";
import { RtFraction } from "../runtime/RtFraction.js";
import { RtFlow } from "../runtime/RtFlow.js"
import { RtGrade } from "../runtime/RtGrade.js";
import { RtPage } from "../runtime/RtPage.js"
import { EducationInterpreterBase } from "./gen/EducationInterpreterBase.js"

let main: IMainInterpreter

/**
 * The class containing all interpreter functions twritten by thge language engineer.
 * This class is initially empty,  and will not be overwritten if it already exists..
 */
export class EducationInterpreter extends EducationInterpreterBase {
    constructor(m: IMainInterpreter) {
        super()
        main = m
    }

    override evalTest(node: Test, ctx: InterpreterContext): RtObject {
        // Puts the current flow in the context
        console.log(`evalTest.flow ${node.flow.referred?.name}`)
        const newCtx = new InterpreterContext(ctx)
        const flow = new RtFlow(node.flow.referred)
        newCtx.set("CURRENT_FLOW", flow)
        console.log("Set ctx CURRENT_FLOW to " + flow )
        for (const s of node.scenarios) {
            const result = main.evaluate(s, newCtx) as RtArray<RtBoolean>
            // const nrSucceeds = result.array.filter((b) => b.asBoolean()).length
            // const nrFailures = result.array.filter((b) => !b.asBoolean()).length
            // if (nrFailures > 0) {
            //     return new RtString("Scenario " + s.description + " has " + nrFailures + " failed steps")
            // }
        }
        return null
    }

    override evalScenario(node: Scenario, ctx: InterpreterContext): RtObject {
        console.log("Eval Scenario " + node.description + "  testFlow " + node.testFlow?.length)
        const result = new RtArray()
        const newCtx = new InterpreterContext(ctx)
        for (const testFlow of node.testFlow) {
            const stepFlowResult = main.evaluate(testFlow, newCtx)
            // result.array.push(stepResult)
            // console.log("    Scenario result is " + jsonAsString(stepResult));
            // if (isRtError(stepResult)) {
            //     return stepResult
            // }
        }
        return new RtString("" + node?.description)
    }

    override evalTestFlow(node: TestFlow, ctx: InterpreterContext): RtObject {
        console.log("Eval Test Flow " + node.freId() + "  steps " + node.steps?.length)
        const result = new RtArray()
        const newCtx = new InterpreterContext(ctx)
        for (const step of node.steps) {
            const stepResult = main.evaluate(step, newCtx)
            result.array.push(stepResult)
            // console.log("    Scenario result is " + jsonAsString(stepResult));
            if (isRtError(stepResult)) {
                return stepResult
            }
        }
        // TODO check whether page transitions are is correct
        return result
    }

    override evalStep(node: Step, ctx: InterpreterContext): RtObject {
        const currentPage = node.$fromPage
        console.log(`evalStep ${node.freId()} FromPage ${currentPage?.name} nrAnswers is ${node.answerSeries.length}`)
        // console.log(astToString(node))

        // Puts the page for this step in the context
        const newCtx = new InterpreterContext(ctx)
        newCtx.set("CURRENT_PAGE", new RtPage(currentPage))
        let nrOfCorrectAnswers = 0
        for (const answer of node.answerSeries) {
            const actualAnswer = main.evaluate(answer.value, newCtx)
            // Store the actual answer with the question.
            newCtx.set(answer.$question, actualAnswer)
            console.log(`Ctx.set '${answer.$question.content}' to '${actualAnswer}'`)
            const expectedAnswer = main.evaluate(answer.$question.correctAnswer, newCtx)
            // const answerCorrect = new RtAnswer(answer.question.referred, actualAnswer))
            if (actualAnswer.equals(expectedAnswer)) {
                nrOfCorrectAnswers++
            }
        }
        newCtx.set("NR_OF_CORRECT_ANSWERS", new RtNumber(nrOfCorrectAnswers))
        console.log(`Ctx.set 'NR_OF_CORRECT_ANSWERS' to '${nrOfCorrectAnswers}`)
        // Find grade for given answers
        const grade = main.evaluate(currentPage, newCtx) as RtGrade
        //  Find rule for current page
        const currentFlow = ctx.find("CURRENT_FLOW") as RtFlow
        if (isNullOrUndefined(currentFlow)) {
            return new RtError(`No flow found for page ${currentPage.name}`)
        }
        const pageRule: FlowRule = currentFlow.flow.rules.find((rule) => rule.$page === currentPage)
        if (isNullOrUndefined(pageRule)) {
            return new RtError(`No rules found for page ${currentPage.name} in ${currentFlow.flow.name}, rules are ${currentFlow.flow.rules.map(r => r.name)}`)
        }
        const transition = pageRule.transitions.find((trans) => trans.$condition === (grade as RtGrade).grade)
        if (isNullOrUndefined(transition)) {
            return new RtError(`No transition found for grade ${grade.grade} on page ${currentPage.name} in ${currentFlow.flow.name}`)
        }
        console.log("Transition " + astToString(transition))
        return new RtPage(transition.$toPage)

        // const expectedPage = node.expectedPage.referred;
        // const usedTransition = rule.transitions.find(trans => trans.condition.$grade === pageScore.grade);
        // const actualPage = usedTransition.$toPage;
        // console.log("Step actual is [" + actualPage.name + "] expected [" + expectedPage.name + "]");
        // return RtBoolean.of(expectedPage === actualPage);
    }

    static evalPage(node: Page, ctx: InterpreterContext): RtObject {
        // Find grade for given answers
        console.log(`evalPage.node ${node?.name}`)
        let resultGrade: RtGrade = new RtGrade(Grade.gradeF)
        for (const score of node.grading) {
            const scoreValue = main.evaluate(score.expr, ctx)
            if (isRtBoolean(scoreValue)) {
                if (scoreValue.asBoolean()) {
                    return new RtGrade(score.grade.referred)
                }
            }
        }
        return new RtError(`No grade found for current answers in page ${node.name}`)
    }

    override evalTheory(node: Theory, ctx: InterpreterContext): RtObject {
        console.log(`evalTheory.node ${node?.name}`)
        return EducationInterpreter.evalPage(node, ctx)
    }
    override evalVideo(node: Video, ctx: InterpreterContext): RtObject {
        return EducationInterpreter.evalPage(node, ctx)
    }
    override evalWorkSheet(node: WorkSheet, ctx: InterpreterContext): RtObject {
        return EducationInterpreter.evalPage(node, ctx)
    }
    override evalInDepthMaterial(node: InDepthMaterial, ctx: InterpreterContext): RtObject {
        return EducationInterpreter.evalPage(node, ctx)
    }
    override evalExamplePage(node: ExamplePage, ctx: InterpreterContext): RtObject {
        return EducationInterpreter.evalPage(node, ctx)
    }

    override evalAnswer(node: Answer, ctx: InterpreterContext): RtObject {
        console.log(`evalAnswer.node ${node?.$question.content}`)
        const actualAnswer = main.evaluate(node.value, ctx)
        const expectedAnswer = main.evaluate(node.question.referred.correctAnswer, ctx)
        return actualAnswer.equals(expectedAnswer)
    }

    override evalQuestionReference(node: QuestionReference, ctx: InterpreterContext): RtObject {
        const question = node?.question?.referred
        if (question === undefined || question === null) {
            throw new RtError("evalQuestionReference: Question is not found")
        }
        const result = ctx.find(question)
        if (result === undefined || result === null) {
            throw new RtError(`evalQuestionReference: Question '${question.content}' does not have a result value`)
        }
        console.log(`evalQref for q'${question.content}' is '${result}'`)
        const expected = main.evaluate(question.correctAnswer, ctx)
        return result.equals(expected)
    }

    override evalNrOfCorrectAnswers(node: NrOfCorrectAnswers, ctx: InterpreterContext): RtObject {
        return ctx.find("NR_OF_CORRECT_ANSWERS")
    }

    override evalLastStep(node: LastStep, ctx: InterpreterContext): RtObject {
        return RtBoolean.TRUE
    }

    /////////////////// Literals

    override evalSimpleNumber(node: SimpleNumber, ctx: InterpreterContext): RtObject {
        return new RtNumber(node.value)
    }

    override evalNumberLiteralExpression(node: NumberLiteralExpression, ctx: InterpreterContext): RtObject {
        return new RtNumber(node.value)
    }

    override evalFraction(node: Fraction, ctx: InterpreterContext): RtObject {
        return new RtFraction(new RtNumber(node.numerator), new RtNumber(node.denominator))
    }

    ///////////////// COMPARISON EXPRESSIONS

    override evalEqualsExpression(node: EqualsExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx)
        const right = main.evaluate(node.right, ctx)
        return left.equals(right)
    }

    override evalAndExpression(node: AndExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtBoolean
        const right = main.evaluate(node.right, ctx) as RtBoolean
        return left.and(right)
    }

    override evalOrExpression(node: OrExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtBoolean
        const right = main.evaluate(node.right, ctx) as RtBoolean
        return left.or(right)
    }

    override evalGreaterThenExpression(node: GreaterThenExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtNumber
        const right = main.evaluate(node.right, ctx) as RtNumber
        return RtBoolean.of(left.value > right.value)
    }

    override evalGreaterOrEqualsExpression(node: GreaterOrEqualsExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtNumber
        const right = main.evaluate(node.right, ctx) as RtNumber
        return RtBoolean.of(left.value >= right.value)
    }

    override evalLessThenExpression(node: LessThenExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtNumber
        const right = main.evaluate(node.right, ctx) as RtNumber
        return RtBoolean.of(left.value < right.value)
    }

    override evalLessOrEqualsExpression(node: LessOrEqualsExpression, ctx: InterpreterContext): RtObject {
        const left = main.evaluate(node.left, ctx) as RtNumber
        const right = main.evaluate(node.right, ctx) as RtNumber
        return RtBoolean.of(left.value <= right.value)
    }
}
