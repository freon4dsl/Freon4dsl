import { FreLanguageConcept, FreLanguageInterface, FreLanguageModelUnit } from "../../language";
import { FreNode } from "../../ast";

export class RoleProvider {
    public static classifier(concept: FreLanguageModelUnit | FreLanguageConcept | FreLanguageInterface): string {
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
            return word[0].toUpperCase() + word.substring(1);
        }
        return "";
    }

    public static label(element: FreNode, uid: string): string {
        return RoleProvider.startWithUpperCase(element.freLanguageConcept()) + element.freId() + "-label-" + uid;
    }

    static indent(element: FreNode, uid: string) {
        return RoleProvider.startWithUpperCase(element.freLanguageConcept()) + element.freId() + "-indent-" + uid;
    }

    static cell(owningConceptName: string, propertyName: string, rowIndex: number, columnIndex: number) {
        let roleName: string = RoleProvider.startWithUpperCase(owningConceptName) + "-" + propertyName;
        roleName += "-row-" + rowIndex + "-column-" + columnIndex;
        return roleName;
    }

    static row(owningConceptName: string, propertyName: string, index: number) {
        return RoleProvider.startWithUpperCase(owningConceptName) + "-" + propertyName + "-row-" + index;
    }
}
