import {Box, BoxFactory, ElementBox, ExternalPartListBox, HorizontalListBox, VerticalListBox} from "../../boxes";
import { FreNode } from "../../../ast";
import { RoleProvider } from "../RoleProvider";
import { FreLanguage } from "../../../language";
import { FreBoxProvider, FreProjectionHandler } from "../../projections";
import { FreListInfo } from "../BoxUtil";
import { UtilCommon } from "./UtilCommon";

export class UtilPartHelpers {
    public static verticalPartListBox(
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        listJoin: FreListInfo,
        boxProviderCache: FreProjectionHandler,
        initializer?: Partial<VerticalListBox>,
    ): VerticalListBox {
        // make the boxes for the children
        let children: Box[] = this.makePartItems(node, list, propertyName, boxProviderCache, listJoin);
        // add a placeholder where a new element can be added
        children = UtilPartHelpers.addPlaceholder(children, node, propertyName);
        // determine the role
        const role: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "vpartlist");
        // create and return the box
        const result: VerticalListBox = BoxFactory.verticalList(node, role, propertyName, children, initializer);
        result.propertyName = propertyName;
        return result;
    }

    public static horizontalPartListBox(
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        listJoin: FreListInfo,
        boxProviderCache: FreProjectionHandler,
        initializer?: Partial<HorizontalListBox>,
    ): HorizontalListBox {
        // make the boxes for the children
        let children: Box[] = UtilPartHelpers.makePartItems(node, list, propertyName, boxProviderCache, listJoin);
        // add a placeholder where a new element can be added
        children = UtilPartHelpers.addPlaceholder(children, node, propertyName);
        // determine the role
        const role: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "vpartlist");
        // return the box
        const result: HorizontalListBox = BoxFactory.horizontalList(node, role, propertyName, children, initializer);
        result.propertyName = propertyName;
        return result;
    }

    public static externalPartListBox(
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        externalComponentName: string,
        boxProviderCache: FreProjectionHandler,
        initializer?: Partial<ExternalPartListBox>,
    ): ExternalPartListBox {
        // make the boxes for the children
        let children: Box[] = this.makePartItems(node, list, propertyName, boxProviderCache);
        // determine the role
        const role: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "vpartlist");
        // create and return the box
        return BoxFactory.externalPartList(node, propertyName, externalComponentName, role, children, initializer);
    }

    private static addPlaceholder(children: Box[], element: FreNode, propertyName: string) {
        return children.concat(
            BoxFactory.action(
                element,
                RoleProvider.property(element.freLanguageConcept(), propertyName, "new-list-item"),
                `<+ ${propertyName}>`,
                {
                    propertyName: `${propertyName}`,
                    conceptName: FreLanguage.getInstance().classifierProperty(
                        element.freLanguageConcept(),
                        propertyName,
                    ).type,
                },
            ),
        );
    }

    private static makePartItems(
        element: FreNode,
        property: FreNode[],
        propertyName: string,
        boxProviderCache: FreProjectionHandler,
        listJoin?: FreListInfo,
    ): Box[] {
        const result: Box[] = [];
        const numberOfItems: number = property.length;
        property.forEach((listElem, index) => {
            const myProvider: FreBoxProvider = boxProviderCache.getBoxProvider(listElem);
            const roleName: string = RoleProvider.property(
                element.freLanguageConcept(),
                propertyName,
                "list-item",
                index,
            );
            let innerBox: ElementBox = myProvider.box;
            if (listJoin !== null && listJoin !== undefined) {
                result.push(...UtilCommon.addListJoin(listJoin, index, numberOfItems, element, roleName, propertyName, innerBox));
            } else {
                result.push(innerBox);
            }
            return null;
        });
        return result;
    }
}
