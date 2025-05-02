import { FreNode } from "./FreNode.js";
import { FreLanguage, FreLanguageClassifier } from '../language/index.js';

export interface FreNamedNode extends FreNode {
    name: string;

    // copy(): FreNamedNode;
}

export function qualifiedName(node: FreNamedNode): string[] {
    const result: string[] = recursiveQualifiedName(node).reverse();
    result.push(node.name);
    return result;
}

function recursiveQualifiedName(node: FreNamedNode): string[] {
    const result: string[] = [];
    let next: FreNode = node.freOwner();
    if (next) {
        let typeDescription: FreLanguageClassifier = FreLanguage.getInstance().classifier(next.freLanguageConcept());
        if (typeDescription.isNamespace) {
            if (typeDescription.properties.has("name")) {
                result.push((next as FreNamedNode).name);
            }
        }
        result.push(...recursiveQualifiedName(next as FreNamedNode));
    }
    return result;
}
