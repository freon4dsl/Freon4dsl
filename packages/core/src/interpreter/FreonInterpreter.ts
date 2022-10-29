import { InterpreterTracer } from "./InterpreterTracer";

export interface FreonInterpreter<ASTNODE, RTVALUE> {
    setTracing(value: boolean): void;

    getTrace(): InterpreterTracer<ASTNODE, RTVALUE>;

    evaluate(node: ASTNODE): RTVALUE;
}
