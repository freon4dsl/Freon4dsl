import { FreNamedNode, FreNode, FreNodeReference, isFreNode, isFreNodeReference } from "../../ast/index.js"
import { DragAndDropType } from "../../language/index.js"

/**
 * This class represent information on a single element from a list in the FreNode model.
 * It is used to keep information on the element being handled in case of drag-and-drop, cut-and-paste, etc.
 */
export class ListElementInfo {
    element: FreNode | FreNodeReference<FreNamedNode>; // the element that is part of a list and which is currently being dragged
    componentId: string; // the id of the component that holds the element
    elementType: DragAndDropType; // the freLanguageConcept() of the element
    propertyName: string; // the name of the property in which the element is stored by its parent
    propertyIndex: number; // the index within the list

    constructor(element: FreNode | FreNodeReference<FreNamedNode>, componentId: string) {
        this.element = element;
        this.componentId = componentId;
        if (isFreNode(element)) {
            this.elementType = { type: element.freLanguageConcept(), isRef: false};
            this.propertyName = element.freOwnerDescriptor().propertyName;
            this.propertyIndex = element.freOwnerDescriptor().propertyIndex;
        } else if (isFreNodeReference(element)) {
            this.elementType = { type: element.referred?.freLanguageConcept(), isRef: true}
            this.propertyName = element.referred.freOwnerDescriptor().propertyName;
            this.propertyIndex = element.referred.freOwnerDescriptor().propertyIndex;
        } else {
            console.error("ListElementInfo is neoither a FreNode, nor a FreReference: " +JSON.stringify(element))
        }
    }
}
