import {
    ConceptFunction,
    IMainInterpreter,
    InterpreterContext,
    InterpreterTracer,
    MainInterpreter, OwningPropertyFunction, PiElement
} from "@projectit/core";
import { initMainInterpreter } from "./InitMainInterpreter";

const getPropertyFunction: OwningPropertyFunction = (node: Object) => {
    return (node as PiElement).piOwnerDescriptor().propertyName;
};

/**
 * Function that returns the concept name for `node`.
 * Used by the interpreter to find which evaluator should be use for each node.
 */
const getConceptFunction: ConceptFunction = (node: Object) => {
    if(node === undefined) {
        return "";
    }
    return (node as PiElement).piLanguageConcept();
}

/**
 * The facade around the actual interpreter to avoid improper usage.
 * Sets the functions used to access the expression tree.
 * Ensures all internal interpreter state is cleaned when creating a new instance.
 */
export class RulesInterpreter {
    private static  main: IMainInterpreter = null;

    constructor() {
        if(RulesInterpreter.main === null) {
            RulesInterpreter.main = MainInterpreter.instance(initMainInterpreter, getConceptFunction, getPropertyFunction);
        }
    }

    setTracing(value: boolean) {
        RulesInterpreter.main.setTracing(value);
    }

    getTrace(): InterpreterTracer {
        return RulesInterpreter.main.getTrace()
    }

    evaluate(node: Object): Object {
        RulesInterpreter.main.reset();
        return RulesInterpreter.main.evaluate(node, InterpreterContext.EMPTY_CONTEXT)
    }
}

