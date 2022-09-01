import {
    ConceptFunction,
    IMainInterpreter,
    InterpreterContext,
    InterpreterTracer,
    MainInterpreter, OwningPropertyFunction, PiElement
} from "@projectit/core";
import {  RulesLanguageInterpreterInit } from "./gen/RulesLanguageInterpreterInit";

const getPropertyFunction: OwningPropertyFunction = (node: Object) => {
    const index = (node as PiElement).piOwnerDescriptor().propertyIndex;
    return (node as PiElement).piOwnerDescriptor().propertyName + (index !== undefined ? "[" + index + "]" : "");
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
export class RulesInterpreterOnGen {
    private static  main: IMainInterpreter = null;

    constructor() {
        if(RulesInterpreterOnGen.main === null) {
            RulesInterpreterOnGen.main = MainInterpreter.instance(RulesLanguageInterpreterInit, getConceptFunction, getPropertyFunction);
        }
    }

    setTracing(value: boolean) {
        RulesInterpreterOnGen.main.setTracing(value);
    }

    getTrace(): InterpreterTracer {
        return RulesInterpreterOnGen.main.getTrace()
    }

    evaluate(node: Object): Object {
        RulesInterpreterOnGen.main.reset();
        return RulesInterpreterOnGen.main.evaluate(node, InterpreterContext.EMPTY_CONTEXT)
    }
}

