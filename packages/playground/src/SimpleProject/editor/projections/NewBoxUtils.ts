import {
    Box,
    BoxFactory,
    Language,
    PiElement,
    PiListInfo,
    RoleProvider,
    VerticalListBox
} from "@projectit/core";
import { NewCompositeProjection } from "./NewCompositeProjection";

export class NewBoxUtils {
    static separatorName: string = "Separator";
    static terminatorName: string = "Terminator";
    static initiatorName: string = "Initiator";

    static verticalPartListBox(element: PiElement, list: PiElement[], propertyName: string, listJoin: PiListInfo): VerticalListBox {
        // make the boxes for the children
        let children: Box[] = this.findPartItems(list, element, propertyName, listJoin);
        // add a placeholder where a new element can be added
        children = this.addPlaceholder(children, element, propertyName);
        // determine the role
        let role: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "vpartlist");
        // return the box
        return new VerticalListBox(element, role, children);
    }

    private static findPartItems(property: PiElement[], element: PiElement, propertyName: string, listJoin: PiListInfo) {
        const numberOfItems = property.length;
        return property.map((listElem, index) => {
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "list-item", index);
            if (listJoin !== null && listJoin !== undefined) {
                if (listJoin.type === this.separatorName) {
                    if (index < numberOfItems - 1) {
                        return BoxFactory.horizontalList(element, roleName, [
                            NewCompositeProjection.getConceptProjection(listElem).box,
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                        ]);
                    } else {
                        return NewCompositeProjection.getConceptProjection(listElem).box;
                    }
                } else if (listJoin.type === this.terminatorName) {
                    return BoxFactory.horizontalList(element, roleName, [
                        NewCompositeProjection.getConceptProjection(listElem).box,
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                    ]);
                } else if (listJoin.type === this.initiatorName) {
                    return BoxFactory.horizontalList(element, roleName, [
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                        NewCompositeProjection.getConceptProjection(listElem).box,
                    ]);
                }
            } else {
                return NewCompositeProjection.getConceptProjection(listElem).box;
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

    static getBoxOrAlias(element: PiElement, propertyName: string, conceptName: string): Box {
        // find the information on the property to be shown
        const property = element[propertyName];
        const roleName = RoleProvider.property(element.piLanguageConcept(), propertyName);
        console.log('getBoxOrAlias ' + property?.piId())
        return !!property
            ? NewCompositeProjection.getConceptProjection(property).box
            : BoxFactory.alias(element, roleName, "[add]", { propertyName: propertyName, conceptName: conceptName });
    }
}
