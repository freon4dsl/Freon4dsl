import { makeObservable, observable } from "mobx";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util/index";
import { Box } from "./Box";

// TODO state in every box which element we assume to be getting as param, e.g. is the element in a GridCellBox the same as in the corresponding GridBox?
export class GridCellBox extends Box  {
    row: number = 1;
    column: number = 1;
    private $content: Box = null;
    isHeader: boolean = false;
    rowSpan?: number;
    columnSpan?: number;
    kind: string = "GridCellBox";

    constructor(element: PiElement, role: string, row: number, column: number, box: Box, initializer?: Partial<GridCellBox>) {
        super(element, role);
        this.row = row;
        this.column = column;
        this.$content = box;
        if(!!box){
            box.parent = this;
        }
        PiUtils.initializeObject(this, initializer);
        makeObservable<GridCellBox, "$content">(this, {
            $content: observable,
            row: observable,
            column: observable,
            isHeader: observable
        });
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
    }

    get children(): ReadonlyArray<Box> {
        return [this.$content];
    }

}
