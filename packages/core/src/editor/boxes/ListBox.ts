import { Box } from "./Box";
import { PiElement } from "../../ast";
import { Language } from "../../language";
import { PiLogger } from "../../logging";
import { getContextMenuOptions, MenuItem, MenuOptionsType } from "../util";
import { LayoutBox, ListDirection } from "./LayoutBox";

const LOGGER = new PiLogger("ListBox");

/**
 * This Box represents a list in the PiElement model, i.e. one that is defined in the .ast file
 * as 'propName: conceptName[]' or 'reference propName: conceptName[]'.
 */
export abstract class ListBox extends LayoutBox {
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    protected constructor(element: PiElement, propertyName: string, role: string, children?: Box[], initializer?: Partial<ListBox>) {
        super(element, role, children, initializer);
        this.kind = "ListBox";
        this.propertyName = propertyName;
        this.conceptName = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName)?.type;
    }

    options(type: MenuOptionsType): MenuItem[] {
        return getContextMenuOptions(this.conceptName, this.element, this.propertyName, type);
    }
}

export class HorizontalListBox extends ListBox {
    kind = "HorizontalListBox";

    constructor(element: PiElement, propertyName: string, role: string, children?: (Box | null)[], initializer?: Partial<HorizontalListBox>) {
        super(element, role, propertyName, children, initializer);
        this.direction = ListDirection.HORIZONTAL;
    }
}

export class VerticalListBox extends ListBox {
    kind = "VerticalListBox";

    constructor(element: PiElement, propertyName: string, role: string, children?: Box[], initializer?: Partial<HorizontalListBox>) {
        super(element, role, propertyName, children, initializer);
        this.direction = ListDirection.VERTICAL;
    }
}

export function isHorizontalList(b: Box): b is HorizontalListBox {
    return b.kind === "HorizontalListBox"; // b instanceof HorizontalListBox;
}

export function isVerticalList(b: Box): b is VerticalListBox {
    return b.kind === "VerticalListBox"; // b instanceof VerticalListBox;
}

export function isListBox(b: Box): boolean {
    return (b.kind === "HorizontalListBox" || b.kind === "VerticalListBox");
}
