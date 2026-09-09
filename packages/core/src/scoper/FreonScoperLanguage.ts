import type { FreScoperLanguage, FreScoperNamedNode, FreScoperNode } from "@freon4dsl/generic-scoper"
import { FreLanguage } from "../language/index.js"
import type { FreNamedNode, FreNode } from "../ast/index.js"

export class FreonScoperLanguage<T extends FreScoperNode<T>> implements FreScoperLanguage<T> {
    public isNamespace(node: FreScoperNode<T>): boolean {
        return FreLanguage.getInstance().classifier(node.freLanguageConcept()).isNamespace
    }

    public conformsToType(node: FreScoperNode<T>, requestedType: string): boolean {
        const metaType = node.freLanguageConcept()
        return metaType === requestedType || FreLanguage.getInstance().subConcepts(requestedType).includes(metaType)
    }

    public builtInNodes(): FreScoperNamedNode<T>[] {
        return this.transformFreNodes(FreLanguage.getInstance().stdLib.elements) as FreScoperNamedNode<T>[]
    }

    private transformFreNodes<T extends FreScoperNode<T>>(nodes: FreNamedNode[]): FreScoperNamedNode<T>[] {
        return nodes.map((node) => node as unknown as FreScoperNamedNode<T>)
    }

}
export const freonScoperLanguage = new FreonScoperLanguage<FreNode>()
