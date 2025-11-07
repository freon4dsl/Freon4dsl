import type { FreNode } from "./FreNode.js";
import { FreLanguage, } from '../language/index.js';
import type { FreLanguageClassifier } from '../language/index.js';
import { notNullOrUndefined } from '../util/index.js';
import { FreLogger } from '../logging/index.js';

export interface FreNamedNode extends FreNode {
    name: string;
}

/**
 * Builds a fully qualified name for 'node' based on the names (if present) of the namespaces that
 * 'node' resides in. If an unnamed namespace is encountered, the string '<anonymous>' is added to the
 * result. The name of the model is never part of this fqn, because this name cannot be resolved in any
 * namespace within the model.
 *
 * @param node
 */
export function qualifiedName(node: FreNamedNode): string[] {
    const LOGGER = new FreLogger("FreNamedNode").mute();
    const result: string[] = [node.name];
    let owner = node.freOwner()
    while (notNullOrUndefined(owner) ){
        if (notNullOrUndefined(owner.freOwner())) { // to avoid adding the name of the model!
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
                LOGGER.error(`Node ${owner.freId()} of type ${owner.freLanguageConcept()} has no type description (building fqn for ${node.name})`)
                // throw new Error(`Node ${next.freId()} of type ${next.freLanguageConcept()} has no type description (searching for ${node.name})`)
            }
        }
        owner = owner.freOwner();
    }
    return result;
}
