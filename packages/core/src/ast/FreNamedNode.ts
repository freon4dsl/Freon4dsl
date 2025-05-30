import { FreNode } from "./FreNode.js";
import { FreLanguage, FreLanguageClassifier } from '../language/index.js';
import { isNullOrUndefined } from '../util/index.js';

export interface FreNamedNode extends FreNode {
    name: string;

    // copy(): FreNamedNode;
}

export function qualifiedName(node: FreNamedNode): string[] {
    const result: string[] = [node.name];
    let owner = node.freOwner()
    while (!isNullOrUndefined(owner) ){
        if (!isNullOrUndefined(owner.freOwner())) { // to avoid adding the name of the model!
            let typeDescription: FreLanguageClassifier = FreLanguage.getInstance().classifier(owner.freLanguageConcept());
            if (typeDescription) {
                if (typeDescription.isNamespace) {
                    if (typeDescription.properties.has('name')) {
                        result.splice(0, 0, (owner as FreNamedNode).name);
                    } else {
                        // todo Decide on how to represent anonymous namespaces
                        result.splice(0, 0, '<anonymous>');
                    }
                }
            } else {
                console.error(`Node ${owner.freId()} of type ${owner.freLanguageConcept()} has no type description (building fqn for ${node.name})`)
                // throw new Error(`Node ${next.freId()} of type ${next.freLanguageConcept()} has no type description (searching for ${node.name})`)
            }
        }
        owner = owner.freOwner();
    }
    return result;
}
