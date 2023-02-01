/**
 * This is a series of helper functions for changes in list properties.
 * They support drag-and-drop and cut/copy-paste functionality.
 */

// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import * as Keys from "./Keys";
import { MetaKey } from "./Keys";
import { PiLogger } from "../../logging";
import { ListElementInfo, MenuItem, PiCreatePartAction, PiEditor } from "../index";
import { Language, PropertyKind } from "../../language";
import { PiElement } from "../../ast";
import { runInAction } from "mobx";
import { SeverityType } from "../../validator";

const LOGGER = new PiLogger("ListBoxUtil");

export enum MenuOptionsType { normal, placeholder, header }

/**
 * When the user hits 'ENTER', this action is triggered.
 * @param role
 * @param propertyName
 * @param conceptName
 * @param roleToSelect
 */
export function createKeyboardShortcutForList2(role: string, propertyName: string, conceptName: string, roleToSelect: string): PiCreatePartAction {
    LOGGER.log("LIST role [" + role + "]");
    return new PiCreatePartAction({
        trigger: { meta: MetaKey.None, key: Keys.ENTER, code: Keys.ENTER },
        activeInBoxRoles: [role, "action-" + role + "-textbox"],
        conceptName: conceptName,
        propertyName: propertyName,
        boxRoleToSelect: roleToSelect
    });
}

/**
 * This function is executed, when a list element is dragged to another position in the same list.
 * @param parentElement
 * @param movedElement
 * @param targetPropertyName
 * @param targetIndex
 */
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

/**
 * This function is executed when a list element is being dragged and then dropped into another list.
 * @param dropped
 * @param targetElem
 * @param targetPropertyName
 * @param targetIndex
 */
