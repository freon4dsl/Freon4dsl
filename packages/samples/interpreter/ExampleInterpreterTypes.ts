// shorthands
import {
    ConceptFunction,
    EvaluateFunction,
    IMainInterpreter,
    InitFunction,
    InterpreterContext,
    InterpreterTracer,
    OwningPropertyFunction,
    PiElement,
    RtObject,
} from "@projectit/core";

/**
 * Define all non-generic types / classes / interfaces for Example language
 */
export type IExampleMainInterpreter = IMainInterpreter<PiElement, RtObject>;
export class InterpreterBase<A, R> {}
export type ExampleTracer = InterpreterTracer<PiElement, RtObject>;
export type ExampleInitFunction = InitFunction<PiElement, RtObject>;
export type ExampleConceptFunction = ConceptFunction<PiElement>;
export type ExampleOwningPropertyFunction = OwningPropertyFunction<PiElement>;
export type ExampleEvaluateFunction = EvaluateFunction<PiElement, RtObject>;

/**
 * Define the non-generic class for the context
 */
export class ExampleCtx extends InterpreterContext<PiElement, RtObject> {}

const exC = new ExampleCtx(null);
