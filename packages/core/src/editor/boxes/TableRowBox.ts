import { Box } from "./Box";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util";
import { TableCellBox } from "./TableCellBox";
import { TableDirection } from "./TableBox";

export class TableRowBox extends Box {
    kind = "TableRowBox";
    rowIndex: number = -1;
    cells: TableCellBox[] = [];

    constructor(element: PiElement, role: string, cells: TableCellBox[], rowIndex: number, initializer?: Partial<TableRowBox>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        this.cells = cells;
        this.rowIndex = rowIndex;
        this.cells.forEach( c => c.parent = this);
    }
}

export function isTableRowBox(box: Box): box is TableRowBox {
    return box.kind === "TableRowBox"; //  box instanceof TableRowBox;
}
