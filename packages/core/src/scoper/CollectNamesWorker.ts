/**
 * This worker class collects all visible names in the model.
 */
import { PiElement, PiModelUnit, PiNamedElement } from "../ast";
import { AstWorker, modelUnit } from "../ast-utils";
import { Language, Property } from "../language";
import { PiLogger } from "../util/index";

const LOGGER = new PiLogger("CollectNamesWorker").mute();

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
            LOGGER.log(modelelement.piLanguageConcept() + ":  part " + prop.name + " isNamed " + Language.getInstance().classifier(prop.type).isNamedElement +
            "  visible " + this.isVisible(modelelement, prop) + "hasType " + this.hasLookedForType(prop));
            if( Language.getInstance().classifier(prop.type).isNamedElement && this.hasLookedForType(prop) && this.isVisible(modelelement, prop)) {
                LOGGER.log(" push " + (Language.getInstance().getPropertyValue(modelelement, prop) as PiNamedElement[]).map(e => e.name));
                this.namesList.push(...(Language.getInstance().getPropertyValue(modelelement, prop) as PiNamedElement[]));
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


