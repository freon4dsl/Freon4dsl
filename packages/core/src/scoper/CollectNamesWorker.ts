/**
 * This worker class collects all visible names in the model.
 */
import { element } from "svelte/internal";
import { PiElement, PiModelUnit, PiNamedElement } from "../ast";
import { AstWorker, modelUnit } from "../ast-utils";
import { Language, Property } from "../language";
import { PiLogger } from "../logging";

const LOGGER = new PiLogger("CollectNamesWorker").mute();

export class CollectNamesWorker implements AstWorker {
    // 'namesList' holds the named elements found while traversing the model tree
    namesList: PiNamedElement[] = [];
    // 'metatype' may or may not be set; if set any named element is included only if it conforms to this type
    metatype: string;
    // The modelunit where the names search started, TODO check this: needed to decide what is public/private.
    origin: PiModelUnit;

    constructor(origin: PiModelUnit) {
        this.origin = origin;
    }

    private isVisible(element: PiElement, property: Property): boolean {
        // return true;
        const owningUnit = modelUnit(element);
        const result = (owningUnit === null) || (this.origin === owningUnit) || property.isPublic;
        if(!result){
            LOGGER.log("isVisible fale for " + element.piLanguageConcept() + "." + element["name"] + " property " + property.name);
        }
        return result;
    }

    execBefore(modelelement: PiElement): boolean {
        // find child properties
        // TODO filter only properties that have a name
        const partProperties: Property[] = Language.getInstance().getPropertiesOfKind(modelelement.piLanguageConcept(), "part");
        // walk children
        for(const prop of partProperties){
            if (this.isVisible(modelelement, prop)) {
                this.addIfOk(Language.getInstance().getPropertyValue(modelelement, prop));
            }
        }
        return false;
    }

    private addIfOk(elements: PiElement[]): void {
        for(const elem of elements) {
            if(Language.getInstance().classifier(elem.piLanguageConcept()).isNamedElement && this.hasLookedForType(elem)) {
                this.namesList.push(elem as PiNamedElement);
            }
        }
    }

    execAfter(modelelement: PiElement): boolean {
        return false;
    }

    /**
     * Checks whether 'property' has a type that conforms to 'this.metatype'.
     *
     * @param namedElement
     */

    private hasLookedForType(element: PiElement) {
        if (!!this.metatype) {
            const concept = element.piLanguageConcept();
            return (concept === this.metatype || Language.getInstance().subConcepts(this.metatype).includes(concept));
        } else {
            return true;
        }
    }
}


