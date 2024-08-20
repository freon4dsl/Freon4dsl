import { InterpreterContext } from "./InterpreterContext";
import { InterpreterError } from "./InterpreterException";
import { InterpreterTracer } from "./InterpreterTracer";
import {
    ConceptFunction,
    EvaluateFunction,
    IMainInterpreter,
    InitFunction,
    OwningPropertyFunction,
} from "./IMainInterpreter";
import { isRtError, RtObject } from "./runtime";

/**
 * The main interpreter class, usually hidden by a facade specific for a project.
 */
export class MainInterpreter implements IMainInterpreter {
    private static privateInstance;

    /**
     *
     * @param init                Initialize function for interpreter, is generated in the "interpreters" directory.
     * @param getConceptFunction  Function that gets the typeName from an object
     * @param getPropertyFunction Function that gets the property name in which an object is stored in its parent
     */
    public static instance(
        init: InitFunction,
        getConceptFunction: ConceptFunction,
        getPropertyFunction: OwningPropertyFunction,
    ): IMainInterpreter {
        if (MainInterpreter.privateInstance === undefined) {
            MainInterpreter.privateInstance = new MainInterpreter(init, getConceptFunction, getPropertyFunction);
        }
        return MainInterpreter.privateInstance;
    }

    // Lookup map of all evaluate functions from all interpreters
    private functions: Map<string, EvaluateFunction> = new Map<string, EvaluateFunction>();
    private tracing: boolean = false;
    private tracer: InterpreterTracer;
    // Function to get the concept name / type of the node
    private readonly getConcept: ConceptFunction;
    // Function to get the name of the property in which a node is stored.
    private readonly getProperty: OwningPropertyFunction;

    constructor(init: InitFunction, getConceptFunction: ConceptFunction, getPropertyFunction: OwningPropertyFunction) {
        init(this);
        this.getConcept = getConceptFunction;
        this.getProperty = getPropertyFunction;
        this.tracer = new InterpreterTracer(getConceptFunction, getPropertyFunction);
    }

    public reset(): void {
        this.tracer = new InterpreterTracer(this.getConcept, this.getProperty);
    }

    /**
     * @see IMainInterpreter.registerFunction
     */
    public registerFunction(name: string, func: EvaluateFunction): void {
        this.functions.set(name, func);
    }

    /**
     * @see IMainInterpreter.setTracing
     */
    public setTracing(value: boolean): void {
        this.tracing = value;
    }

    /**
     * @see IMainInterpreter.getTrace
     */
    public getTrace(): InterpreterTracer {
        return this.tracer;
    }

    /**
     * @see IMainInterpreter.evaluate
     * Evaluate `node` with context `ctx` aand return the value
     */
    public evaluate(node: Object, ctx: InterpreterContext): RtObject {
        if (node === undefined || node === null) {
            throw new InterpreterError("Cannot interpret node that is null or undefined");
        }
        const interpreterFunction = this.functions.get(this.getConcept(node));
        if (interpreterFunction === null || interpreterFunction === undefined) {
            throw new InterpreterError("Missing interpreter for concept " + this.getConcept(node));
        }
        if (this.tracing) {
            this.tracer.start(node, ctx);
        }
        const value: RtObject = interpreterFunction(node, ctx);
        if (value === undefined) {
            // console.log("Concept " + this.getConcept(node) + " evaluates to undefined");
        }
        if (this.tracing) {
            this.tracer.push(node, value);
            this.tracer.end();
        }
        if (isRtError(value)) {
            console.error(value.toString());
            throw value;
        }
        return value;
    }
}
