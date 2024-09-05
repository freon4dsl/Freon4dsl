import { GridCellBox } from "./GridCellBox";

import { Box } from "./Box";
import { FreNode } from "../../ast";
import { FreUtils } from "../../util";

export type GridOrientation = "neutral" | "row" | "column";

export class GridBox extends Box {
    kind: string = "GridBox";
    cells: GridCellBox[] = [];
    orientation: GridOrientation = "neutral";

    constructor(node: FreNode, role: string, cells: GridCellBox[], initializer?: Partial<GridBox>) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.cells = cells;
        this.cells.forEach((c) => {
            if (!c.columnSpan) {
                c.columnSpan = 1;
            }
            if (!c.rowSpan) {
                c.rowSpan = 1;
            }
            c.parent = this;
        });
        this.selectable = false;
        this.sortCellsAndAddChildren();
    }

    get children(): ReadonlyArray<Box> {
        return this.cells;
    }

    // Sorting is done to make it easier to read the final HTML.
    private sortCellsAndAddChildren() {
        this.cells = this.cells.sort(compare);
    }

    numberOfColumns(): number {
        let max = 0;
        this.cells.forEach((c) => (max = Math.max(max, c.column + c.columnSpan)));
        return max;
    }

    numberOfRows(): number {
        let max = 0;
        this.cells.forEach((cell) => (max = Math.max(max, cell.row + cell.rowSpan)));
        return max;
    }
}

function compare(a: GridCellBox, b: GridCellBox): number {
    if (a.row < b.row) {
        return -1;
    } else if (a.row > b.row) {
        return 1;
    } else {
        return a.column - b.column;
    }
}

export function isGridBox(box: Box): box is GridBox {
    return box?.kind === "GridBox"; //  box instanceof GridBox;
}
