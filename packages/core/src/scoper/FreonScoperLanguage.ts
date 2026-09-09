import type { ScoperLanguage, ScoperNamedNode, ScoperNode } from "@freon4dsl/generic-scoper"
import { FreLanguage } from "../language/index.js"
import type { FreNamedNode, FreNode } from "../ast/index.js"

export class FreonScoperLanguage<T extends ScoperNode<T>> implements ScoperLanguage<T> {
    public isNamespace(node: ScoperNode<T>): boolean {
        return FreLanguage.getInstance().classifier(node.scoperTypeName()).isNamespace
    }

    public conformsToType(node: ScoperNode<T>, requestedType: string): boolean {
        const metaType = node.scoperTypeName()
        return metaType === requestedType || FreLanguage.getInstance().subConcepts(requestedType).includes(metaType)
    }

    public builtInNodes(): ScoperNamedNode<T>[] {
        return this.transformFreNodes(FreLanguage.getInstance().stdLib.elements) as ScoperNamedNode<T>[]
    }

    private transformFreNodes<T extends ScoperNode<T>>(nodes: FreNamedNode[]): ScoperNamedNode<T>[] {
        return nodes.map((node) => node as unknown as ScoperNamedNode<T>)
    }

}
export const freonScoperLanguage = new FreonScoperLanguage<FreNode>()
