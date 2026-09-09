import { notNullOrUndefined } from "./SimpleUtils.js"
import type { DeclaredNodeProvider, ScoperNode } from "./internal.js"
import { Namespace } from "./internal.js"

/**
 * Registry of all namespace objects created during scoping.
 *
 * A Namespace is the scoper's representation of a model node that acts as
 * a namespace. This registry ensures that each such model node is represented
 * by exactly one Namespace instance.
 *
 * Namespace objects are created lazily: a Namespace is only created when
 * it is first needed by the scoper.
 *
 * The type parameter T represents the common base type of all nodes
 * participating in scoping.
 */
export class NamespaceRegistry<T extends ScoperNode<T>> {
    /**
     * Maps model nodes to their corresponding namespace representation.
     *
     * The model node itself is used as the key, so repeated requests for the
     * same node return the same Namespace instance.
     */
    private allNamespaces: Map<ScoperNode<T>, Namespace<T>> = new Map()

    /**
     * Provides the declarations contained directly in a namespace.
     *
     * It is passed to every Namespace created by this registry.
     */
    private readonly declaredNodeProvider: DeclaredNodeProvider<T>

    constructor(declaredNodeProvider: DeclaredNodeProvider<T>) {
        this.declaredNodeProvider = declaredNodeProvider
    }

    /**
     * Returns the namespace representation for the given model node.
     *
     * If a Namespace has already been created for the node, the existing
     * instance is returned. Otherwise a new namespace is created, registered,
     * and returned.
     *
     * @param node Model node that represents a namespace.
     */
    public getOrCreate(node: T): Namespace<T> {
        const existing: Namespace<T> | undefined = this.allNamespaces.get(node)

        if (notNullOrUndefined(existing)) {
            return existing
        }

        const result = new Namespace<T>(
            node,
            this,
            this.declaredNodeProvider,
        )
        this.allNamespaces.set(node, result)

        return result
    }
}
