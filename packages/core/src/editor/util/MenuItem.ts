import type { FreNode } from "../../ast/index.js";
import type { FreEditor } from "../FreEditor.js";

export class MenuItem {
    // The label shown in the menu
    label: string;
    // A keyboard shortcut, if available
    shortcut: string;
    // Subitems to this menuItem, if any
    subItems: MenuItem[] = [];
    // The method that is called when this menu item is chosen.
    // In the handler, sometimes we need to know the element, sometimes we need only the index of the element.
    // For sake of conformity, we always pass both parameters.
    handler: (element: FreNode, index: number, editor: FreEditor) => void;

    constructor(
        label: string,
        shortcut: string,
        handler: (element: FreNode, index: number, editor: FreEditor) => void,
        subItems?: MenuItem[],
    ) {
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
