import { Box } from "./Box";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util";
import { TableCellBox } from "./TableCellBox";
import { TableDirection } from "./TableBox";

export class TableRowBox extends Box {
    kind = "TableRowBox";
    rowIndex: number = -1;
    _cells: TableCellBox[] = [];

    constructor(element: PiElement, role: string, cells: TableCellBox[], rowIndex: number, initializer?: Partial<TableRowBox>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        this.cells = cells;
        this.rowIndex = rowIndex;
        this.selectable = false;
    }

    get children(): ReadonlyArray<Box> {
        return this._cells;
    }

    get cells(): TableCellBox[] {
        return this._cells;
    }

    set cells(boxes: TableCellBox[]) {
        for (const c of this._cells) {
            c.parent = null;
        }
        this._cells = boxes;
        for (const c of this._cells) {
            c.parent = this;
        }
        this.isDirty();
    }

    // setFocus: () => void = async () => {
    //     // todo check if the first child if the one with the first column index
    //     this.children[0]?.setFocus();
    // };
}

export function isTableRowBox(box: Box): box is TableRowBox {
    return box?.kind === "TableRowBox"; //  box instanceof TableRowBox;
}
