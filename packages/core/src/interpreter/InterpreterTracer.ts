import { ConceptFunction, OwningPropertyFunction } from "./IMainInterpreter";
import { InterpreterContext } from "./InterpreterContext";

const INDENT = "    ";
const INDENT_DIRECT = "|-- ";
const INDENT_INDIRECT = "|   ";
/**
 * A map of trace objects where we can find the value based on the element is enough.
 */
class TraceNode<ASTNODE, RTVALUE> {
    tracer: InterpreterTracer<ASTNODE, RTVALUE>;
    value: RTVALUE;
    node: ASTNODE;
    parent: TraceNode<ASTNODE, RTVALUE>;
    children: TraceNode<ASTNODE, RTVALUE>[] = [];
    ctx: InterpreterContext<ASTNODE, RTVALUE>;

    constructor(t: InterpreterTracer<ASTNODE, RTVALUE>) {
        this.tracer = t;
    }

    /**
     * Return a tree-shaped tree with the full calculation.
     */
    toStringRecursive(): string {
        return this.toIndentedString("", true);
    }

    /**
     * Create recursively the tree with all indents etc.
     */
    protected toIndentedString(indent: string, thisIsLast?: boolean): string {
        let result: string;
        if (this.node === undefined) {
            // The root, no output string here
            result = "";
        } else {
            result =
                indent +
                this.tracer.property(this.node) +
                ": " +
                this.tracer.concept(this.node) +
                " = " +
                this.value +
                (this.idValid(this.ctx) ? " Ctx " + this.ctx.toString() : "") +
                "\n";
        }
        this.children.forEach((child: TraceNode<ASTNODE, RTVALUE>, index: number) => {
            let baseIndent = "    ";
            if (!thisIsLast) {
                baseIndent = index === this.children.length ? indent : indent.replace(INDENT_DIRECT, INDENT_INDIRECT);
            } else {
                baseIndent = index === this.children.length ? indent : indent.replace(INDENT_DIRECT, INDENT);
            }
            result += child.toIndentedString(baseIndent + INDENT_DIRECT, index === this.children.length - 1);
        });
        return result;
    }

    idValid(ctx: InterpreterContext<ASTNODE, RTVALUE>) {
        return !!ctx && ctx !== InterpreterContext.EMPTY_CONTEXT;
    }
}

export class InterpreterTracer<ASTNODE, RTVALUE> {
    root: TraceNode<ASTNODE, RTVALUE>;
    current: TraceNode<ASTNODE, RTVALUE>;
    concept: ConceptFunction<ASTNODE>;
    property: OwningPropertyFunction<ASTNODE>;

    constructor(concept: ConceptFunction<ASTNODE>, property: OwningPropertyFunction<ASTNODE>) {
        // create a dummy root
        this.root = new TraceNode<ASTNODE, RTVALUE>(this);
        this.current = this.root;
        this.concept = concept;
        this.property = property;
        this.current.ctx = InterpreterContext.EMPTY_CONTEXT as InterpreterContext<ASTNODE, RTVALUE>;
    }

    /**
     * Start tracing `node` with context `ctx`.
     * This trace will be a child of the current traced node.
     */
    start(node: ASTNODE, ctx?: InterpreterContext<ASTNODE, RTVALUE>) {
        const newTrace = new TraceNode<ASTNODE, RTVALUE>(this);
        newTrace.node = node;
        newTrace.parent = this.current;
        if (this.current.ctx !== ctx) {
            newTrace.ctx = ctx;
        }
        this.current.children.push(newTrace);
        this.current = newTrace;
    }

    push(node: ASTNODE, value: RTVALUE, ctx?: InterpreterContext<ASTNODE, RTVALUE>) {
        if (this.current.node !== node) {
            console.error("INCORRECT ELEMENT IN TRACE");
            throw new Error("INCORRECT ELEMENT IN TRACE");
        }
        this.current.value = value;
    }

    /**
     * Stop tracing `node`.
     * The current node becomes the parent traced node
     */
    end(node: ASTNODE, ctx?: InterpreterContext<ASTNODE, RTVALUE>) {
        this.current = this.current.parent;
    }
}
