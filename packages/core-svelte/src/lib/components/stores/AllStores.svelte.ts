import ContextMenu from '../ContextMenu.svelte';
import type { Box, ListElementInfo } from '@freon4dsl/core';
import type { PaneLike } from '../svelte-utils/PaneLike.js';

export type GridIndex = { row: number; column: number };

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

// pointer to the FreonComponent, to be able to do scrolling if needed
export const editorPane: { value: PaneLike | undefined } = $state({ value: undefined });
