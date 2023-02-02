/**
 * This worker class collects all visible names in the model.
 */
import { element } from "svelte/internal";
import { FreNode, FreModelUnit, FreNamedNode } from "../ast";
import { AstWorker, modelUnit } from "../ast-utils";
import { FreLanguage, Property } from "../language";
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

    private isVisible(element: FreNode, property: Property): boolean {
        // return true;
        const owningUnit = modelUnit(element);
        const result = (owningUnit === null) || (this.origin === owningUnit) || property.isPublic;
        if(!result){
            LOGGER.log("isVisible fale for " + element.freLanguageConcept() + "." + element["name"] + " property " + property.name);
        }
        return result;
    }

    execBefore(modelelement: FreNode): boolean {
        // find child properties
        // TODO filter only properties that have a name
        const partProperties: Property[] = FreLanguage.getInstance().getPropertiesOfKind(modelelement.freLanguageConcept(), "part");
        // walk children
        for(const prop of partProperties){
            if (this.isVisible(modelelement, prop)) {
                this.addIfOk(FreLanguage.getInstance().getPropertyValue(modelelement, prop));
            }
        }
        return false;
    }

    private addIfOk(elements: FreNode[]): void {
        for(const elem of elements) {
            if(FreLanguage.getInstance().classifier(elem.freLanguageConcept())?.isNamedElement && this.hasLookedForType(elem)) {
                this.namesList.push(elem as FreNamedNode);
            }
        }
    }

    execAfter(modelelement: FreNode): boolean {
        return false;
    }

    /**
     * Checks whether 'property' has a type that conforms to 'this.metatype'.
     *
     * @param namedElement
     */

    private hasLookedForType(element: FreNode) {
        if (!!this.metatype) {
            const concept = element.freLanguageConcept();
            return (concept === this.metatype || FreLanguage.getInstance().subConcepts(this.metatype).includes(concept));
        } else {
            return true;
        }
    }
}


