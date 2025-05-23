/**
 * This worker class collects all visible names in the model.
 */
import { FreNode, FreNamedNode } from "../ast/index.js";
import { AstWorker } from "../ast-utils/index.js";
import { FreLanguage, FreLanguageProperty } from "../language/index.js";
// import { FreLogger } from "../logging/index.js";

// const LOGGER = new FreLogger("CollectDeclaredNodesWorker").mute();

export class CollectDeclaredNodesWorker implements AstWorker {
    // 'namesList' holds the named elements found while traversing the model tree
    namesList: FreNamedNode[] = [];

    execBefore(modelelement: FreNode): boolean {
        // find child properties
        const partProperties: FreLanguageProperty[] = FreLanguage.getInstance().getPropertiesOfKind(
            modelelement.freLanguageConcept(),
            "part",
        );
        // walk children
        for (const childProp of partProperties) {
            // get the concept of the child and see if that one has a 'name' property
            if (FreLanguage.getInstance().classifier(childProp.type)?.isNamedElement) {
                // get the value of the childProp in the modelelement and add it, iff its type is ok
                for (const elem of FreLanguage.getInstance().getPropertyValue(modelelement, childProp)) {
                    this.namesList.push(elem as FreNamedNode);
                }
            }
        }
        return false;
    }

    // @ts-ignore
    // parameter is present to adhere to signature of super class
    execAfter(modelelement: FreNode): boolean {
        return false;
    }
}
