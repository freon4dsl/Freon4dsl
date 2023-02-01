import { PiElement } from "../../ast";

/**
 * This class represent information on a single element from a list in the PiElement model.
 * It is used to keep information on the element being handled in case of drag-and-drop, cut-and-paste, etc.
 */
export class ListElementInfo {
    element: PiElement;     // the element that is part of a list and which is currently being dragged
    componentId: string;    // the id of the component that holds the element
    elementType: string;    // the piLanguageConcept() of the element
    propertyName: string;   // the name of the property in which the element is stored by its parent
    propertyIndex: number;  // the index within the list

    constructor(element: PiElement, boxId: string) {
        this.element = element;
        this.componentId = boxId;
        this.elementType = this.element.piLanguageConcept();
        this.propertyName = this.element.piOwnerDescriptor().propertyName;
        this.propertyIndex = this.element.piOwnerDescriptor().propertyIndex;
    }
}
