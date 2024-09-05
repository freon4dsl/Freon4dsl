import { FreNode } from "../../ast";
import { FreUtils } from "../../util";
import { Box } from "./Box";

// TODO state in every box which element we assume to be getting as param, e.g. is the element in a GridCellBox the same as in the corresponding GridBox?
export class GridCellBox extends Box {
    row: number = 1;
    column: number = 1;
    private $content: Box = null;
    isHeader: boolean = false;
    rowSpan?: number;
    columnSpan?: number;
    kind: string = "GridCellBox";

    constructor(
        node: FreNode,
        role: string,
        row: number,
        column: number,
        box: Box,
        initializer?: Partial<GridCellBox>,
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.row = row;
        this.column = column;
        this.content = box;
        if (!!box) {
            box.parent = this;
        }
        this.selectable = false;
    }

    get content(): Box {
        return this.$content;
    }

    set content(b: Box) {
        if (!!this.$content) {
            this.$content.parent = null;
        }
        this.$content = b;
        if (!!b) {
            b.parent = this;
        }
        this.isDirty();
    }

    get children(): ReadonlyArray<Box> {
        return [this.$content];
    }
}
