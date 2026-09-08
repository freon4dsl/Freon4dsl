import type { FreScoperLanguage, FreScoperNode } from "../internal.js"
import { FreLanguage } from "../../language/index.js"

export class FreonScoperLanguage<T extends FreScoperNode<T>> implements FreScoperLanguage<T> {
    public isNamespace(node: FreScoperNode<T>): boolean {
        return FreLanguage.getInstance().classifier(node.freLanguageConcept()).isNamespace
    }

    public conformsToType(node: FreScoperNode<T>, requestedType: string): boolean {
        const metaType = node.freLanguageConcept()

        return metaType === requestedType || FreLanguage.getInstance().subConcepts(requestedType).includes(metaType)
    }
}
