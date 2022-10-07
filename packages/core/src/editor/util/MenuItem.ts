import { PiElement } from "../../ast";
import { PiEditor } from "../PiEditor";

export class MenuItem {
    label: string;
    shortcut: string;
    handler: (element: PiElement, editor: PiEditor) => void;
    subItems: MenuItem[] = [];

    constructor(label: string, shortcut: string, handler: (element: PiElement, editor: PiEditor) => void, subItems?: MenuItem[]) {
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
