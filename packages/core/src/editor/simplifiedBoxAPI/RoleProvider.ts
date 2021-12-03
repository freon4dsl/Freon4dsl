import { Concept, Interface, ModelUnit } from "../../storage";
import { PiElement } from "../../language";

export class RoleProvider {
    static uniqueLabelNumber: number = 1;
    static uniqueIndentNumber: number = 1;

    public static classifier(concept: ModelUnit | Concept | Interface): string {
        return RoleProvider.startWithUpperCase(concept.typeName);
    }

    public static property(owningConceptName: string, propertyName: string, boxType?: string, index?: number): string {
        let roleName: string = RoleProvider.startWithUpperCase(owningConceptName) + "-" + propertyName;
        if (index !== null && index !== undefined && index >= 0) {
            roleName += "-" + index;
        }
        if (boxType !== null && boxType !== undefined && boxType.length >= 0) {
            roleName += "-" + boxType;
        }
        return roleName;
    }

    private static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substr(1);
        }
        return "";
    }

    public static label(element: PiElement): string {
        return RoleProvider.startWithUpperCase(element.piLanguageConcept()) + element.piId() + "-label-" + this.uniqueLabelNumber++;
    }

    static indent(element: PiElement) {
        return RoleProvider.startWithUpperCase(element.piLanguageConcept()) + element.piId() + "-label-" + this.uniqueIndentNumber++;
    }
}
