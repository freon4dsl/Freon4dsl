import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { Box, ListElementInfo } from "@freon4dsl/core";

/**
 * Note that because of the table component we need to be able to select multiple boxes.
 * If more than one box is selected, they all refer to the same element. It is this element that
 * subsequently can be handled (dragged, deleted, etc...).
 */
export let selectedBoxes: Writable<Box[]> = writable<Box[]>([]); // the currently selected boxes

export const draggedElem: Writable<ListElementInfo> = writable<ListElementInfo>(null); // info of the model element that is currently being dragged
export const draggedFrom: Writable<string> = writable<string>(""); // id of the svelte component that contains the dragged element

export const activeElem: Writable<GridIndex> = writable<GridIndex>({ row: -1, column: -1 }); // index of the grid element that is currently being dragged-over
export const activeIn: Writable<string> = writable<string>(""); // id of the svelte component that contains the 'active' element

export type GridIndex = { row: number; column: number };
