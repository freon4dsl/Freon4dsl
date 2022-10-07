import { PiElement } from "../../ast";

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
