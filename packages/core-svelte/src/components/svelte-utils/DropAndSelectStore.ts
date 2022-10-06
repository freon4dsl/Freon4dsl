import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Box, PiElement } from "@projectit/core";

/**
 * Note that because of the table component we need to be able to select multiple boxes.
 * If more than one box is selected, they all refer to the same element. It is this element that
 * subsequently can be handled (dragged, deleted, etc...).
 */
export let selectedBoxes: Writable<Box[]> = writable<Box[]>([]);                // the currently selected boxes

export const draggedElem: Writable<ListElementInfo> = writable<ListElementInfo>(null);  // info of the model element that is currently being dragged
export const draggedFrom: Writable<string> = writable<string>('');              // id of the svelte component that contains the dragged element

export const activeElem: Writable<GridIndex> = writable<GridIndex>({row:-1, column:-1});   // index of the grid element that is currently being dragged-over
export const activeIn: Writable<string> = writable<string>('');                 // id of the svelte component that contains the 'active' element

export type GridIndex = {row:number, column: number};

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
