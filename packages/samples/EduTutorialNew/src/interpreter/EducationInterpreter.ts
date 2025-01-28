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
import { RtFraction } from "./runtime/RtFraction.js";
import { RtFlow } from "./runtime/RtFlow.js"
import { RtGrade } from "./runtime/RtGrade.js";
import {isRtPage, RtPage} from "./runtime/RtPage.js"
import { EducationInterpreterBase } from "./gen/EducationInterpreterBase.js"
import {EducationEnvironment} from "../config/gen/EducationEnvironment.js";

let main: IMainInterpreter

/**
 * The class containing all interpreter functions written by the language engineer.
 * This class is initially empty, and will not be overwritten if it already exists.
 */
export class EducationInterpreter extends EducationInterpreterBase {
    constructor(m: IMainInterpreter) {
        super()
        main = m
    }

    override evalTest(node: Test, ctx: InterpreterContext): RtObject {
        console.log("Evaluating Scenario " + node.freId() + "  flow " + node.flow.referred?.name)
        // Puts the current flow in the context
        const newCtx = new InterpreterContext(ctx)
        const flow = new RtFlow(node.flow.referred)
        newCtx.set("CURRENT_FLOW", flow)
        for (const s of node.scenarios) {
            const scenarioResult = main.evaluate(s, newCtx)
            if (isRtBoolean(scenarioResult) && scenarioResult.asBoolean() === false) {
                return RtBoolean.FALSE
            }
            if (isRtError(scenarioResult)) {
                return scenarioResult
            }
        }
        return RtBoolean.TRUE
    }

    override evalScenario(node: Scenario, ctx: InterpreterContext): RtObject {
        console.log("Evaluating Scenario " + node.description + "  testFlow " + node.testFlow?.length)
        for (const testFlow of node.testFlow) {
            const stepFlowResult = main.evaluate(testFlow, ctx)
            if (isRtBoolean(stepFlowResult) && stepFlowResult.asBoolean() === false) {
                return RtBoolean.FALSE
            }
            if (isRtError(stepFlowResult)) {
                return stepFlowResult
            }
        }
        return RtBoolean.TRUE
    }

    override evalTestFlow(node: TestFlow, ctx: InterpreterContext): RtObject {
        console.log("Evaluating Test Flow " + node.freId() + "  steps " + node.steps?.length)
        let previousPage: RtPage = undefined
        let previousStep: Step
        let first: boolean = true      // indicates whether there is a calculated value for 'previous'
        for (const step of node.steps) {
            // Compare the fromPage with the previous stepResult
            if (!first && previousPage.page !== step.$fromPage) {
                // There was an error. Based on the given answers, we should not be on 'fromPage'.
                return new RtError(`Next page of step ${EducationEnvironment.getInstance().writer.writeToLines(previousStep)} should be ${previousPage.page.name}, not ${step.$fromPage.name}.`)
            }
            const stepResult = main.evaluate(step, ctx)
            if (isRtPage(stepResult) ) {
                // Remember the previous stepResult
                previousPage = stepResult
                previousStep = step
                first = false
            }
            if (isRtError(stepResult)) {
                return stepResult
            }
        }
        return RtBoolean.TRUE
    }

    override evalStep(node: Step, ctx: InterpreterContext): RtObject {
        const currentPage = node.$fromPage
        console.log(`Evaluating Step ${node.freId()} FromPage ${currentPage?.name} nrAnswers is ${node.answerSeries.length}`)

        // Put the page for this step in the context
        const newCtx = new InterpreterContext(ctx)
        newCtx.set("CURRENT_PAGE", new RtPage(currentPage))

        // Find the nr of correct answers and add it to the context
        let nrOfCorrectAnswers = 0
        for (const answer of node.answerSeries) {
            const actualAnswer = main.evaluate(answer.value, newCtx)
            // Store the actual answer with the question.
            newCtx.set(answer.$question, actualAnswer)
            const expectedAnswer = main.evaluate(answer.$question.correctAnswer, newCtx)
            if (actualAnswer.equals(expectedAnswer)) {
                nrOfCorrectAnswers++
            }
        }
        newCtx.set("NR_OF_CORRECT_ANSWERS", new RtNumber(nrOfCorrectAnswers))

        // Find the grade for the given answers
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

        // Find the page to which the application should switch based on the calculated grade,
        // and return it as the result of evaluating this step
        const transition = pageRule.transitions.find((trans) => trans.$condition === (grade as RtGrade).grade)
        if (isNullOrUndefined(transition)) {
            return new RtError(`No transition found for grade ${grade.grade} on page ${currentPage.name} in ${currentFlow.flow.name}`)
        }
        console.log(`Evaluating Step ${EducationEnvironment.getInstance().writer.writeToLines(node)} returning grade: ${transition.$condition.name}, page: ${transition.toPage.name}`)
        return new RtPage(transition.$toPage)
    }

    static evalPage(node: Page, ctx: InterpreterContext): RtObject {
        // Find grade for given answers
        console.log(`Evaluating Page ${node?.name}`)
        for (const score of node.grading) {
            const scoreValue = main.evaluate(score.expr, ctx)
            if (isRtBoolean(scoreValue)) {
                if (scoreValue.asBoolean()) {
                    console.log(`Evaluating Page returning ${score.$grade?.name}`)
                    return new RtGrade(score.$grade)
                }
            }
        }
        return new RtError(`No grade found for current answers in page ${node.name}`)
    }

    override evalTheory(node: Theory, ctx: InterpreterContext): RtObject {
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

    override evalQuestionReference(node: QuestionReference, ctx: InterpreterContext): RtObject {
        const question = node?.question?.referred
        if (question === undefined || question === null) {
            throw new RtError("evalQuestionReference: Question is not found")
        }
        const expected = main.evaluate(question.correctAnswer, ctx)
        const givenAnswer = ctx.find(question)
        if (givenAnswer === undefined || givenAnswer === null) {
            throw new RtError(`evalQuestionReference: Question '${question.content}' does not have a result value`)
        }
        console.log(`evalQuestionReference for '${question.content}', given answer is '${givenAnswer}', expected '${expected}'`)
        return givenAnswer.equals(expected)
    }

    override evalNrOfCorrectAnswers(node: NrOfCorrectAnswers, ctx: InterpreterContext): RtObject {
        return ctx.find("NR_OF_CORRECT_ANSWERS")
    }

    override evalAnswer(node: Answer, ctx: InterpreterContext): RtObject {
        console.log(`evalAnswer.node ${node?.$question.content}`)
        const actualAnswer = main.evaluate(node.value, ctx)
        if (node.question.referred !== undefined && node.question.referred !== null) {
            const expectedAnswer = main.evaluate(node.question.referred.correctAnswer, ctx)
            return actualAnswer.equals(expectedAnswer)
        }
        return new RtError("evalAnswer: question not found")
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
