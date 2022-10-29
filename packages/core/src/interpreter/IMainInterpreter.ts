import { InterpreterContext } from "./InterpreterContext";
import { InterpreterTracer } from "./InterpreterTracer";

export type ConceptFunction<ASTNODE> = (node: ASTNODE) => string;
export type OwningPropertyFunction<ASTNODE> = (node: ASTNODE) => string;
export type EvaluateFunction<ASTNODE, RTVALUE> = (node: Object, ctx: InterpreterContext<ASTNODE, RTVALUE>) => RTVALUE;
export type InitFunction<ASTNODE, RTVALUE> = (i: IMainInterpreter<ASTNODE, RTVALUE>) => void;

export interface IMainInterpreter<ASTNODE, RTVALUE> {
    /**
     * Register function `func`  for node with type `name`
     */
    registerFunction(name: string, func: EvaluateFunction<ASTNODE, RTVALUE>): void;

    /**
     * Evaluate `node` with context `ctx` and return the  value.
     */
    evaluate(node: ASTNODE, ctx: InterpreterContext<ASTNODE, RTVALUE>): RTVALUE;

    /**
     * Get the tracer instance that is filled by `evaluate`.
     * Used to print a pretty printed trace of the full calculation.
     */
    getTrace(): InterpreterTracer<ASTNODE, RTVALUE>;

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
