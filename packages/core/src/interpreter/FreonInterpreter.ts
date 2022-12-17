import { PiElement } from "../ast/index";
import { InterpreterTracer } from "./InterpreterTracer";

export interface FreonInterpreter<RT_OBJECT> {
    setTracing(value: boolean): void;

    getTrace(): InterpreterTracer<RT_OBJECT>;

    evaluate(node: PiElement): RT_OBJECT;
}
