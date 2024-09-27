import { InterpreterTracer } from "./InterpreterTracer.js";
import { RtObject } from "./runtime/index.js";

export interface FreInterpreter {
    setTracing(value: boolean): void;

    getTrace(): InterpreterTracer;

    evaluate(node: Object): RtObject;
}
