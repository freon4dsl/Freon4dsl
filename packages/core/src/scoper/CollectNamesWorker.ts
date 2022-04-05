/**
 * This worker class collects all visible names in the model.
 */
import { LanguageWorker, PiElement, PiModelUnit, PiNamedElement } from "../language/index";
import { Language, Property } from "../storage/index";

export class CollectNamesWorker implements LanguageWorker {
    // 'namesList' holds the named elements found while traversing the model tree
    namesList: PiNamedElement[] = [];
    // 'metatype' may or may not be set; if set any named element is included only if it conforms to this type
    metatype: string;
    // The modelunit where the names search started.
    startModelunit: PiModelUnit;

    constructor(modelunit: PiModelUnit) {
        this.startModelunit = modelunit;
    }

    execBefore(modelelement: PiElement): boolean {
        // find child properties
        // TODO filter only properties that have a name
        const partProperties: Property[] = Language.getInstance().getPropertiesOfKind(modelelement.piLanguageConcept(), "part");
        // walk children
        for(const prop of partProperties){
            if( Language.getInstance().classifier(prop.type).isNamedElement && this.hasLookedForType(prop) ) {
                for (const part of Language.getInstance().getPropertyValue(modelelement, prop) as PiNamedElement[]) {
                    this.namesList.push(part);
                }
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


