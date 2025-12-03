/**
 * This worker class collects all visible names in a subtree of the model.
 * The subtree is bounded by (1) its root, and (2) by any children that are namespaces.
 * The exact bounds for the children are set in FreNamespace.getDeclaredNodes().
 *
 */
import type { FreNode, FreNamedNode } from "../ast/index.js";
import type { AstWorker } from "../ast-utils/index.js";
import { FreLanguage, type FreLanguageProperty } from "../language/index.js";

export class CollectDeclaredNodesWorker implements AstWorker {
    // 'namesList' holds the named elements found while traversing the model tree
    namesList: FreNamedNode[] = [];

    execBefore(freNode: FreNode): boolean {
        // find child properties
        const partProperties: FreLanguageProperty[] = FreLanguage.getInstance().getPropertiesOfKind(
            freNode.freLanguageConcept(),
            "part",
        );
        // walk children
        for (const childProp of partProperties) {
            // get the concept of the child and see if that one has a 'name' property
            if (FreLanguage.getInstance().classifier(childProp.type)?.isNamedElement) {
                // get the value of the childProp in the modelelement and add it, iff its type is ok
                for (const elem of FreLanguage.getInstance().getPropertyValue(freNode, childProp)) {
                    this.namesList.push(elem as FreNamedNode);
                }
            }
        }
        return false;
    }

    // @ts-ignore parameter is present to adhere to signature of super class
    execAfter(freNode: FreNode): boolean {
        return false;
    }
}
