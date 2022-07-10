import { InterpreterContext } from "./InterpreterContext";
import { InterpreterTracer } from "./InterpreterTracer";

export type ConceptFunction = (node: Object) => string;
export type OwningPropertyFunction = (node: Object) => string;
export type EvaluateFunction = (node: Object, ctx: InterpreterContext) => Object;
export type InitFunction = (i: IMainInterpreter) => void;

export interface IMainInterpreter {
    /**
     * Register function `func`  for node with type `name`
     */
    registerFunction(name: string, func: EvaluateFunction): void;

    /**
     * Evaluate `node` with context `ctx` and return the  value.
     */
    evaluate(node: Object, ctx: InterpreterContext): Object;

    /**
     * Get the tracer instance that is filled by `evaluate`.
     * Used to print a pretty printed trace of the full calculation.
     */
    getTrace(): InterpreterTracer;

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
