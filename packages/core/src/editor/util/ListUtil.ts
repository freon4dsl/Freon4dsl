/**
 * This is a series of helper functions for changes in list properties.
 * They support drag-and-drop and cut/copy-paste functionality.
 */

// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import * as Keys from "./Keys";
import { MetaKey } from "./Keys";
import { FreLogger } from "../../logging";
import { ListElementInfo, MenuItem, FreCreatePartAction, FreEditor } from "../index";
import { FreLanguage, PropertyKind } from "../../language";
import { FreNode } from "../../ast";
import { runInAction } from "mobx";
import { SeverityType } from "../../validator";

const LOGGER = new FreLogger("ListBoxUtil");

export enum MenuOptionsType { normal, placeholder, header }

/**
 * When the user hits 'ENTER', this action is triggered.
 * @param role
 * @param propertyName
 * @param conceptName
 * @param roleToSelect
 */
export function createKeyboardShortcutForList2(role: string, propertyName: string, conceptName: string, roleToSelect: string): FreCreatePartAction {
    LOGGER.log("LIST role [" + role + "]");
    return new FreCreatePartAction({
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
export function moveListElement(parentElement: FreNode, movedElement: FreNode, targetPropertyName: string, targetIndex: number) {
    runInAction(() => {
        // get info about the property that needs to be changed
        const { property, isList } = getPropertyInfo(parentElement, targetPropertyName);
        // console.log('List before: [' + property.map(x => x.freId()).join(', ') + ']');
        let oldIndex: number = movedElement.freOwnerDescriptor().propertyIndex;
        // console.log(`moveListElement=> element: ${parentElement.freLanguageConcept()}, property: ${targetPropertyName}, oldIndex: ${oldIndex}, targetIndex: ${targetIndex}`);
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
        // console.log('List after: [' + property.map(x => x.freId()).join(', ') + ']');
    });
}

/**
 * This function is executed when a list element is being dragged and then dropped into another list.
 * @param dropped
 * @param targetElem
 * @param targetPropertyName
 * @param targetIndex
 */
export function dropListElement(editor: FreEditor, dropped: ListElementInfo, targetMetaType: string, targetElem: FreNode, targetPropertyName: string, targetIndex: number) {
    if (!FreLanguage.getInstance().metaConformsToType(dropped.element, targetMetaType)) { // check if item may be dropped here
        editor.setUserMessage("Drop is not allowed here, because the types do not match (" + dropped.element.freLanguageConcept() + " does not conform to " + targetMetaType + ").", SeverityType.error);
        return;
    }
    runInAction(() => {
        // console.log(`dropListElement=> element: ${dropped.element.freLanguageConcept()}, property: ${dropped.propertyName},
        // oldIndex: ${dropped.propertyIndex}, targetElem: ${targetElem},
        // targetPropertyName ${targetPropertyName}, targetIndex: ${targetIndex}`);
        const { property, isList } = getPropertyInfo(targetElem, targetPropertyName);
        // console.log('List before: [' + property.map(x => x.freId()).join(', ') + ']');
        if (!!dropped.element) {
            // Add the found element to 'targetElem[targetPropertyName]' at position 'targetIndex'.
            // Note that we need not explicitly remove the item from its old position, the mobx decorators do that.
            // Note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length.
            if (isList && targetIndex <= property.length) {
                property.splice(targetIndex, 0, dropped.element);
            }
        }
        // console.log('List after: [' + property.map(x => x.freId()).join(', ') + ']');
    });
}

/**
 * This function builds the MenuItems for the context menu that is coupled to a list box.
 * @param conceptName       the expected type of the elements in the list
 * @param listParent        the parent element that holds list in which element need to be added, changed, etc
 * @param propertyName      the name of the property in which the list is stored
 * @param optionsType       in case the options are created for a placeholder or header, we add lesser items (e.g. no DELETE)
 */
export function getContextMenuOptions(conceptName: string, listParent: FreNode, propertyName: string, optionsType: MenuOptionsType): MenuItem[] {
    // console.log(`getContextMenuOptions
    // conceptname: ${conceptName}
    // listparent: ${listParent.freId()}=${listParent.freLanguageConcept()}
    // propertyName: ${propertyName}
    // optionsType ${optionsType}`);
    // do some checks
    const clsOtIntf = FreLanguage.getInstance().concept(conceptName) ?? FreLanguage.getInstance().interface(conceptName);
    let errorItem: MenuItem = new MenuItem("No options available", "", (element: FreNode, index: number, editor: FreEditor) => {
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
            submenuItemsBefore.push(new MenuItem(creatableConceptname, "", (element: FreNode, index: number, editor: FreEditor) => addListElement(listParent, propertyName, index, creatableConceptname, true)));
            submenuItemsAfter.push(new MenuItem(creatableConceptname, "", (element: FreNode, index: number, editor: FreEditor) => addListElement(listParent, propertyName, index, creatableConceptname, false)));
        });
        addBefore = new MenuItem("Add before", "Ctrl+A", (element: FreNode, index: number, editor: FreEditor) => {
        }, submenuItemsBefore);
        addAfter = new MenuItem("Add after", "Ctrl+I", (element: FreNode, index: number, editor: FreEditor) => {
        }, submenuItemsAfter);
    } else {
        addBefore = new MenuItem("Add before", "Ctrl+A", (element: FreNode, index: number, editor: FreEditor) => addListElement(listParent, propertyName, index, conceptName, true));
        addAfter = new MenuItem("Add after", "Ctrl+I", (element: FreNode, index: number, editor: FreEditor) => addListElement(listParent, propertyName, index, conceptName, false));
    }
    let pasteBefore = new MenuItem("Paste before", "", (element: FreNode, index: number, editor: FreEditor) => pasteListElement(listParent, propertyName, index, editor, true));
    let pasteAfter = new MenuItem("Paste after", "", (element: FreNode, index: number, editor: FreEditor) => pasteListElement(listParent, propertyName, index, editor, false));

    // now create the whole item list
    if (optionsType === MenuOptionsType.placeholder) { // add lesser items for a placeholder
        items = [addBefore, pasteBefore];
    } else if (optionsType === MenuOptionsType.header) { // add lesser items for a header
        items = [addAfter, pasteAfter];
    } else {
        items = [addBefore, addAfter, new MenuItem("Delete", "", (element: FreNode, index: number, editor: FreEditor) => deleteListElement(listParent, propertyName, element)), new MenuItem("---", "", (element: FreNode, index: number, editor: FreEditor) => console.log("this is not an option")), new MenuItem("Cut", "", (element: FreNode, index: number, editor: FreEditor) => cutListElement(listParent, propertyName, element, editor)), new MenuItem("Copy", "", (element: FreNode, index: number, editor: FreEditor) => copyListElement(element, editor)), pasteBefore, pasteAfter];
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
function addListElement(listParent: FreNode, propertyName: string, index: number, typeOfAdded: string, before: boolean) {
    console.log(`addListElement index: ${index}`)
    // get info about the property that needs to be changed
    const { property, isList, type } = getPropertyInfo(listParent, propertyName);
    if (!before) {
        index++;
    }
    // console.log(`addListElement=> listParent: ${listParent.freLanguageConcept()}, isList: ${isList},
    // targetPropertyName ${propertyName}, index: ${index}`);

    // make the change, if the property is a list and the type of the new element conforms to the type of elements in the list
    const newElement: FreNode = FreLanguage.getInstance().concept(typeOfAdded)?.constructor();
    if (newElement === undefined || newElement === null) {
        console.error("New element undefined"); // TODO Find out why this happens sometimes
        return;
    } else if (isList && FreLanguage.getInstance().metaConformsToType(newElement, type)) { // allow subtyping
        // console.log('List before: [' + property.map(x => x.freId()).join(', ') + ']');
        runInAction(() => {
            property.splice(index, 0, newElement);
        });
        // console.log('List after: [' + property.map(x => x.freId()).join(', ') + ']');
    }
}

/**
 * This function deletes 'element' from its parent list.
 * @param listParent
 * @param propertyName
 * @param element
 */
function deleteListElement(listParent: FreNode, propertyName: string, element: FreNode) {
    // get info about the property that needs to be changed
    // const parentElement: FreNode = element.freOwnerDescriptor().owner;
    // const targetPropertyName: string = element.freOwnerDescriptor().propertyName;
    const targetIndex: number = element.freOwnerDescriptor().propertyIndex;
    // console.log(`deleteListElement=> listParent: ${listParent.freLanguageConcept()},
    // propertyName ${propertyName}, index: ${targetIndex}`);

    const { property, isList } = getPropertyInfo(listParent, propertyName);
    // make the change
    if (isList) {
        // console.log('List before: [' + property.map(x => x.freId()).join(', ') + ']');
        runInAction(() => {
            if (targetIndex < property.length) {
                property.splice(targetIndex, 1);
            }
        });
        // console.log('List after: [' + property.map(x => x.freId()).join(', ') + ']');
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
function cutListElement(listParent: FreNode, propertyName: string, element: FreNode, editor: FreEditor) {
    deleteListElement(listParent, propertyName, element);
    editor.copiedElement = element;
}

/**
 * This function copies 'element' to the editor, for use in the paste options.
 * @param element
 * @param editor
 */
function copyListElement(element: FreNode, editor: FreEditor) {
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
function pasteListElement(listParent: FreNode, propertyName: string, index: number, editor: FreEditor, before: boolean) {
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
    if (!FreLanguage.getInstance().metaConformsToType(editor.copiedElement, type)) {
        editor.setUserMessage(
            "Types do not conform (" + editor.copiedElement.freLanguageConcept() + " does not conform to " + type + ").",
            SeverityType.error);
        return;
    }

    // make the change
    if (isList) {
        console.log('List before: [' + property.map(x => x.freId()).join(', ') + ']');
        runInAction(() => {
            // make a copy before the element is added as part of the model,
            // because mobx decorators change the element's owner info:
            // it is removed from 'editor.copiedElement'!
            const tmp: FreNode = editor.copiedElement.copy();
            if (targetIndex <= property.length) {
                property.splice(targetIndex, 0, editor.copiedElement);
            }
            // make sure the element can be pasted elsewhere
            editor.copiedElement = tmp;
        });
        console.log('List after: [' + property.map(x => x.freId()).join(', ') + ']');
    }
}

/**
 * This function returns information on the property within 'element' with name 'propertyName',
 * as it is available in 'Language.getInstance()'.
 * @param element
 * @param propertyName
 */
function getPropertyInfo(element: FreNode, propertyName: string) {
    // console.log(`element: ${element.freId()}, element type: ${element.freLanguageConcept()}, propertyName: ${propertyName}`)
    const property = element[propertyName];
    const propInfo = FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName);
    const isList: boolean = propInfo.isList;
    const isPart: PropertyKind = propInfo.propertyKind;
    const type: string = propInfo.type;
    return { property, isList, isPart, type };
}
