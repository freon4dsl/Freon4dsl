// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import { MetaKey } from "./Keys";
import * as Keys from "./Keys";
import { PiLogger } from "../../logging";
import { EMPTY_POST_ACTION, ListElementInfo, MenuItem, PiCreatePartAction } from "../index";
import { Language, PropertyKind } from "../../language";
import { PiElement } from "../../ast";
import { runInAction } from "mobx";

const LOGGER = new PiLogger("ListBoxUtil");

export function createKeyboardShortcutForList2 (
    role: string,
    propertyName: string,
    conceptName: string,
    roleToSelect: string
): PiCreatePartAction {
    LOGGER.log("LIST role [" + role + "]")
    return new PiCreatePartAction({
        trigger: { meta: MetaKey.None, key: Keys.ENTER, code: Keys.ENTER },
        activeInBoxRoles: [role, "alias-" + role + "-textbox"],
        conceptName: conceptName,
        propertyName: propertyName,
        boxRoleToSelect: roleToSelect
    });
}

export function getContextMenuOptions(conceptName: string): MenuItem[] {
    const clsOtIntf = Language.getInstance().concept(conceptName) ?? Language.getInstance().interface(conceptName);
    let errorItem: MenuItem = new MenuItem("No options available", "", (e: PiElement) => {});
    if (!clsOtIntf) {
        return [errorItem];
    }
    if (clsOtIntf.subConceptNames.length > 0) { // there are sub concepts, so create sub menu items
        // todo to be tested in different project than Example
        let submenuItemsBefore: MenuItem[] = [];
        let submenuItemsAfter: MenuItem[] = [];
        clsOtIntf.subConceptNames.forEach((creatableConceptname: string) => {
            submenuItemsBefore.push(new MenuItem(
                creatableConceptname, "", (e: PiElement) => addListElement(e, creatableConceptname, true)
            ));
            submenuItemsAfter.push(new MenuItem(
                creatableConceptname, "", (e: PiElement) => addListElement(e, creatableConceptname, false)
            ));
        });
        const items: MenuItem[] = [
            new MenuItem("Add before", "Ctrl+A", (e: PiElement) => {
            }, submenuItemsBefore),
            new MenuItem("Add after", "Ctrl+I", (e: PiElement) => {
            }, submenuItemsAfter),
            new MenuItem("Delete", "", (e: PiElement) => deleteListElement(e)),
            new MenuItem("---", "", (e: PiElement) => {
            }),
            new MenuItem("Cut", "", (e: PiElement) => console.log("Cut..." + e)),
            new MenuItem("Copy", "", (e: PiElement) => console.log("Copy..." + e)),
            new MenuItem("Paste before", "", (e: PiElement) => console.log("Paste before..." + e)),
            new MenuItem("Paste after", "", (e: PiElement) => console.log("Paste after..." + e))
        ];
        return items;
    } else {
        const items: MenuItem[] = [
            new MenuItem("Add before", "Ctrl+A", (e: PiElement) => addListElement(e, conceptName, true)),
            new MenuItem("Add after", "Ctrl+I", (e: PiElement) => addListElement(e, conceptName, false)),
            new MenuItem("Delete", "", (e: PiElement) => deleteListElement(e)),
            new MenuItem("---", "", (e: PiElement) => {
            }),
            new MenuItem("Cut", "", (e: PiElement) => console.log("Cut..." + e)),
            new MenuItem("Copy", "", (e: PiElement) => console.log("Copy..." + e)),
            new MenuItem("Paste before", "", (e: PiElement) => console.log("Paste before..." + e)),
            new MenuItem("Paste after", "", (e: PiElement) => console.log("Paste after..." + e))
        ];
        return items;
    }
}

