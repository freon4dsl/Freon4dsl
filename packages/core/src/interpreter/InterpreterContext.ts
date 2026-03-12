/**
 * Class representing the context (or environment) in which an expression is evaluated.
 * The context contains values for objects and is hierarchical.
 */
import { notNullOrUndefined } from "../util/index.js"
import type { RtObject } from "./runtime/index.js";

export class InterpreterContext {
    // Dummy context, can be used as the start context
    public static EMPTY_CONTEXT = new InterpreterContext(null);

    // Map containing values for objects in this context
    private values: Map<object, RtObject> = new Map<object, RtObject>();

    // Parent context, u                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            sed to find objects in case they are not in the current context
    private parentContext: InterpreterContext;

    constructor(parent: InterpreterContext) {
        this.parentContext = parent;
    }

    /**
     * Find the value of `node` in this context, assuming its type is T.
     */
    find<T extends RtObject>(node: object): T {
        const result = this.values.get(node);
        if (notNullOrUndefined(result)) {
            return result as T;
        } else {
            return this.parentContext?.find(node);
        }
    }

    /**
     * Set the value of `node` to `value`.
     */
    set(node: object, value: RtObject): void {
        this.values.set(node, value);
    }

    toString(): string {
        let result = "{ ";
        this.values.forEach((value: object, node: object) => {
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
