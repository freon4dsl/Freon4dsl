import type { FreNamedNode,  FreNodeReference } from '../ast/index.js';
import type { FreScoperNode } from "./internal.js"

/**
 * This class holds the information on namespace imports and namespace alternatives.
 */

export class FreNamespaceInfo<T extends FreScoperNode<T>> {
    public readonly _myNode: T | FreNodeReference<FreNamedNode>

    public readonly recursive: boolean

    constructor(node: T | FreNodeReference<FreNamedNode>, recursive: boolean) {
        this._myNode = node
        this.recursive = recursive
    }
}
