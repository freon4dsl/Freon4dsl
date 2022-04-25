import { makeObservable, observable } from "mobx";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util/index";
import { Box } from "./Box";

export class GridCellBox extends Box  {
    row: number = 1;
    column: number = 1;
    private $box: Box = null;
    rowSpan?: number;
    columnSpan?: number;
    kind: string = "GridCellBox";

    constructor(element: PiElement, role: string, row, column: number, box: Box, initializer?: Partial<GridCellBox>) {
        super(element, role);
        this.row = row;
        this.column = column;
        this.$box = box;
        if(!!box){
            box.parent = this;
        }
        PiUtils.initializeObject(this, initializer);
        makeObservable<GridCellBox, "$box">(this, {
            $box: observable,
            row: observable,
            column: observable
        });
        this.selectable = false;
    }

    get box(): Box {
        return this.$box;
    }

    set box(b: Box) {
        if (!!this.$box) {
            this.$box.parent = null;
        }
        this.$box = b;
        if (!!b) {
            b.parent = this;
        }
    }

    get children(): ReadonlyArray<Box> {
        return [this.$box];
    }

}
