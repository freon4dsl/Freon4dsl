/**
 * This is a series of helper functions for changes in list properties.
 * They support drag-and-drop and cut/copy-paste functionality.
 */
import { FREON } from "../../environment/index.js"
import { jsonAsString, notNullOrUndefined } from "../../util/index.js";
// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import * as Keys from "./Keys.js";
import { MetaKey } from "./Keys.js";
import { FreLogger } from "../../logging/index.js";
import { FreCreatePartAction, type FreEditor, MenuItem } from "../index.js";
import type { ListElementInfo } from "../index.js";
import { FreLanguage } from "../../language/index.js";
import type { DragAndDropType, FreLanguageClassifier, PropertyKind } from "../../language/index.js";
import type { FreNamedNode, FreNode, FreNodeReference } from "../../ast/index.js";
import { isFreNodeReference } from "../../ast/index.js";
import { FreErrorSeverity } from "../../validator/index.js";

const LOGGER = new FreLogger("ListUtil");

export enum MenuOptionsType {
    normal,
    placeholder,
    header,
}

/**
 * When the user hits 'ENTER', this action is triggered.
 * @param role
 * @param propertyName
 * @param conceptName
 * @param roleToSelect
 */
export function createKeyboardShortcutForList2(
    role: string,
    propertyName: string,
    conceptName: string,
    roleToSelect: string,
): FreCreatePartAction {
    LOGGER.log("LIST role [" + role + "]");
    return new FreCreatePartAction({
        trigger: { meta: MetaKey.None, key: Keys.ENTER, code: Keys.ENTER },
        activeInBoxRoles: [role, "action-" + role + "-textbox"],
        conceptName: conceptName,
        propertyName: propertyName,
        boxRoleToSelect: roleToSelect,
    });
}

/**
 * This function is executed, when a list element is dragged to another position in the same list.
 * @param parentNode
 * @param movedNode
 * @param targetPropertyName
 * @param targetIndex
 */
export function moveListElement(
    parentNode: FreNode,
    movedNode: FreNode | FreNodeReference<FreNamedNode>,
    targetPropertyName: string,
    targetIndex: number
) {
    // console.log(`moveListElement: ${targetPropertyName}, ${parentElement.freId()}`)
    // get info about the property that needs to be changed
    const { property, isList } = getPropertyInfo(parentNode, targetPropertyName);
    // console.log('List before: [' + property.map(x => x["name"]).join(', ') + ']');
    const oldIndex: number = movedNode.freOwnerDescriptor().propertyIndex;
    // tslint:disable-next-line:max-line-length
    // console.log(`moveListElement=> element: ${parentElement.freLanguageConcept()}, property: ${targetPropertyName}, oldIndex: ${oldIndex}, targetIndex: ${targetIndex}`);
    // Note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length.
    // The splice(), however, still functions when the targetIndex > property.length.
    if (isList && oldIndex < property.length && targetIndex <= property.length) {
        // Note that because of the Mobx decorators that set the data on the parent of the element,
        // the property must be removed before it is added at a different location, not the other way around!
        FREON.astChanger.change(() => {
            const tmpProp = property[oldIndex];
            property.splice(oldIndex, 1);
            // Make sure the item is added at the correct index
            if (targetIndex > 0) {
                targetIndex -= 1;
            }
            property.splice(targetIndex, 0, tmpProp);
        });
    }
    // console.log('List after: [' + property.map(x => x["name"]).join(', ') + ']');
}

function printTypeName(dropped: DragAndDropType): string {
    if (dropped.isRef) {
        return 'Reference to ' + dropped.type;
    } else {
        return dropped.type;
    }
}

/**
 * This function is executed when a list element is being dragged and then dropped into another list.
 * @param editor
 * @param dropped
 * @param targetMetaType
 * @param targetElem
 * @param targetPropertyName
 * @param targetIndex
 */
