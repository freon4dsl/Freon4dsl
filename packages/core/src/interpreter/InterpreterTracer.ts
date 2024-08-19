import { jsonAsString } from "../util/index";
import { ConceptFunction, OwningPropertyFunction } from "./IMainInterpreter";
import { InterpreterContext } from "./InterpreterContext";
import { RtObject } from "./runtime";

const INDENT = "    ";
const INDENT_DIRECT = "|-- ";
const INDENT_INDIRECT = "|   ";
/**
 * A map of trace objects where we can find the value based on the element is enough.
 */
class TraceNode {
    tracer: InterpreterTracer;
    value: RtObject;
    node: Object;
    parent: TraceNode;
    children: TraceNode[] = [];
    ctx: InterpreterContext;

    constructor(t: InterpreterTracer) {
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
                jsonAsString(this.value) +
                (this.idValid(this.ctx) ? " Ctx " + this.ctx.toString() : "") +
                "\n";
        }
        this.children.forEach((child: TraceNode, index: number) => {
            let baseIndent: string;
            if (!thisIsLast) {
                baseIndent = index === this.children.length ? indent : indent.replace(INDENT_DIRECT, INDENT_INDIRECT);
            } else {
                baseIndent = index === this.children.length ? indent : indent.replace(INDENT_DIRECT, INDENT);
            }
            result += child.toIndentedString(baseIndent + INDENT_DIRECT, index === this.children.length - 1);
        });
        return result;
    }

    idValid(ctx: InterpreterContext) {
        return !!ctx && ctx !== InterpreterContext.EMPTY_CONTEXT;
    }
}

export class InterpreterTracer {
    root: TraceNode;
    current: TraceNode;
    concept: ConceptFunction;
    property: OwningPropertyFunction;

    constructor(concept: ConceptFunction, property: OwningPropertyFunction) {
        // create a dummy root
        this.root = new TraceNode(this);
        this.current = this.root;
        this.concept = concept;
        this.property = property;
        this.current.ctx = InterpreterContext.EMPTY_CONTEXT;
    }

    /**
     * Start tracing `node` with context `ctx`.
     * This trace will be a child of the current traced node.
     */
    start(node: Object, ctx?: InterpreterContext) {
        const newTrace = new TraceNode(this);
        newTrace.node = node;
        newTrace.parent = this.current;
        if (this.current.ctx !== ctx) {
            newTrace.ctx = ctx;
        }
        this.current.children.push(newTrace);
        this.current = newTrace;
    }

    push(node: Object, value: RtObject) {
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
    end() {
        this.current = this.current.parent;
    }
}
