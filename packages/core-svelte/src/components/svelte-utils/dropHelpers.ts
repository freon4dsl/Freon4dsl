import { FindElementUtil, Language, PiElement, PiModel, PropertyKind } from "@projectit/core";

export type DropInfo = {
    parentElementId: string;        // id used to find the parent element of the element that is to be dropped
    propertyName: string;           // name of the property that represents the list from which the dropped element is taken
    propertyType: string;           // the name of the type of the property  - used to quickly detemrine whether the element may be dropped
    index: number;                  // the index in [propertyName] of the element to be dropped
}

export function moveListElement(element: PiElement, propertyName: string, oldIndex: number, targetIndex: number) {
    // console.log(`moveListElement=> element: ${element.piLanguageConcept()}, property: ${propertyName}, oldIndex: ${oldIndex}, targetIndex: ${targetIndex}`);
    const { property, isList } = getPropertyInfo(element, propertyName);
    // Note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length.
    // The splice(), however, still functions when the targetIndex > property.length.
    if (isList && oldIndex < property.length && targetIndex <= property.length) {
        // Note that because of the Mobx decorators that set the data on the parent of the element,
        // the property must be removed before it is added at a different location, not the other way around!
        const tmpProp = property[oldIndex];
        property.splice(oldIndex, 1);
        // Make sure the item is dropped above the target location
        if (targetIndex > 0) {
            targetIndex -= 1;
        }
        property.splice(targetIndex, 0, tmpProp);
    }
}

export function checkAndDrop(model: PiElement, element: PiElement, propertyName: string, dropped: DropInfo, targetIndex: number): boolean {
    const { property, isList, isPart, type } = getPropertyInfo(element, propertyName);
    // console.log('List before: [' + property.map(x => x.piId()).join(', ') + ']');
    let isAllowed = type === dropped.propertyType; // TODO extend to include subtypes
    if (isAllowed) {
        // find the item to be dropped in the model
        let droppedElement: PiElement;
        let parentOfDropped = FindElementUtil.findElementById(model, dropped.parentElementId);
        if (!!parentOfDropped) {
            const { property, isList, type } = getPropertyInfo(parentOfDropped, dropped.propertyName);
            if (!!property && isList) {
                droppedElement = property[dropped.index];
            }
        }
        if (!!droppedElement) {
            // add the found element to element[propertyName]
            // note that we need not explicitly remove the item from its old position, the mobx decorators do that
            const { property, isList } = getPropertyInfo(element, propertyName);
            // console.log(`targetIndex: ${targetIndex}, droppedElement: ${droppedElement.piId()}, property.length: ${property.length}`);
            // note that because of the placeholder that is shown as last element of a list, the targetIndex may be equal to the property.length
            if (isList && targetIndex <= property.length) {
                property.splice(targetIndex, 0, droppedElement);
            }
        }
    }
    // console.log('List after: [' + property.map(x => x.piId()).join(', ') + ']');
    return isAllowed;
}

function getPropertyInfo(element: PiElement, propertyName: string) {
    const property = element[propertyName];
    const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
    const isList: boolean = propInfo.isList;
    const isPart: PropertyKind = propInfo.propertyKind;
    const type: string = propInfo.type;
    return { property, isList, isPart, type };
}
