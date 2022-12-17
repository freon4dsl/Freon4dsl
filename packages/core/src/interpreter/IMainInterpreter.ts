import { PiElement } from "../ast/index";
import { InterpreterContext } from "./InterpreterContext";
import { InterpreterTracer } from "./InterpreterTracer";

export type ConceptFunction = (node: Object) => string;
export type OwningPropertyFunction = (node: Object) => string;
export type EvaluateFunction<RT_VALUE> = (node: PiElement, ctx: InterpreterContext<RT_VALUE>) => RT_VALUE;
export type InitFunction<RT_VALUE> = (i: IMainInterpreter<RT_VALUE>) => void;

export interface IMainInterpreter<RT_VALUE> {
    /**
     * Register function `func`  for node with type `name`
     */
    registerFunction(name: string, func: EvaluateFunction<RT_VALUE>): void;

    /**
     * Evaluate `node` with context `ctx` and return the  value.
     */
    evaluate(node: PiElement, ctx: InterpreterContext<RT_VALUE>): RT_VALUE;

    /**
     * Get the tracer instance that is filled by `evaluate`.
     * Used to print a pretty printed trace of the full calculation.
     */
    getTrace(): InterpreterTracer<RT_VALUE>;

    /**
     * Turn tracing on or off.
     */
    setTracing(value: boolean): void;

    /**
     * Reset the interpreter for a new calculation.
     * Cleans all state.
     */
    reset(): void;
}