function addListElement(e: PiElement, type: string, before: boolean) {
    // console.log("Adding new element of type " + type + (before ? ' before ' : ' after ') + e.piId());
    // get info about the property that needs to be changed
    const parentElement: PiElement = e.piOwnerDescriptor().owner;
    const targetPropertyName: string = e.piOwnerDescriptor().propertyName;
    let targetIndex: number = e.piOwnerDescriptor().propertyIndex;
    if (!before) {
        targetIndex++;
    }
    const { property, isList } = getPropertyInfo(parentElement, targetPropertyName);
    // console.log(`addListElement=> element: ${e.piLanguageConcept()}, isList: ${isList},
    // targetPropertyName ${targetPropertyName}, targetIndex: ${targetIndex}`);

    // make the change
    if (isList) {
        // console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
        runInAction(() => {
            const newElement: PiElement = Language.getInstance().concept(type)?.constructor();
            if (newElement === undefined || newElement === null) {
                // TODO Find out why this happens sometimes
                console.error("New element undefined");
                return;
            }
            if (targetIndex <= property.length) {
                property.splice(targetIndex, 0, newElement);
            }
        });
        // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    }
}

function deleteListElement(e: PiElement) {
    // get info about the property that needs to be changed
    const parentElement: PiElement = e.piOwnerDescriptor().owner;
    const targetPropertyName: string = e.piOwnerDescriptor().propertyName;
    const targetIndex: number = e.piOwnerDescriptor().propertyIndex;
    const { property, isList } = getPropertyInfo(parentElement, targetPropertyName);
    // make the change
    if (isList) {
        // console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
        runInAction(() => {
            if (targetIndex <= property.length) {
                property.splice(targetIndex, 1);
            }
        });
        // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    }
}

export function moveListElement(parentElement: PiElement, movedElement: PiElement, targetPropertyName: string, targetIndex: number) {
    runInAction(() => {
        // get info about the property that needs to be changed
        const { property, isList } = getPropertyInfo(parentElement, targetPropertyName);
        // console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
        let oldIndex: number = movedElement.piOwnerDescriptor().propertyIndex;
        // console.log(`moveListElement=> element: ${parentElement.piLanguageConcept()}, property: ${targetPropertyName}, oldIndex: ${oldIndex}, targetIndex: ${targetIndex}`);
        // Note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length.
        // The splice(), however, still functions when the targetIndex > property.length.
        if (isList && oldIndex < property.length && targetIndex <= property.length) {
            // Note that because of the Mobx decorators that set the data on the parent of the element,
            // the property must be removed before it is added at a different location, not the other way around!
            const tmpProp = property[oldIndex];
            property.splice(oldIndex, 1);
            // Make sure the item is added at the correct index
            if (targetIndex > 0) {
                targetIndex -= 1;
            }
            property.splice(targetIndex, 0, tmpProp);
        }
        // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    });
}

export function dropListElement(dropped: ListElementInfo, targetElem: PiElement, targetPropertyName: string, targetIndex: number) {
    runInAction(() => {
        // console.log(`dropListElement=> element: ${dropped.element.piLanguageConcept()}, property: ${dropped.propertyName},
        // oldIndex: ${dropped.propertyIndex}, targetElem: ${targetElem},
        // targetPropertyName ${targetPropertyName}, targetIndex: ${targetIndex}`);
        const { property, isList, type } = getPropertyInfo(targetElem, targetPropertyName);
        // console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
        if (type === dropped.elementType) { // TODO extend to include subtypes
            if (!!dropped.element) {
                // Add the found element to 'targetElem[targetPropertyName]' at position 'targetIndex'.
                // Note that we need not explicitly remove the item from its old position, the mobx decorators do that.
                // Note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length.
                if (isList && targetIndex <= property.length) {
                    property.splice(targetIndex, 0, dropped.element);
                }
            }
        }
        // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    });
}

function getPropertyInfo(element: PiElement, propertyName: string) {
    // console.log(`element: ${element.piId()}, element type: ${element.piLanguageConcept()}, propertyName: ${propertyName}`)
    const property = element[propertyName];
    const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
    const isList: boolean = propInfo.isList;
    const isPart: PropertyKind = propInfo.propertyKind;
    const type: string = propInfo.type;
    return { property, isList, isPart, type };
}
