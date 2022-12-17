/**
 * Class representing the comntext (or environment) in which an expreession is evaaluated.
 * The context contains values for objects and is hierarchical.
 */
import { PiElement } from "../ast/index";

export class InterpreterContext<RT_VALUE> {
    // Dummy context, can be used as the start context
    public static EMPTY_CONTEXT = new InterpreterContext(null);

    // Map containing values for objects in this context
    private values: Map<PiElement, RT_VALUE> = new Map<PiElement, RT_VALUE>();

    // Parent context, used to find objects in case they are not in the current context
    private parentContext: InterpreterContext<RT_VALUE>;

    constructor(parent: InterpreterContext<RT_VALUE>) {
        this.parentContext = parent;
    }

    /**
     * Find the value of `node` in this context, assuming its type is T.
     */
    find<T extends RT_VALUE>(node: PiElement): RT_VALUE {
        const result = this.values.get(node);
        if(!!result) {
            return result as T;
        } else {
            return this.parentContext?.find(node);
        }
    }

    /**
     * Set the vaalue of `node` to1 `value`.
     */
    set(node: PiElement, value: RT_VALUE): void {
        this.values.set(node, value);
    }

    toString(): string {
        let result = "{ ";
        this.values.forEach( (value: Object, node: Object) => {
            result += node["name"] + " == " + value +", ";
        });
        // return result + "}";
        return "{ " +
        Array.from(this.values.entries()).map(
            ([node, value]) => {return node["name"] + " == " + value; }
        ).join(", ") +
            " }"
    }
}
