import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { PiElement } from "@projectit/core";
import type ContextMenu from "../ContextMenu.svelte";

/*
There is one instance of the ContextMenu which opens when the variable 'contextMenuVisible' becomes true.
Its contents are then determined based on the box for which it is opened.
 */

export const contextMenuVisible: Writable<boolean> = writable<boolean>(false);  // indication whether any context menu is being shown
export const contextMenu: Writable<ContextMenu> = writable(null);

export class MenuItem {
    label: string;
    shortcut: string;
    handler: (e: PiElement) => void;
    subItems: MenuItem[] = [];

    constructor(label: string, shortcut: string, handler: (e: PiElement) => void, subItems?: MenuItem[]) {
        this.label = label;
        this.shortcut = shortcut;
        this.handler = handler;
        if (subItems !== undefined && subItems !== null) {
            this.subItems = subItems;
        }
    }

    hasSubItems(): boolean {
        return this.subItems.length > 0;
    }
}

const submenuItems: MenuItem[] = [
    new MenuItem("Subclass1", 'Alt+X', (e: PiElement) => console.log('Subclass1 chosen...' + e)),
    new MenuItem("Subclass2", '', (e: PiElement) => console.log('Subclass2 chosen...' + e)),
    new MenuItem("Subclass3", '', (e: PiElement) => console.log('Subclass3 chosen...' + e)),
    new MenuItem("Subclass4", '', (e: PiElement) => console.log('Subclass4 chosen...' + e))
];

export const items: MenuItem[] = [
    new MenuItem( 'Add before', 'Ctrl+A"', (e: PiElement) => {}, submenuItems),
    new MenuItem( 'Add after', 'Ctrl+I"', (e: PiElement) => {}, submenuItems),
        new MenuItem( 'Delete', '', (e: PiElement) => console.log('Deleting ' + e)),
    new MenuItem( '---', '', (e: PiElement) => {}),
    new MenuItem( 'Cut', '', (e: PiElement) => console.log('Cut...' + e)),
    new MenuItem( 'Copy', '', (e: PiElement) => console.log('Copy...' + e)),
    new MenuItem( 'Paste before', '', (e: PiElement) => console.log('Paste before...' + e)),
    new MenuItem( 'Paste after', '', (e: PiElement) => console.log('Paste after...' + e)),
];
