/// <reference types="svelte" />
import type { Writable } from 'svelte/store';
import type { Box, ListElementInfo } from "@freon4dsl/core";
/**
 * Note that because of the table component we need to be able to select multiple boxes.
 * If more than one box is selected, they all refer to the same element. It is this element that
 * subsequently can be handled (dragged, deleted, etc...).
 */
export declare let selectedBoxes: Writable<Box[]>;
export declare const draggedElem: Writable<ListElementInfo>;
export declare const draggedFrom: Writable<string>;
export declare const activeElem: Writable<GridIndex>;
export declare const activeIn: Writable<string>;
export type GridIndex = {
    row: number;
    column: number;
};
//# sourceMappingURL=DropAndSelectStore.d.ts.map