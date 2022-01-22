import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept,
    PiConceptProperty,
    PiProperty
} from "../languagedef/metalanguage";
import { Names } from "./Names";

export class Roles {

    public static elementVarName(concept: PiClassifier): string {
        return Names.classifier(concept).toLowerCase();
    }

    // NB Identical to RoleProvider in core package!!
    //
    public static propertyRole(owningConceptName: string, propertyName: string, boxType?: string, index?: number): string {
        let roleName: string = Roles.startWithUpperCase(owningConceptName) + "-" + propertyName;
        if (index !== null && index !== undefined && index >= 0) {
            roleName += "-" + index;
        }
        if (boxType !== null && boxType !== undefined && boxType.length >= 0) {
            roleName += "-" + boxType;
        }
        return roleName;
    }

    public static property(property: PiProperty): string {
        return Names.classifier(property.owningConcept) + "-" + property.name;
    }

    public static newPart(property: PiProperty): string {
        return Roles.newConceptPart(property.owningConcept, property)
        // return Roles.property(property);
    }

    public static newConceptPart(concept: PiClassifier, property: PiProperty): string {
        if( concept instanceof PiBinaryExpressionConcept) {
            if( !!(concept.base.referred) ){
                if( !(concept.base.referred instanceof PiBinaryExpressionConcept)){
                    return "PiBinaryExpression" + "-" + property.name;
                }
            }
        }
        return Names.classifier(concept) + "-" + property.name + "-new-list-item";
    }

    public static newConceptReferencePart(reference: PiConceptProperty): string {
        return reference.name;
    }

    private static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substr(1);
        }
        return "";
    }

}
