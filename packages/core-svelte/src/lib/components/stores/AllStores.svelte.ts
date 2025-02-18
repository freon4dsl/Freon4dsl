import ContextMenu from '$lib/components/ContextMenu.svelte';
import type { Box, ListElementInfo } from '@freon4dsl/core';

export type GridIndex = { row: number; column: number };
export class ViewportSizes {
    width: number = 0;
    height: number = 0;
    top: number = 0;
    left: number = 0;

    setSizes(height: number, width: number, top: number, left: number) {
        this.height = height;
        this.width = width;
        this.top = top;
        this.left = left;
    }
}

export const viewport: { value: ViewportSizes } = $state({ value: new ViewportSizes() });
// indication whether any context menu is being shown
export const contextMenuVisible: { value: boolean } = $state({ value: false });
// variable that holds the single instance of the context menu
export const contextMenu: { instance: ContextMenu | null } = $state({ instance: null });
// the currently selected boxes
export const selectedBoxes: { value: Box[] } = $state({ value: [] });
// indication whether the current keystroke should be handled by the browser or by the FreonComponent
export const shouldBeHandledByBrowser: { value: boolean } = $state({ value: false });

// info of the model element that is currently being dragged
export const draggedElem: { value: ListElementInfo | null } = $state({ value: null });
// id of the svelte component that contains the dragged element
export const draggedFrom: { value: string } = $state({ value: '' });
// index of the grid element that is currently being dragged-over
export const activeElem: { value: GridIndex | undefined } = $state({ value: undefined });
// id of the svelte component that contains the 'active' element
export const activeIn: { value: string } = $state({ value: '' });
