import { writable } from 'svelte/store';
/*
There is one instance of the ContextMenu which opens when the variable 'contextMenuVisible' becomes true.
Its contents are then determined based on the box for which it is opened.
 */
export const contextMenuVisible = writable(false); // indication whether any context menu is being shown
export const contextMenu = writable(null);
