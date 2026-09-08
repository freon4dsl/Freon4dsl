import type { FreDeclaredNodeProvider, FreScoperNode } from "./internal.js"
import { FreNamespace } from "./internal.js"
import { notNullOrUndefined } from "../util/index.js"

export class FreNamespaceRegistry<T extends FreScoperNode<T>> {
    private allNamespaces: Map<FreScoperNode<T>, FreNamespace<T>> = new Map()
    private readonly declaredNodeProvider: FreDeclaredNodeProvider<T>

    constructor(declaredNodeProvider: FreDeclaredNodeProvider<T>) {
        this.declaredNodeProvider = declaredNodeProvider
    }

    public getOrCreate(node: T): FreNamespace<T> {
        const existing: FreNamespace<T> | undefined = this.allNamespaces.get(node)

        if (notNullOrUndefined(existing)) {
            return existing
        }

        const result = new FreNamespace<T>(node, this, this.declaredNodeProvider)
        this.allNamespaces.set(node, result)
        return result
    }
}
