import { Box } from "./Box";
import { FreNode } from "../../ast";
import { FreUtils } from "../../util";
import { TableCellBox } from "./TableCellBox";

export class TableRowBox extends Box {
    kind: string = "TableRowBox";
    rowIndex: number = -1;
    _cells: TableCellBox[] = [];
    _isHeader: boolean = false;

    constructor(
        node: FreNode,
        role: string,
        cells: TableCellBox[],
        rowIndex: number,
        initializer?: Partial<TableRowBox>,
    ) {
        // todo add isHeader to the params
        super(node, role);
        FreUtils.initializeObject(this, initializer);
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

    set isHeader(b: boolean) {
        this._isHeader = b;
    }

    get isHeader(): boolean {
        return this._isHeader;
    }

    setFocus: () => void = async () => {
        // todo check if the first child is the one with the first column index
        this.children[0]?.setFocus();
    };
}

export function isTableRowBox(box: Box): box is TableRowBox {
    return box?.kind === "TableRowBox"; //  box instanceof TableRowBox;
}
