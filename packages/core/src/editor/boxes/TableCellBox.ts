import { FreNode } from "../../ast";
import { Box } from "./Box";
import { GridCellBox } from "./GridCellBox";
import { getContextMenuOptions, MenuItem, MenuOptionsType } from "../util";

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
}

export function isTableCellBox(box: Box): box is TableCellBox {
    return box?.kind === "TableCellBox"; //  box instanceof TableCellBox;
}
