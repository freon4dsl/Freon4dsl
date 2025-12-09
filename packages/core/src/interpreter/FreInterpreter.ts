import type { InterpreterTracer } from "./InterpreterTracer.js";
import type { RtObject } from "./runtime/index.js";

export interface FreInterpreter {
    setTracing(value: boolean): void;

    getTrace(): InterpreterTracer;

    evaluate(node: Object): RtObject;
}
