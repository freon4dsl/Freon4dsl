import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type ContextMenu from "../ContextMenu.svelte";

/*
There is one instance of the ContextMenu which opens when the variable 'contextMenuVisible' becomes true.
Its contents are then determined based on the box for which it is opened.
 */

export const contextMenuVisible: Writable<boolean> = writable<boolean>(false); // indication whether any context menu is being shown
export const contextMenu: Writable<ContextMenu> = writable(null);
