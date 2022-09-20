import { FindElementUtil, Language, PiElement, PropertyKind } from "@projectit/core";
import type { ListElementInfo } from "./DropAndSelectStore";

export type DropInfo = {
    parentElementId: string;        // id used to find the parent element of the element that is to be dropped
    propertyName: string;           // name of the property that represents the list from which the dropped element is taken
    propertyType: string;           // the name of the type of the property  - used to quickly detemrine whether the element may be dropped
    index: number;                  // the index in [propertyName] of the element to be dropped
}

export function moveListElement(parentElement: PiElement, movedElement: PiElement, targetPropertyName: string, targetIndex: number) {
    // console.log(`moveListElement=> element: ${parentElement.piLanguageConcept()}, property: ${propertyName}, oldIndex: ${oldIndex}, targetIndex: ${targetIndex}`);
    // get info about the property that needs to be changed
    const { property, isList } = getPropertyInfo(parentElement, targetPropertyName);
    let oldIndex: number = movedElement.piOwnerDescriptor().propertyIndex;
    // Note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length.
    // The splice(), however, still functions when the targetIndex > property.length.
    if (isList && oldIndex < property.length && targetIndex <= property.length) {
        // Note that because of the Mobx decorators that set the data on the parent of the element,
        // the property must be removed before it is added at a different location, not the other way around!
        const tmpProp = property[oldIndex];
        property.splice(oldIndex, 1);
        // Make sure the item is added at the correct index // todo see if this can be done where function is called
        if (targetIndex > 0) {
            targetIndex -= 1;
        }
        property.splice(targetIndex, 0, tmpProp);
    }
    // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
}

export function dropListElement(dropped: ListElementInfo, targetElem: PiElement, targetPropertyName: string, targetIndex: number) {
    // console.log(`dropListElement=> element: ${dropped.element.piLanguageConcept()}, property: ${dropped.propertyName},
    //     oldIndex: ${dropped.propertyIndex}, targetElem: ${targetElem},
    //     targetPropertyName ${targetPropertyName}, targetIndex: ${targetIndex}`);
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
}

function getPropertyInfo(element: PiElement, propertyName: string) {
    console.log(`element: ${element.piId()}, element type: ${element.piLanguageConcept()}, propertyName: ${propertyName}`)
    const property = element[propertyName];
    const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
    const isList: boolean = propInfo.isList;
    const isPart: PropertyKind = propInfo.propertyKind;
    const type: string = propInfo.type;
    return { property, isList, isPart, type };
}