export function dropListElement(
    editor: FreEditor,
    dropped: ListElementInfo,
    targetMetaType: DragAndDropType,
    targetElem: FreNode,
    targetPropertyName: string,
    targetIndex: number,
) {
    if (notNullOrUndefined(dropped.element)) {
        // First, check whether the types allow a drop
        if (!FreLanguage.getInstance().dragMetaConformsToType(dropped.elementType, targetMetaType)) {
            // check if item may be dropped here
            editor.setUserMessage(
                "Drop is not allowed here, because the types do not match (" +
                printTypeName(dropped.elementType) +
                " does not conform to " +
                printTypeName(targetMetaType) +
                ").",
                FreErrorSeverity.Error,
            );
            return;
        }

        // The dropped element may have a completely different projection within the context of
        // the node in which it is dropped. Therefore, we clean the used projection for the dropped element.
        if (!isFreNodeReference(dropped.element)) {
            editor.projection.getBoxProvider(dropped.element).clearUsedProjection();
        }

        // Types ok, now perform the actual transfer from one list on another.
        const {property, isList} = getPropertyInfo(targetElem, targetPropertyName);
        // console.log('List before: [' + property.map(x => x["name"]).join(', ') + ']');
        // Add the found element to 'targetElem[targetPropertyName]' at position 'targetIndex'.
        // Note that we need not explicitly remove the item from its old position, the mobx decorators do that.
        // Note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length.
        if (isList && targetIndex <= property.length) {
            FREON.astChanger.change(() => {
                property.splice(targetIndex, 0, dropped.element);
            })
        }
        // console.log('List after: [' + property.map(x => x["name"]).join(', ') + ']');
    }
}

/**
 * This function builds the MenuItems for the context menu that is coupled to a list box.
 * @param conceptName       the expected type of the elements in the list
 * @param listParent        the parent element that holds list in which element need to be added, changed, etc
 * @param propertyName      the name of the property in which the list is stored
 * @param optionsType       in case the options are created for a placeholder or header, we add lesser items (e.g. no DELETE)
 */
