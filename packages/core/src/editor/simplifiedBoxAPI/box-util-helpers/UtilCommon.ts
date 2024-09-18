import { FreNode } from "../../../ast";
import { FreLanguage, FreLanguageProperty, PropertyKind } from "../../../language";
import { FreListInfo } from "../BoxUtil";
import { Box, BoxFactory } from "../../boxes";

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

    public static addListJoin(listJoin: FreListInfo, index: number, numberOfItems: number, element: FreNode, roleName: string, propertyName: string, innerBox: Box): Box[] {
        let result: Box[] = [];
            if (listJoin.type === UtilCommon.separatorName) {
            if (index < numberOfItems - 1) {
                result.push(
                    BoxFactory.horizontalList(element, roleName, propertyName, [
                        innerBox,
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                    ]),
                );
            } else {
                result.push(innerBox);
            }
        } else if (listJoin.type === UtilCommon.terminatorName) {
            result.push(
                BoxFactory.horizontalList(element, roleName, propertyName, [
                    innerBox,
                    BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                ]),
            );
        } else if (listJoin.type === UtilCommon.initiatorName) {
            // TODO test this code
            result.push(
                BoxFactory.horizontalList(element, roleName, propertyName, [
                    BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                    innerBox,
                ]),
            );
        }
        return result;
    }

}
