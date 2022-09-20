import { observable, makeObservable } from "mobx";
import { GridCellBox } from "./GridCellBox";

import { Box } from "./internal";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util";

export type GridOrientation = "neutral" | "row" | "column";

export class GridBox extends Box {
    readonly kind = "GridBox";
    cells: GridCellBox[] = [];
    private $children: Box[] = []; // TODO question: why is this prop needed, what is the difference with cells?
    orientation: GridOrientation = "neutral";
    trueList: boolean; // TODO trueList is a temp hack to distinguish list properties from the model from layout grids
    hasHeaders: boolean = false; // indication whether this grid has a header row/colum

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
        makeObservable<GridBox, "$children">(this, {
            $children: observable,
            cells: observable
        });
    }

    get children(): ReadonlyArray<Box> {
        return this.$children;
    }

    // Sorting is done to make it easier to read the final HTML.
    // It also fills the `$children` property.
    private sortCellsAndAddChildren() {
        this.cells = this.cells.sort(compare);
        this.cells.forEach(cell => {
            this.addChild(cell);
        });
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

    private addChild(child: GridCellBox) {
        if (!!child) {
            this.$children.push(child);
            child.parent = this;
        }
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

export function isTableBox(box: Box): box is GridBox {
    return box.kind === "GridBox" && (box as GridBox).trueList; //  box instanceof GridBox;
}
