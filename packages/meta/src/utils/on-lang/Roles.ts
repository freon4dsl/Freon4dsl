import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaConceptProperty,
    FreMetaProperty,
} from "../../languagedef/metalanguage/index.js";
import { Names } from "./Names.js";

export class Roles {
    // public static elementVarName(concept: FreMetaClassifier): string {
    //     return Names.classifier(concept).toLowerCase();
    // }

    public static customClassifierRole(owningConceptName: string, boxType: string): string {
        let roleName: string = Roles.startWithUpperCase(owningConceptName) + "-custom-";
        if (boxType !== null && boxType !== undefined && boxType.length >= 0) {
            roleName += "-" + boxType;
        }
        return roleName;
    }

    // NB Identical to RoleProvider in core package!!
    //
    public static propertyRole(
        owningConceptName: string,
        propertyName: string,
        boxType?: string,
        index?: number,
    ): string {
        let roleName: string = Roles.startWithUpperCase(owningConceptName) + "-" + propertyName;
        if (index !== null && index !== undefined && index >= 0) {
            roleName += "-" + index;
        }
        if (boxType !== null && boxType !== undefined && boxType.length >= 0) {
            roleName += "-" + boxType;
        }
        return roleName;
    }

    public static property(property: FreMetaProperty): string {
        return Names.classifier(property.owningClassifier) + "-" + property.name;
    }

    public static newPart(property: FreMetaProperty): string {
        return Roles.newConceptPart(property.owningClassifier, property);
        // return Roles.property(property);
    }

    public static newConceptPart(concept: FreMetaClassifier, property: FreMetaProperty): string {
        if (concept instanceof FreMetaBinaryExpressionConcept) {
            if (!!concept.base.referred) {
                if (!(concept.base.referred instanceof FreMetaBinaryExpressionConcept)) {
                    return "FreBinaryExpression" + "-" + property.name;
                }
            }
        }
        return Names.classifier(concept) + "-" + property.name + "-new-list-item";
    }

    public static newConceptReferencePart(reference: FreMetaConceptProperty): string {
        return reference.name;
    }

    private static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substring(1);
        }
        return "";
    }
}