export function dropListElement(editor: PiEditor, dropped: ListElementInfo, targetMetaType: string, targetElem: PiElement, targetPropertyName: string, targetIndex: number) {
    if (!Language.getInstance().metaConformsToType(dropped.element, targetMetaType)) { // check if item may be dropped here
        editor.setUserMessage("Drop is not allowed here, because the types do not match (" + dropped.element.piLanguageConcept() + " does not conform to " + targetMetaType + ").", SeverityType.error);
        return;
    }
    runInAction(() => {
        // console.log(`dropListElement=> element: ${dropped.element.piLanguageConcept()}, property: ${dropped.propertyName},
        // oldIndex: ${dropped.propertyIndex}, targetElem: ${targetElem},
        // targetPropertyName ${targetPropertyName}, targetIndex: ${targetIndex}`);
        const { property, isList } = getPropertyInfo(targetElem, targetPropertyName);
        // console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
        if (!!dropped.element) {
            // Add the found element to 'targetElem[targetPropertyName]' at position 'targetIndex'.
            // Note that we need not explicitly remove the item from its old position, the mobx decorators do that.
            // Note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length.
            if (isList && targetIndex <= property.length) {
                property.splice(targetIndex, 0, dropped.element);
            }
        }
        // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    });
}

/**
 * This function builds the MenuItems for the context menu that is coupled to a list box.
 * @param conceptName       the expected type of the elements in the list
 * @param listParent        the parent element that holds list in which element need to be added, changed, etc
 * @param propertyName      the name of the property in which the list is stored
 * @param optionsType       in case the options are created for a placeholder or header, we add lesser items (e.g. no DELETE)
 */
export function getContextMenuOptions(conceptName: string, listParent: PiElement, propertyName: string, optionsType: MenuOptionsType): MenuItem[] {
    // console.log(`getContextMenuOptions
    // conceptname: ${conceptName}
    // listparent: ${listParent.piId()}=${listParent.piLanguageConcept()}
    // propertyName: ${propertyName}
    // optionsType ${optionsType}`);
    // do some checks
    const clsOtIntf = Language.getInstance().concept(conceptName) ?? Language.getInstance().interface(conceptName);
    let errorItem: MenuItem = new MenuItem("No options available", "", (element: PiElement, index: number, editor: PiEditor) => {
    });
    if (!clsOtIntf) {
        return [errorItem];
    }
    let items: MenuItem[];
    // first create the items that depend upon the conceptName
    let addBefore: MenuItem;
    let addAfter: MenuItem;
    if (clsOtIntf.subConceptNames.length > 0) { // there are sub concepts, so create sub menu items
        // todo subclasses to be tested in different project than Example
        let submenuItemsBefore: MenuItem[] = [];
        let submenuItemsAfter: MenuItem[] = [];
        clsOtIntf.subConceptNames.forEach((creatableConceptname: string) => {
            submenuItemsBefore.push(new MenuItem(creatableConceptname, "", (element: PiElement, index: number, editor: PiEditor) => addListElement(listParent, propertyName, index, creatableConceptname, true)));
            submenuItemsAfter.push(new MenuItem(creatableConceptname, "", (element: PiElement, index: number, editor: PiEditor) => addListElement(listParent, propertyName, index, creatableConceptname, false)));
        });
        addBefore = new MenuItem("Add before", "Ctrl+A", (element: PiElement, index: number, editor: PiEditor) => {
        }, submenuItemsBefore);
        addAfter = new MenuItem("Add after", "Ctrl+I", (element: PiElement, index: number, editor: PiEditor) => {
        }, submenuItemsAfter);
    } else {
        addBefore = new MenuItem("Add before", "Ctrl+A", (element: PiElement, index: number, editor: PiEditor) => addListElement(listParent, propertyName, index, conceptName, true));
        addAfter = new MenuItem("Add after", "Ctrl+I", (element: PiElement, index: number, editor: PiEditor) => addListElement(listParent, propertyName, index, conceptName, false));
    }
    let pasteBefore = new MenuItem("Paste before", "", (element: PiElement, index: number, editor: PiEditor) => pasteListElement(listParent, propertyName, index, editor, true));
    let pasteAfter = new MenuItem("Paste after", "", (element: PiElement, index: number, editor: PiEditor) => pasteListElement(listParent, propertyName, index, editor, false));

    // now create the whole item list
    if (optionsType === MenuOptionsType.placeholder) { // add lesser items for a placeholder
        items = [addBefore, pasteBefore];
    } else if (optionsType === MenuOptionsType.header) { // add lesser items for a header
        items = [addAfter, pasteAfter];
    } else {
        items = [addBefore, addAfter, new MenuItem("Delete", "", (element: PiElement, index: number, editor: PiEditor) => deleteListElement(listParent, propertyName, element)), new MenuItem("---", "", (element: PiElement, index: number, editor: PiEditor) => console.log("this is not an option")), new MenuItem("Cut", "", (element: PiElement, index: number, editor: PiEditor) => cutListElement(listParent, propertyName, element, editor)), new MenuItem("Copy", "", (element: PiElement, index: number, editor: PiEditor) => copyListElement(element, editor)), pasteBefore, pasteAfter];
    }
    return items;
}

/**
 * This function adds a new element to the parent list of 'element'. Depending on
 * the parameter 'before', the new element is added either before, or after 'element'.
 * @param listParent
 * @param propertyName
 * @param index
 * @param typeOfAdded
 * @param before
 */
function addListElement(listParent: PiElement, propertyName: string, index: number, typeOfAdded: string, before: boolean) {
    console.log(`addListElement index: ${index}`)
    // get info about the property that needs to be changed
    const { property, isList, type } = getPropertyInfo(listParent, propertyName);
    if (!before) {
        index++;
    }
    // console.log(`addListElement=> listParent: ${listParent.piLanguageConcept()}, isList: ${isList},
    // targetPropertyName ${propertyName}, index: ${index}`);

    // make the change, if the property is a list and the type of the new element conforms to the type of elements in the list
    const newElement: PiElement = Language.getInstance().concept(typeOfAdded)?.constructor();
    if (newElement === undefined || newElement === null) {
        console.error("New element undefined"); // TODO Find out why this happens sometimes
        return;
    } else if (isList && Language.getInstance().metaConformsToType(newElement, type)) { // allow subtyping
        // console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
        runInAction(() => {
            property.splice(index, 0, newElement);
        });
        // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    }
}

/**
 * This function deletes 'element' from its parent list.
 * @param listParent
 * @param propertyName
 * @param element
 */
function deleteListElement(listParent: PiElement, propertyName: string, element: PiElement) {
    // get info about the property that needs to be changed
    // const parentElement: PiElement = element.piOwnerDescriptor().owner;
    // const targetPropertyName: string = element.piOwnerDescriptor().propertyName;
    const targetIndex: number = element.piOwnerDescriptor().propertyIndex;
    // console.log(`deleteListElement=> listParent: ${listParent.piLanguageConcept()},
    // propertyName ${propertyName}, index: ${targetIndex}`);

    const { property, isList } = getPropertyInfo(listParent, propertyName);
    // make the change
    if (isList) {
        // console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
        runInAction(() => {
            if (targetIndex < property.length) {
                property.splice(targetIndex, 1);
            }
        });
        // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    }
}

/**
 * This function deletes 'element' from its parent list and stores 'element' in the
 * editor, for use in the paste options.
 * @param listParent
 * @param propertyName
 * @param element
 * @param editor
 */
function cutListElement(listParent: PiElement, propertyName: string, element: PiElement, editor: PiEditor) {
    deleteListElement(listParent, propertyName, element);
    editor.copiedElement = element;
}

/**
 * This function copies 'element' to the editor, for use in the paste options.
 * @param element
 * @param editor
 */
function copyListElement(element: PiElement, editor: PiEditor) {
    editor.copiedElement = element.copy();
}

/**
 * This function adds the element stored in the editor to the parent list of 'element'. Depending on
 * the parameter 'before', the stored element is added either before, or after 'element'.
 * @param listParent
 * @param propertyName
 * @param element
 * @param editor
 * @param before
 */
function pasteListElement(listParent: PiElement, propertyName: string, index: number, editor: PiEditor, before: boolean) {
    console.log(`pasteListElement index: ${index}`)

    // first, do some checks
    if (editor.copiedElement === null || editor.copiedElement === undefined) {
        editor.setUserMessage("Nothing to paste", SeverityType.warning);
        return;
    }

    // get info about the property that needs to be changed
    const { property, isList, type } = getPropertyInfo(listParent, propertyName);
    let targetIndex: number = index;
    if (!before || index === -1) {
        targetIndex++;
    }

    // check whether the pasted element has the correct type
    if (!Language.getInstance().metaConformsToType(editor.copiedElement, type)) {
        editor.setUserMessage(
            "Types do not conform (" + editor.copiedElement.piLanguageConcept() + " does not conform to " + type + ").",
            SeverityType.error);
        return;
    }

    // make the change
    if (isList) {
        console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
        runInAction(() => {
            // make a copy before the element is added as part of the model,
            // because mobx decorators change the element's owner info:
            // it is removed from 'editor.copiedElement'!
            const tmp: PiElement = editor.copiedElement.copy();
            if (targetIndex <= property.length) {
                property.splice(targetIndex, 0, editor.copiedElement);
            }
            // make sure the element can be pasted elsewhere
            editor.copiedElement = tmp;
        });
        console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    }
}

/**
 * This function returns information on the property within 'element' with name 'propertyName',
 * as it is available in 'Language.getInstance()'.
 * @param element
 * @param propertyName
 */
function getPropertyInfo(element: PiElement, propertyName: string) {
    // console.log(`element: ${element.piId()}, element type: ${element.piLanguageConcept()}, propertyName: ${propertyName}`)
    const property = element[propertyName];
    const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
    const isList: boolean = propInfo.isList;
    const isPart: PropertyKind = propInfo.propertyKind;
    const type: string = propInfo.type;
    return { property, isList, isPart, type };
}
