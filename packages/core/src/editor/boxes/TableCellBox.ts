import { FreNode } from "../../ast/index.js";
import { Box } from "./Box.js";
import { GridCellBox } from "./GridCellBox.js";
import { getContextMenuOptions, MenuItem, MenuOptionsType } from "../util/index.js";
import { isElementBox } from "./ElementBox.js";
import { isTableBox, TableBox } from "./TableBox.js";

export class TableCellBox extends GridCellBox {
    kind: string = "TableCellBox";
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    constructor(
        node: FreNode,
        propertyName: string,
        propertyIndex: number,
        conceptName: string,
        role: string,
        row: number,
        column: number,
        box: Box,
        initializer?: Partial<TableCellBox>,
    ) {
        super(node, role, row, column, box, initializer);
        // both propertyName and conceptName should be equal to the same attributes of the parent TableBox and TableRowBox
        this.propertyName = propertyName;
        this.propertyIndex = propertyIndex;
        this.conceptName = conceptName;
    }

    options(type: MenuOptionsType): MenuItem[] {
        let listParent: FreNode;
        if (type === MenuOptionsType.placeholder || type === MenuOptionsType.header) {
            // the element associated with this box is the listParent itself
            listParent = this.node;
        } else {
            listParent = this.node.freOwner();
        }
        // console.log(`listParent ${listParent.freLanguageConcept()}, conceptName: ${this.conceptName}`);
        return getContextMenuOptions(this.conceptName, listParent, this.propertyName, type);
    }

    /**
     * This method is used to determine whether the corresponding component should have a drag handle.
     * Drag handle must only be present for the first cell in an ElementBox, i.e. one drag handle per node/element.
     */
    isFirstInElementBox(): boolean {
        if (!this.parent) return false;

        const parentRow: Box = this.parent; // should be a TableRowBox
        const grandparent: Box = parentRow.parent; // either an ElementBox or a TableBox

        return (
            isElementBox(grandparent) &&
            parentRow.children.length > 0 &&
            parentRow.children[0] === this
        );
    }

    getParentTableBox(): TableBox | undefined {
        if (!this.parent) return undefined;

        const grandparent: Box = this.parent.parent; // either an ElementBox or a TableBox
        if (isTableBox(grandparent)) {
            return grandparent;
        } else if (isElementBox(grandparent) && isTableBox(grandparent.parent)) {
            return grandparent.parent as TableBox;
        }
        return undefined;
    }
}

export function isTableCellBox(box: Box): box is TableCellBox {
    return box?.kind === "TableCellBox"; //  box instanceof TableCellBox;
}
