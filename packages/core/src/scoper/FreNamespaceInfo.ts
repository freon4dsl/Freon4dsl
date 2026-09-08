import type { FreScoperNode, FreScoperReference } from "./internal.js"

/**
 * This class holds the information on namespace imports and namespace alternatives.
 */

export class FreNamespaceInfo<T extends FreScoperNode<T>> {
    public readonly target: T | FreScoperReference
    public readonly recursive: boolean

    constructor(node: T | FreScoperReference, recursive: boolean) {
        this.target = node
        this.recursive = recursive
    }
}
