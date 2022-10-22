import { InterpreterTracer } from "./InterpreterTracer";
import { RtObject } from "./runtime/RtObject";

export interface FreonInterpreter {
    setTracing(value: boolean): void;

    getTrace(): InterpreterTracer;

    evaluate(node: Object): RtObject;
}
