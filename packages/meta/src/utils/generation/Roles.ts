import {
    FreBinaryExpressionConcept,
    FreClassifier,
    FreConceptProperty,
    FreProperty
} from "../../languagedef/metalanguage";
import { Names } from "./Names";

export class Roles {

    public static elementVarName(concept: FreClassifier): string {
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

    public static property(property: FreProperty): string {
        return Names.classifier(property.owningClassifier) + "-" + property.name;
    }

    public static newPart(property: FreProperty): string {
        return Roles.newConceptPart(property.owningClassifier, property);
        // return Roles.property(property);
    }

    public static newConceptPart(concept: FreClassifier, property: FreProperty): string {
        if ( concept instanceof FreBinaryExpressionConcept) {
            if ( !!(concept.base.referred) ) {
                if ( !(concept.base.referred instanceof FreBinaryExpressionConcept)) {
                    return "FreBinaryExpression" + "-" + property.name;
                }
            }
        }
        return Names.classifier(concept) + "-" + property.name + "-new-list-item";
    }

    public static newConceptReferencePart(reference: FreConceptProperty): string {
        return reference.name;
    }

    private static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substring(1);
        }
        return "";
    }

}
