import { writable } from 'svelte/store';
/**
 * Note that because of the table component we need to be able to select multiple boxes.
 * If more than one box is selected, they all refer to the same element. It is this element that
 * subsequently can be handled (dragged, deleted, etc...).
 */
export let selectedBoxes = writable([]); // the currently selected boxes
export const draggedElem = writable(null); // info of the model element that is currently being dragged
export const draggedFrom = writable(''); // id of the svelte component that contains the dragged element
export const activeElem = writable({ row: -1, column: -1 }); // index of the grid element that is currently being dragged-over
export const activeIn = writable(''); // id of the svelte component that contains the 'active' element
