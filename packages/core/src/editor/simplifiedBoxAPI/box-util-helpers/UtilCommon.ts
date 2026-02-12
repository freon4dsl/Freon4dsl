import type { FreNode } from "../../../ast/index.js";
import { FreLanguage } from "../../../language/index.js";
import type { FreLanguageProperty, PropertyKind } from "../../../language/index.js";
import { isNullOrUndefined } from "../../../util/index.js"
import { FreListInfo } from "../BoxUtil.js";
import type { Box } from "../../boxes/index.js";
import { BoxFactory } from "../../boxes/index.js";

export class UtilCommon {
    static separatorName: string = "Separator"
    static terminatorName: string = "Terminator"
    static initiatorName: string = "Initiator"

    public static getPropertyInfo(node: FreNode, propertyName: string) {
        const property = node[propertyName]
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName)
        const isList: boolean = propInfo.isList
        const isPart: PropertyKind = propInfo.propertyKind
        return { property, isList, isPart }
    }

    public static addListJoin(
        listJoin: FreListInfo,
        index: number,
        numberOfItems: number,
        node: FreNode,
        roleName: string,
        propertyName: string,
        innerBox: Box,
    ): Box[] {
        let result: Box[] = []
        if (isNullOrUndefined(listJoin) || listJoin === FreListInfo.NullListInfo) {
            return [innerBox]
        } else {
            if (listJoin.type === UtilCommon.separatorName) {
                if (index < numberOfItems - 1) {
                    result.push(
                        BoxFactory.horizontalLayout(node, roleName, propertyName, [
                            innerBox,
                            BoxFactory.label(node, roleName + "list-item-label", listJoin.text),
                        ]),
                    )
                } else {
                    result.push(innerBox)
                }
            } else if (listJoin.type === UtilCommon.terminatorName) {
                result.push(
                    BoxFactory.horizontalLayout(node, roleName, propertyName, [
                        innerBox,
                        BoxFactory.label(node, roleName + "list-item-label", listJoin.text),
                    ]),
                )
            } else if (listJoin.type === UtilCommon.initiatorName) {
                // TODO test this code
                result.push(
                    BoxFactory.horizontalLayout(node, roleName, propertyName, [
                        BoxFactory.label(node, roleName + "list-item-label", listJoin.text),
                        innerBox,
                    ]),
                )
            } else {
                console.error(`++ UtilCommon.addListJoin nothing added!!!`)
            }
        }
        return result
    }
}
