import { FreNode } from "../../../ast";
import { FreLanguage, FreLanguageProperty, PropertyKind } from "../../../language";

export class UtilCommon {
    static separatorName: string = "Separator";
    static terminatorName: string = "Terminator";
    static initiatorName: string = "Initiator";

    public static getPropertyInfo(element: FreNode, propertyName: string) {
        const property = element[propertyName];
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
            element.freLanguageConcept(),
            propertyName,
        );
        const isList: boolean = propInfo.isList;
        const isPart: PropertyKind = propInfo.propertyKind;
        return { property, isList, isPart };
    }
}
