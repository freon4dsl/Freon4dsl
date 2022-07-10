import { InterpreterContext } from "./InterpreterContext";
import { InterpreterTracer } from "./InterpreterTracer";
import {
    ConceptFunction,
    EvaluateFunction,
    IMainInterpreter,
    InitFunction,
    OwningPropertyFunction
} from "./IMainInterpreter";

/**
 * The main interpreter class, usually hidden by a facade specific for a project.
 */
export class MainInterpreter implements IMainInterpreter {
    // Lookup map of all evaluate functions from all interpreters
    private functions: Map<string, EvaluateFunction> = new Map<string, EvaluateFunction>();
    private tracing: boolean = false;
    private tracer: InterpreterTracer;
    // Function to get the concept name / type of a node
    private getConcept: ConceptFunction;
    // Function to get the name of the property in which a node is stored.
    private getProperty: OwningPropertyFunction;

    private static privateInstance = null;

    /**
     *
     * @param init                Initialize function for interpreter, is generated in the "interpreters" directory.
     * @param getConceptFunction  Function that gets the typeName from a JSON object
     * @param getPropertyFunction Function that gets the property name in which a JSON object is stored in its parent
     */
    public static instance(init: InitFunction, getConceptFunction: ConceptFunction, getPropertyFunction: OwningPropertyFunction): IMainInterpreter {
        if( MainInterpreter.privateInstance === null) {
            MainInterpreter.privateInstance = new MainInterpreter(init, getConceptFunction, getPropertyFunction);
        }
        return MainInterpreter.privateInstance;
    }

    constructor(init: InitFunction, getConceptFunction: ConceptFunction, getPropertyFunction: OwningPropertyFunction){``
        init(this);
        this.getConcept = getConceptFunction;
        this.getProperty = getPropertyFunction
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
    public evaluate(node: Object, ctx: InterpreterContext): Object {
        if( node === undefined || node === null){
            console.error("Cannot interpret null/undefined element " + node);
            return undefined;
        }
        if(Array.isArray(node) ) {
            const resultArray: Object[] = [];
            for (const element of node) {
                const result = this.evaluate(element,ctx);
                resultArray.push(result);
            }
            return resultArray;
        } else {
            const interpreterFunction = this.functions.get(this.getConcept(node));
            if (interpreterFunction === null || interpreterFunction === undefined) {
                console.error("Missing interpreter for concept " + this.getConcept(node));
                return undefined;
            }
            if (this.tracing) {
                this.tracer.start(node, ctx);
            }
            const value = interpreterFunction(node, ctx);
            if( value === undefined){
                console.log("Concept " + this.getConcept(node) + " evaluates to undefined");
            }
            if (this.tracing) {
                this.tracer.push(node, value);
                this.tracer.end(node);
            }
            return value;
        }
    }
}
