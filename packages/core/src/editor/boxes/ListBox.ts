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
    readonly kind: string = "ListBox";
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    protected constructor(
        node: FreNode,
        propertyName: string,
        role: string,
        children?: Box[],
        initializer?: Partial<ListBox>,
    ) {
        super(node, role, children, initializer);
        this.propertyName = propertyName;
        this.conceptName = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName)?.type;
    }

    options(type: MenuOptionsType): MenuItem[] {
        return getContextMenuOptions(this.conceptName, this.node, this.propertyName, type);
    }
}

export class HorizontalListBox extends ListBox {
    readonly kind: string = "HorizontalListBox";

    constructor(
        element: FreNode,
        propertyName: string,
        role: string,
        children?: (Box | null)[],
        initializer?: Partial<HorizontalListBox>,
    ) {
        super(element, role, propertyName, children, initializer);
        this.direction = ListDirection.HORIZONTAL;
    }
}

export class VerticalListBox extends ListBox {
    readonly kind: string = "VerticalListBox";

    constructor(
        node: FreNode,
        propertyName: string,
        role: string,
        children?: Box[],
        initializer?: Partial<HorizontalListBox>,
    ) {
        super(node, role, propertyName, children, initializer);
        this.direction = ListDirection.VERTICAL;
    }
}

export function isHorizontalList(b: Box): b is HorizontalListBox {
    return b.kind === "HorizontalListBox"; // b instanceof HorizontalListBox;
}

export function isVerticalList(b: Box): b is VerticalListBox {
    return b.kind === "VerticalListBox"; // b instanceof VerticalListBox;
}

export function isListBox(b: Box): b is ListBox {
    return b.kind === "HorizontalListBox" || b.kind === "VerticalListBox";
}
