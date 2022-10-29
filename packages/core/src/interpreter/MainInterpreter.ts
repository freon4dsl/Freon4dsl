import { InterpreterContext } from "./InterpreterContext";
import { InterpreterError } from "./InterpreterException";
import { InterpreterTracer } from "./InterpreterTracer";
import { ConceptFunction, EvaluateFunction, IMainInterpreter, InitFunction, OwningPropertyFunction } from "./IMainInterpreter";
import { isRtError } from "./runtime/index";

/**
 * The main interpreter class, usually hidden by a facade specific for a project.
 */
export class MainInterpreter<ASTNODE, RTVALUE> implements IMainInterpreter<ASTNODE, RTVALUE> {
    // Lookup map of all evaluate functions from all interpreters
    private functions: Map<string, EvaluateFunction<ASTNODE, RTVALUE>> = new Map<string, EvaluateFunction<ASTNODE, RTVALUE>>();
    private tracing: boolean = false;
    private tracer: InterpreterTracer<ASTNODE, RTVALUE>;
    // Function to get the concept name / type of a node
    private getConcept: ConceptFunction<ASTNODE>;
    // Function to get the name of the property in which a node is stored.
    private getProperty: OwningPropertyFunction<ASTNODE>;

    private static privateInstance;

    /**
     *
     * @param init                Initialize function for interpreter, is generated in the "interpreters" directory.
     * @param getConceptFunction  Function that gets the typeName from an object
     * @param getPropertyFunction Function that gets the property name in which an object is stored in its parent
     */

    public static instance(
        init: InitFunction<any, any>,
        getConceptFunction: ConceptFunction<any>,
        getPropertyFunction: OwningPropertyFunction<any>
    ): IMainInterpreter<any, any> {
        if (MainInterpreter.privateInstance === undefined) {
            MainInterpreter.privateInstance = new MainInterpreter(init, getConceptFunction, getPropertyFunction);
        }
        console.log("MainInterpreter.instance is now " + MainInterpreter.privateInstance);
        return MainInterpreter.privateInstance;
    }

    constructor(init: InitFunction<ASTNODE, RTVALUE>, getConceptFunction: ConceptFunction<ASTNODE>, getPropertyFunction: OwningPropertyFunction<ASTNODE>) {
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
    public registerFunction(name: string, func: EvaluateFunction<ASTNODE, RTVALUE>): void {
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
    public getTrace(): InterpreterTracer<ASTNODE, RTVALUE> {
        return this.tracer;
    }

    /**
     * @see IMainInterpreter.evaluate
     * Evaluate `node` with context `ctx` aand return the value
     */
    public evaluate(node: ASTNODE, ctx: InterpreterContext<ASTNODE, RTVALUE>): RTVALUE {
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
        const value: RTVALUE = interpreterFunction(node, ctx);
        if (value === undefined) {
            console.log("Concept " + this.getConcept(node) + " evaluates to undefined");
        }
        if (this.tracing) {
            this.tracer.push(node, value);
            this.tracer.end(node);
        }
        if (isRtError(value)) {
            console.error(value.toString());
            throw value;
        }
        return value;
    }
}