export function getContextMenuOptions(
    conceptName: string,
    listParent: FreNode,
    propertyName: string,
    optionsType: MenuOptionsType,
): MenuItem[] {
    LOGGER.log(`getContextMenuOptions
    conceptname: ${conceptName}
    listparent: ${listParent.freId()}=${listParent.freLanguageConcept()}
    propertyName: ${propertyName}
    optionsType ${optionsType}`);
    // do some checks
    const clsOtIntf: FreLanguageClassifier = FreLanguage.getInstance().classifier(conceptName);

    const errorItem: MenuItem = new MenuItem(
        "No options available",
        "",
        (_node: FreNode, _index: number, _editor: FreEditor) => {},
    );
    if (clsOtIntf === undefined || clsOtIntf === null) {
        console.error("Unexpected: Cannot find class or interface for [" + conceptName + "]");
        return [errorItem];
    }
    let items: MenuItem[];
    // first create the items that depend upon the conceptName
    let addBefore: MenuItem;
    let addAfter: MenuItem;
    const contextMsg: string = ""; // TODO Use this?: index !== undefined && (listParent[propertyName][index]["name"] !== undefined) ? listParent[propertyName][index]["name"] : ""
    // the handler signature demands the use of certain parameters, therefore the ts-ignore-s
    if (clsOtIntf.subConceptNames.length > 0) {
        // there are sub concepts, so create sub menu items
        // todo subclasses to be tested in different project than Example
        const submenuItemsBefore: MenuItem[] = [];
        const submenuItemsAfter: MenuItem[] = [];
        clsOtIntf.subConceptNames
            .filter((subName) => !FreLanguage.getInstance().classifier(subName).isAbstract)
            .forEach((creatableConceptname: string) => {
                submenuItemsBefore.push(
                    new MenuItem(
                        creatableConceptname,
                        "",
                        (_node: FreNode, index: number, editor: FreEditor) =>
                            addListElement(editor, listParent, propertyName, index, creatableConceptname, true),
                    ),
                );
                submenuItemsAfter.push(
                    new MenuItem(
                        creatableConceptname,
                        "",
                        (_node: FreNode, index: number, editor: FreEditor) =>
                            addListElement(editor, listParent, propertyName, index, creatableConceptname, false),
                    ),
                );
            });
        addBefore = new MenuItem(
            `Add before ${contextMsg}`,
            '', //"Ctrl+A",
            (_element: FreNode, _index: number, _editor: FreEditor) => {},
            
            submenuItemsBefore,
        );
        addAfter = new MenuItem(
            `Add after ${contextMsg}`,
          '', //"Ctrl+I",
            (_node: FreNode, _index: number, _editor: FreEditor) => {},
            submenuItemsAfter,
        );
    } else {
        addBefore = new MenuItem(
            `Add before ${contextMsg}`,
          '', //"Ctrl+A",
            (_node: FreNode, index: number, editor: FreEditor) =>
                addListElement(editor, listParent, propertyName, index, conceptName, true),
        );
        addAfter = new MenuItem(
            `Add after ${contextMsg}`,
          '', //"Ctrl+I",
            (_node: FreNode, index: number, editor: FreEditor) =>
                addListElement(editor, listParent, propertyName, index, conceptName, false),
        );
    }
    const pasteBefore = new MenuItem(
        "Paste before",
        "",
        (_node: FreNode, index: number, editor: FreEditor) =>
            pasteListElement(listParent, propertyName, index, editor, true),
    );
    const pasteAfter = new MenuItem(
        "Paste after",
        "",
        (_node: FreNode, index: number, editor: FreEditor) =>
            pasteListElement(listParent, propertyName, index, editor, false),
    );

    // now create the whole item list
    if (optionsType === MenuOptionsType.placeholder) {
        // add lesser items for a placeholder
        items = [addBefore, pasteBefore];
    } else if (optionsType === MenuOptionsType.header) {
        // add lesser items for a header
        items = [addAfter, pasteAfter];
    } else {
        // In the following some parameters are only present to adhere to signature of super class
        items = [
            addBefore,
            addAfter,
            new MenuItem(
                "Delete",
                "",
                (node: FreNode, index: number, _editor: FreEditor) =>
                    deleteListElement(listParent, propertyName, index, node),
            ),
            new MenuItem(
                "---",
                "",
                (_node: FreNode, _index: number, _editor: FreEditor) => console.log("this is not an option"),
            ),
            new MenuItem(
                "Cut",
                "",
                (node: FreNode, _index: number, editor: FreEditor) =>
                    cutListElement(listParent, propertyName, node, editor),
            ),
            new MenuItem(
                "Copy",
                "",
                (node: FreNode, _index: number, editor: FreEditor) => copyListElement(node, editor),
            ),
            pasteBefore,
            pasteAfter,
        ];
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
function addListElement(
    editor: FreEditor,
    listParent: FreNode,
    propertyName: string,
    index: number,
    typeOfAdded: string,
    before: boolean,
) {
    LOGGER.log(`addListElement of type: ${typeOfAdded} index: ${index}`);
    // get info about the property that needs to be changed
    const { property, isList, type } = getPropertyInfo(listParent, propertyName);
    if (!before) {
        index++;
    }
    // LOGGER.log(`addListElement=> listParent: ${listParent.freLanguageConcept()}, isList: ${isList},
    // targetPropertyName ${propertyName}, index: ${index}`);

    // make the change, if the property is a list and the type of the new element conforms to the type of elements in the list
    const newNode: FreNode = FreLanguage.getInstance().concept(typeOfAdded)?.creator({});
    if (newNode === undefined || newNode === null) {
        console.error("New element undefined"); // TODO Find out why this happens sometimes
        return;
    } else if (isList && FreLanguage.getInstance().metaConformsToType(newNode, type)) {
        // allow subtyping
        // LOGGER.log('List before: [' + property.map(x => x.freId()).join(', ') + ']');
        FREON.astChanger.change(() => {
            property.splice(index, 0, newNode);
        });
        editor.selectElement(newNode);
        editor.selectFirstEditableChildBox(newNode);
        // LOGGER.log('List after: [' + property.map(x => x.freId()).join(', ') + ']');
    }
}

/**
 * This function deletes 'element' from its parent list.
 * @param listParent
 * @param propertyName
 * @param node
 */
function deleteListElement(listParent: FreNode, propertyName: string, index: number, node: FreNode) {
    // TODO Check whether this still works for tables as well.
    //      Remove 'element'  if possible.
    LOGGER.log("Delete list element in property: " + propertyName + "[" + index + "]");
    // get info about the property that needs to be changed
    // const parentElement: FreNode = element.freOwnerDescriptor().owner;
    // const targetPropertyName: string = element.freOwnerDescriptor().propertyName;
    const targetIndex: number = index; //  element.freOwnerDescriptor().propertyIndex;
    // console.log(`deleteListElement=> listParent: ${listParent.freLanguageConcept()},
    // propertyName ${propertyName}, index: ${targetIndex}`);

    LOGGER.log("   index of element " + node.freLanguageConcept() + "." + node.freId() + " is " + targetIndex);
    LOGGER.log(jsonAsString(node, 2));
    const { property, isList } = getPropertyInfo(listParent, propertyName);
    // make the change
    if (isList) {
        // console.log('List before: [' + property.length()); //map(x => x.freId()).join(', ') + ']');
        FREON.astChanger.change(() => {
            if (targetIndex < property.length) {
                property.splice(targetIndex, 1);
            }
        });
        // console.log('List after: [' + property.length()); //map(x => x.freId()).join(', ') + ']');
    }
}

/**
 * This function deletes 'element' from its parent list and stores 'element' in the
 * editor, for use in the paste options.
 * @param listParent
 * @param propertyName
 * @param node
 * @param editor
 */
function cutListElement(listParent: FreNode, propertyName: string, node: FreNode, editor: FreEditor) {
    const index = node.freOwnerDescriptor().propertyIndex
    deleteListElement(listParent, propertyName, index, node);
    editor.copiedElement = node;
}

/**
 * This function copies 'element' to the editor, for use in the paste options.
 * @param node
 * @param editor
 */
function copyListElement(node: FreNode, editor: FreEditor) {
    editor.copiedElement = node.copy();
}

/**
 * This function adds the element stored in the editor to the parent list of 'element'. Depending on
 * the parameter 'before', the stored element is added either before, or after 'element'.
 * @param listParent
 * @param propertyName
 * @param index
 * @param editor
 * @param before
 */
function pasteListElement(
    listParent: FreNode,
    propertyName: string,
    index: number,
    editor: FreEditor,
    before: boolean,
) {
    LOGGER.log(`pasteListElement index: ${index}`);

    // first, do some checks
    if (editor.copiedElement === null || editor.copiedElement === undefined) {
        editor.setUserMessage("Nothing to paste", FreErrorSeverity.Warning);
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
            "Types do not conform (" +
                editor.copiedElement.freLanguageConcept() +
                " does not conform to " +
                type +
                ").",
            FreErrorSeverity.Error,
        );
        return;
    }

    // make the change
    if (isList) {
        LOGGER.log("List before: [" + property.map((x) => x.freId()).join(", ") + "]");
        let insertedElement = editor.copiedElement;
        FREON.astChanger.change(() => {
            if (targetIndex <= property.length) {
                property.splice(targetIndex, 0, editor.copiedElement);
            }
            // make sure the element can be pasted elsewhere
            insertedElement = editor.copiedElement;
            editor.copiedElement = insertedElement.copy();
        });
        editor.selectElement(insertedElement);
        editor.selectFirstEditableChildBox(insertedElement);

        LOGGER.log("List after: [" + property.map((x) => x.freId()).join(", ") + "]");
    }
}

export type PropertyInfo = {
    property: any;
    isList: boolean;
    isPart: PropertyKind;
    type: string;
};
/**
 * This function returns information on the property within 'element' with name 'propertyName',
 * as it is available in 'Language.getInstance()'.
 * @param element
 * @param propertyName
 */
function getPropertyInfo(element: FreNode, propertyName: string): PropertyInfo {
    LOGGER.log(`element: ${element.freId()}, element type: ${element.freLanguageConcept()}, propertyName: ${propertyName}`)
    const property = element[propertyName];
    const propInfo = FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName);
    const isList: boolean = propInfo.isList;
    const isPart: PropertyKind = propInfo.propertyKind;
    const type: string = propInfo.type;
    return { property, isList, isPart, type };
}
