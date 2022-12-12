import { PiElement } from "../../ast";
import { Box } from "./Box";
import { GridCellBox } from "./GridCellBox";


export class TableCellBox extends GridCellBox {
    kind = "TableCellBox";

    constructor(element: PiElement, role: string, row: number, column: number, box: Box, initializer?: Partial<TableCellBox>) {
        super(element, role, row, column, box, initializer);
        console.log("TableCellBox creating " + box.role)
    }
}

export function isTableCellBox(box: Box): box is TableCellBox {
    return box.kind === "TableCellBox"; //  box instanceof TableCellBox;
}
