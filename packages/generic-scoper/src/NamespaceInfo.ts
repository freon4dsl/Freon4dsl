import type { ScoperNode, ScoperReference } from "./internal.js"

/**
 * Describes a namespace that participates in scoping.
 *
 * A namespace can be specified either directly as a model node or indirectly
 * through a ScoperReference that still needs to be resolved.
 *
 * NamespaceInfo is used for both imported namespaces and alternative namespaces.
 * The recursive flag determines whether namespace relationships of the target
 * namespace should also be followed while calculating visibility.
 */
export class NamespaceInfo<T extends ScoperNode<T>> {
    public readonly target: T | ScoperReference
    public readonly recursive: boolean

    constructor(target: T | ScoperReference, recursive: boolean) {
        this.target = target
        this.recursive = recursive
    }
}
