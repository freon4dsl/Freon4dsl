import { Box } from "./Box";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util";
import { TableCellBox } from "./TableCellBox";

export class TableRowBox extends Box {
    kind = "TableRowBox";
    cells: TableCellBox[] = [];

    constructor(element: PiElement, role: string, cells: TableCellBox[], initializer?: Partial<TableRowBox>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        this.cells = cells;
    }
}

export function isTableRowBox(box: Box): box is TableRowBox {
    return box.kind === "TableRowBox"; //  box instanceof TableRowBox;
}
