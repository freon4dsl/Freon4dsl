/**
 * Class representing the comntext (or environment) in which an expreession is evaaluated.
 * The context contains values for objects and is hierarchical.
 */
import { RtObject } from "./runtime";

export class InterpreterContext {
    // Dummy context, caan be used as the start context
    public static EMPTY_CONTEXT = new InterpreterContext(null);

    // Map containing values for objects in this context
    private values: Map<Object, RtObject> = new Map<Object, RtObject>();

    // Parent context, used to find objects in case they are not in the current context
    private parentContext: InterpreterContext;

    constructor(parent: InterpreterContext) {
        this.parentContext = parent;
    }

    /**
     * Find the value of `node` in this context, assuming its type is T.
     */
    find<T extends RtObject>(node: Object): T {
        const result = this.values.get(node);
        if (!!result) {
            return result as T;
        } else {
            return this.parentContext?.find(node);
        }
    }

    /**
     * Set the vaalue of `node` to `value`.
     */
    set(node: Object, value: RtObject): void {
        this.values.set(node, value);
    }

    toString(): string {
        let result = "{ ";
        this.values.forEach((value: Object, node: Object) => {
            result += node["name"] + " == " + value + ", ";
        });
        // return result + "}";
        return (
            "{ " +
            Array.from(this.values.entries())
                .map(([node, value]) => {
                    return node["name"] + " == " + value;
                })
                .join(", ") +
            " }"
        );
    }
}
