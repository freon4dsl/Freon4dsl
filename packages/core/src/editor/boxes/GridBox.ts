import { observable, makeObservable } from "mobx";
import { PiStyle } from "../PiStyle";

import { Box } from "./internal";
import { PiElement } from "../../language";
import { PiUtils } from "../../util";

export type GridCell = {
    row: number;
    column: number;
    box: Box;
    rowSpan?: number;
    columnSpan?: number;
    style?: PiStyle;
};

export class GridBox extends Box {
    readonly kind = "GridBox";
    cells: GridCell[];
    private $children: Box[] = [];

    constructor(exp: PiElement, role: string, cells: GridCell[], initializer?: Partial<GridBox>) {
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
            $children: observable
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
            this.addChild(cell.box);
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

    private addChild(child: Box) {
        if (!!child) {
            this.$children.push(child);
            child.parent = this;
        }
    }
}

function compare(a: GridCell, b: GridCell): number {
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
