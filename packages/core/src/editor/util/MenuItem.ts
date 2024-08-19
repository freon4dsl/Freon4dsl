import { FreNode } from "../../ast";
import { FreEditor } from "../FreEditor";

export class MenuItem {
    label: string; // the label shown in the menu
    shortcut: string; // a keyboard shortcut, if available
    subItems: MenuItem[] = []; // subitems to this menuItem, if any
    handler: (element: FreNode, index: number, editor: FreEditor) => void; // the method that is called when this menu item is choosen
    // In the handler, sometimes we need to know the element, sometimes we need only the index of the element.
    // For sake of conformity, we always pass both parameters.

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
