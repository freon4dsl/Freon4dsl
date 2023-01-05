import { PiElement } from "../../ast";
import { Box } from "./Box";
import { GridCellBox } from "./GridCellBox";
import { getContextMenuOptions, MenuItem, MenuOptionsType } from "../util";


export class TableCellBox extends GridCellBox {
    kind = "TableCellBox";
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    constructor(element: PiElement, propertyName: string, propertyIndex: number, conceptName: string, role: string, row: number, column: number, box: Box, initializer?: Partial<TableCellBox>) {
        super(element, role, row, column, box, initializer);
        // console.log("TableCellBox creating " + box.role)
        // both propertyName and conceptName should be equal to the same attributes of the parent TableBox and TableRowBox
        this.propertyName = propertyName;
        this.propertyIndex = propertyIndex;
        this.conceptName = conceptName;
    }

    options(type: MenuOptionsType): MenuItem[] {
        return getContextMenuOptions(this.conceptName, this.element.piOwner(), this.propertyName, type);
    }
}

export function isTableCellBox(box: Box): box is TableCellBox {
    return box?.kind === "TableCellBox"; //  box instanceof TableCellBox;
}
