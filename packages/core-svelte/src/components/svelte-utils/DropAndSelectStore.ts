import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Box } from "@projectit/core";

export let selectedBoxes: Writable<Box[]> = writable<Box[]>([]);                   // the currently selected model element

export const draggedElem: Writable<ElementInfo> = writable<ElementInfo>(null);  // info of the model element that is currently being dragged
export const draggedFrom: Writable<string> = writable<string>('');              // id of the svelte component that contains the dragged element

export const activeElem: Writable<GridIndex> = writable<GridIndex>({row:-1, column:-1});   // index of the grid element that is currently being dragged-over
export const activeIn: Writable<string> = writable<string>('');                 // id of the svelte component that contains the 'active' element

export type GridIndex = {row:number, column: number};

export class ElementInfo {
    elementId: string;      // the id of the model element
    elementType: string;    // the piLanguageConcept() of the element
    ownerId: string;        // the id of the box that holds the element
    propertyName: string;   // the name of the property in which the element is stored by its parent
    row: number = -1;       // [row, column] gives the position of the element if part of a list or grid
    column: number = -1;    // in case that the element is part of a list, the column is unused

    constructor(elementId: string, elementType: string, ownerId: string, propertyName: string, row: number, column?: number) {
        this.elementType = elementType;
        this.elementId = elementId;
        this.ownerId = ownerId;
        this.propertyName = propertyName;
        this.row = row;
        if (this.column !== undefined && this.column !== null) {
            this.column = column;
        }
    }
}
