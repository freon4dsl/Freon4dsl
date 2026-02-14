import type { FreNamedNode, FreNode, FreNodeReference } from "../../ast/index.js"
import { isFreNode, isFreNodeReference } from "../../ast/index.js"
import type { DragAndDropType } from "../../language/index.js"

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

    constructor(node: FreNode | FreNodeReference<FreNamedNode>, componentId: string) {
        this.element = node;
        this.componentId = componentId;
        if (isFreNode(node)) {
            this.elementType = { type: node.freLanguageConcept(), isRef: false};
            this.propertyName = node.freOwnerDescriptor().propertyName;
            this.propertyIndex = node.freOwnerDescriptor().propertyIndex;
        } else if (isFreNodeReference(node)) {
            this.elementType = { type: node.referred?.freLanguageConcept(), isRef: true}
            this.propertyName = node.referred.freOwnerDescriptor().propertyName;
            this.propertyIndex = node.referred.freOwnerDescriptor().propertyIndex;
        } else {
            console.error("ListElementInfo is neoither a FreNode, nor a FreReference: " +JSON.stringify(node))
        }
    }
}
