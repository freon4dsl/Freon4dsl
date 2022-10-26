import { PiElement } from "../../ast";
import { PiListInfo, RoleProvider } from "../simplifiedBoxAPI";
import { Box, BoxFactory, HorizontalListBox, VerticalListBox } from "../boxes";
import { Language } from "../../language";
import { FreProjectionHandler } from "./FreProjectionHandler";


export class NewBoxUtils {
    static separatorName: string = "Separator";
    static terminatorName: string = "Terminator";
    static initiatorName: string = "Initiator";

    static verticalPartListBox(element: PiElement, list: PiElement[], propertyName: string, listJoin: PiListInfo, boxProviderCache: FreProjectionHandler): VerticalListBox {
        // make the boxes for the children
        let children: Box[] = this.findPartItems(list, element, propertyName, listJoin, boxProviderCache);
        // add a placeholder where a new element can be added
        children = this.addPlaceholder(children, element, propertyName);
        // determine the role
        let role: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "vpartlist");
        // return the box
        return new VerticalListBox(element, role, children);
    }

    static horizontalPartListBox(element: PiElement, list: PiElement[], propertyName: string, listJoin: PiListInfo, boxProviderCache: FreProjectionHandler): VerticalListBox {
        // make the boxes for the children
        let children: Box[] = this.findPartItems(list, element, propertyName, listJoin, boxProviderCache);
        // add a placeholder where a new element can be added
        children = this.addPlaceholder(children, element, propertyName);
        // determine the role
        let role: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "vpartlist");
        // return the box
        return new HorizontalListBox(element, role, children);
    }

    private static findPartItems(property: PiElement[], element: PiElement, propertyName: string, listJoin: PiListInfo, boxProviderCache: FreProjectionHandler) {
        const numberOfItems = property.length;
        return property.map((listElem, index) => {
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "list-item", index);
            if (listJoin !== null && listJoin !== undefined) {
                if (listJoin.type === this.separatorName) {
                    if (index < numberOfItems - 1) {
                        return BoxFactory.horizontalList(element, roleName, [
                            boxProviderCache.getBoxProvider(listElem).box,
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                        ]);
                    } else {
                        return boxProviderCache.getBoxProvider(listElem).box;
                    }
                } else if (listJoin.type === this.terminatorName) {
                    return BoxFactory.horizontalList(element, roleName, [
                        boxProviderCache.getBoxProvider(listElem).box,
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                    ]);
                } else if (listJoin.type === this.initiatorName) {
                    return BoxFactory.horizontalList(element, roleName, [
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                        boxProviderCache.getBoxProvider(listElem).box,
                    ]);
                }
            } else {
                return boxProviderCache.getBoxProvider(listElem).box;
            }
            return null;
        });
    }

    private static addPlaceholder(children: Box[], element: PiElement, propertyName: string) {
        return children.concat(
            BoxFactory.alias(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "new-list-item"),
                `<+ ${propertyName}>`,
                {
                    propertyName: `${propertyName}`,
                    conceptName: Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName).type
                })
        );
    }

    static getBoxOrAlias(element: PiElement, propertyName: string, conceptName: string, boxProviderCache: FreProjectionHandler): Box {
        // find the information on the property to be shown
        const property = element[propertyName];
        const roleName = RoleProvider.property(element.piLanguageConcept(), propertyName);
        // console.log('getBoxOrAlias ' + property?.piId())
        return !!property
            ? boxProviderCache.getBoxProvider(property).box
            : BoxFactory.alias(element, roleName, "[add]", { propertyName: propertyName, conceptName: conceptName });
    }
}
