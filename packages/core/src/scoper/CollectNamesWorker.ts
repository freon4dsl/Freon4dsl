/**
 * This worker class collects all visible names in the model.
 */
import { FreNode, FreModelUnit, FreNamedNode } from "../ast";
import { AstWorker, modelUnit } from "../ast-utils";
import { FreLanguage, FreLanguageProperty } from "../language";
import { FreLogger } from "../logging";

const LOGGER = new FreLogger("CollectNamesWorker").mute();

export class CollectNamesWorker implements AstWorker {
    // 'namesList' holds the named elements found while traversing the model tree
    namesList: FreNamedNode[] = [];
    // 'metatype' may or may not be set; if set any named element is included only if it conforms to this type
    metatype: string;
    // The modelunit where the names search started, TODO check this: needed to decide what is public/private.
    origin: FreModelUnit;

    constructor(origin: FreModelUnit) {
        this.origin = origin;
    }

    private isVisible(freNode: FreNode, property: FreLanguageProperty): boolean {
        // return true;
        const owningUnit = modelUnit(freNode);
        const result = owningUnit === null || this.origin === owningUnit || property.isPublic;
        if (!result) {
            LOGGER.log(
                "isVisible fale for " +
                    freNode.freLanguageConcept() +
                    "." +
                    freNode["name"] +
                    " property " +
                    property.name,
            );
        }
        return result;
    }

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
                // check whether the child is visible
                if (this.isVisible(modelelement, childProp)) {
                    // get the value of the childProp in the modelelement and add it, iff its type is ok
                    for (const elem of FreLanguage.getInstance().getPropertyValue(modelelement, childProp)) {
                        if (this.hasLookedForType(elem)) {
                            this.namesList.push(elem as FreNamedNode);
                        }
                    }
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

    /**
     * Checks whether 'property' has a type that conforms to 'this.metatype'.
     *
     * @param freNode
     * @private
     */
    private hasLookedForType(freNode: FreNode) {
        if (!!this.metatype) {
            return FreLanguage.getInstance().metaConformsToType(freNode, this.metatype);
        } else {
            return true;
        }
    }
}
