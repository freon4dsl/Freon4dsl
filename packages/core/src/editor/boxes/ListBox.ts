import { Box } from "./Box";
import { FreNode } from "../../ast";
import { FreLanguage } from "../../language";
import { getContextMenuOptions, MenuItem, MenuOptionsType } from "../util";
import { LayoutBox, ListDirection } from "./LayoutBox";

// import { FreLogger } from "../../logging";
// const LOGGER = new FreLogger("ListBox");

/**
 * This Box represents a list in the FreElement model, i.e. one that is defined in the .ast file
 * as 'propName: conceptName[]' or 'reference propName: conceptName[]'.
 */
export abstract class ListBox extends LayoutBox {
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    protected constructor(node: FreNode, role: string, propertyName: string, children?: Box[], initializer?: Partial<ListBox>) {
        super(node, role, children, initializer);
        this.kind = "ListBox";
        this.propertyName = propertyName;
        this.conceptName = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName)?.type;
    }

    options(type: MenuOptionsType): MenuItem[] {
        return getContextMenuOptions(this.conceptName, this.element, this.propertyName, type);
    }
}

export class HorizontalListBox extends ListBox {
    kind: string = "HorizontalListBox";

    constructor(element: FreNode, role: string, propertyName: string, children?: (Box | null)[], initializer?: Partial<HorizontalListBox>, cssClass?: string) {
        super(element, role, propertyName, children, initializer);
        this.direction = ListDirection.HORIZONTAL;
        this.cssClass = cssClass;
    }
}

export class VerticalListBox extends ListBox {
    kind = "VerticalListBox";

    constructor(node: FreNode, role: string, propertyName: string, children?: Box[], initializer?: Partial<HorizontalListBox>, cssClass?: string) {
        super(node, role, propertyName, children, initializer);
        this.direction = ListDirection.VERTICAL;
        this.cssClass = cssClass;
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
