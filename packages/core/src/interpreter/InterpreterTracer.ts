import { PiElement } from "../ast/index";
import { ConceptFunction, OwningPropertyFunction } from "./IMainInterpreter";
import { InterpreterContext } from "./InterpreterContext";

const INDENT = "    ";
const INDENT_DIRECT = "|-- ";
const INDENT_INDIRECT = "|   ";
/**
 * A map of trace objects where we can find the value based on the element is enough.
 */
class TraceNode<RT_VALUE> {
    tracer: InterpreterTracer<RT_VALUE>;
    value: RT_VALUE;
    node: PiElement;
    parent: TraceNode<RT_VALUE>;
    children: TraceNode<RT_VALUE>[] = [];
    ctx: InterpreterContext<RT_VALUE>;

    constructor(t: InterpreterTracer<RT_VALUE>) {
        this.tracer = t;
    }

    /**
     * Return a tree-shaped tree with the full calculation.
     */
    toStringRecursive(): string {
        return this.toIndentedString("", true)
    }

    /**
     * Create recursively the tree with all indents etc.
     */
    protected toIndentedString(indent: string, thisIsLast?: boolean): string {
        let result: string;
        if( this.node === undefined ) {
            // The root, no output string here
            result = "";
        } else {
            result = indent + this.tracer.property(this.node) + ": " + this.tracer.concept(this.node) + " = " + this.value + (this.idValid(this.ctx)? " Ctx " + this.ctx.toString() : "")  + "\n";
        }
        this.children.forEach((child: TraceNode<RT_VALUE>, index: number) => {
            let baseIndent = "    ";
            if( !thisIsLast) {
                baseIndent = (index === this.children.length ? indent : indent.replace(INDENT_DIRECT, INDENT_INDIRECT));
            }else {
                baseIndent = (index === this.children.length ? indent : indent.replace(INDENT_DIRECT, INDENT));
            }
            result += child.toIndentedString(baseIndent + INDENT_DIRECT, (index === this.children.length-1));
        } );
        return result;
    }

    idValid(ctx: InterpreterContext<RT_VALUE>){
        return !!ctx && (ctx !== InterpreterContext.EMPTY_CONTEXT);
    }
}

export class InterpreterTracer< RT_VALUE> {
    root: TraceNode<RT_VALUE>;
    current: TraceNode<RT_VALUE>;
    concept: ConceptFunction;
    property: OwningPropertyFunction;

    constructor(concept: ConceptFunction, property: OwningPropertyFunction) {
        // create a dummy root
        this.root = new TraceNode(this);
        this.current = this.root;
        this.concept = concept;
        this.property = property;
        this.current.ctx = InterpreterContext.EMPTY_CONTEXT as InterpreterContext<RT_VALUE>;
    }

    /**
     * Start tracing `node` with context `ctx`.
     * This trace will be a child of the current traced node.
     */
    start(node: PiElement, ctx?: InterpreterContext<RT_VALUE> ) {
        const newTrace = new TraceNode(this);
        newTrace.node = node;
        newTrace.parent = this.current;
        if( this.current.ctx !== ctx) {
            newTrace.ctx = ctx;
        }
        this.current.children.push(newTrace);
        this.current = newTrace;
    }

    push(node: PiElement, value: RT_VALUE, ctx?: InterpreterContext<RT_VALUE> ) {
        if(this.current.node !== node) {
            console.error("INCORRECT ELEMENT IN TRACE");
            throw new Error("INCORRECT ELEMENT IN TRACE")
        }
        this.current.value = value;
    }

    /**
     * Stop tracing `node`.
     * The current node becomes the parent traced node
     */
    end(node: Object, ctx?: InterpreterContext<RT_VALUE> ) {
        this.current = this.current.parent;
    }
}


