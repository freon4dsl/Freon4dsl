import { GridCellBox } from "./GridCellBox";
import { PiElement } from "../../ast";
import { Box } from "./Box";
import { getContextMenuOptions, MenuItem, MenuOptionsType } from "../util";

export class TableCellBox extends GridCellBox {
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    constructor(element: PiElement, propertyName: string, conceptName: string, role: string, row: number, column: number, box: Box, initializer?: Partial<TableCellBox>) {
        super(element, role, row, column, box, initializer);
        // both propertyName and conceptName should be equal to the same attributes of the parent TableBox
        this.propertyName = propertyName;
        this.conceptName = conceptName;
    }

    options(type: MenuOptionsType): MenuItem[] {
        return getContextMenuOptions(this.conceptName, this.parent.element, this.propertyName, type);
    }
}
