/**
 * This worker class collects all visible names in the model.
 */
import { AstWorker, modelUnit, PiElement, PiModelUnit, PiNamedElement } from "../ast";
import { Language, Property } from "../storage/index";

export class CollectNamesWorker implements AstWorker {
    // 'namesList' holds the named elements found while traversing the model tree
    namesList: PiNamedElement[] = [];
    // 'metatype' may or may not be set; if set any named element is included only if it conforms to this type
    metatype: string;
    // The modelunit where the names search started, needed to decide what is public/private.
    origin: PiModelUnit;

    constructor(origin: PiModelUnit) {
        this.origin = origin;
    }

    private isVisible(element: PiElement, property: Property): boolean {
        // return true;
        const owningUnit = modelUnit(element);
        return (owningUnit == null) || (this.origin === owningUnit) || property.isPublic;
    }

    execBefore(modelelement: PiElement): boolean {
        // find child properties
        // TODO filter only properties that have a name
        const partProperties: Property[] = Language.getInstance().getPropertiesOfKind(modelelement.piLanguageConcept(), "part");
        // walk children
        for(const prop of partProperties){
            if( Language.getInstance().classifier(prop.type).isNamedElement && this.hasLookedForType(prop) && this.isVisible(modelelement, prop)) {
                this.namesList.push(...Language.getInstance().getPropertyValue(modelelement, prop) as PiNamedElement[]);
            }
        }
        return false;
    }

    execAfter(modelelement: PiElement): boolean {
        return false;
    }

    /**
     * Checks whether 'property' has a type that conforms to 'this.metatype'.
     *
     * @param namedElement
     */

    private hasLookedForType(property: Property) {
        if (!!this.metatype) {
            const concept = property.type;
            return (concept === this.metatype || Language.getInstance().subConcepts(this.metatype).includes(concept));
        } else {
            return true;
        }
    }
}


