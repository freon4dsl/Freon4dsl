import { observable, makeObservable } from "mobx";
import { GridCellBox } from "./GridCellBox";

import { Box } from "./internal";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util";

export type GridOrientation = "neutral" | "row" | "column";

export class GridBox extends Box {
    readonly kind = "GridBox";
    cells: GridCellBox[] = [];
    orientation: GridOrientation = "neutral";

    constructor(exp: PiElement, role: string, cells: GridCellBox[], initializer?: Partial<GridBox>) {
        super(exp, role);
        PiUtils.initializeObject(this, initializer);
        this.cells = cells;
        this.cells.forEach(c => {
            if (!c.columnSpan) {
                c.columnSpan = 1;
            }
            if (!c.rowSpan) {
                c.rowSpan = 1;
            }
        });
        this.sortCellsAndAddChildren();
        makeObservable(this, {
            cells: observable
        });
    }

    get children(): ReadonlyArray<Box> {
        return this.cells;
    }

    // Sorting is done to make it easier to read the final HTML.
    // It also fills the `$children` property.
    private sortCellsAndAddChildren() {
        this.cells = this.cells.sort(compare);
    }

    numberOfColumns(): number {
        let max = 0;
        this.cells.forEach(c => (max = Math.max(max, c.column + c.columnSpan)));
        return max;
    }

    numberOfRows(): number {
        let max = 0;
        this.cells.forEach(cell => (max = Math.max(max, cell.row + cell.rowSpan)));
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
    return box.kind === "GridBox"; //  box instanceof GridBox;
}
