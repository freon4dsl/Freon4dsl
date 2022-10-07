import { makeObservable, observable } from "mobx";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util/index";
import { Box } from "./Box";
import { MenuItem } from "../util";

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

    getSiblings(): Box[] { // todo do we need a ReadOnlyArray here?
        return this.parent.getSiblings(this);
    }

    options() {
        // todo implement this
        const submenuItems: MenuItem[] = [
            new MenuItem("Subclass1", "Alt+X", (e: PiElement) => console.log("Subclass1 chosen..." + e)),
            new MenuItem("Subclass2", "", (e: PiElement) => console.log("Subclass2 chosen..." + e)),
            new MenuItem("Subclass3", "", (e: PiElement) => console.log("Subclass3 chosen..." + e)),
            new MenuItem("Subclass4", "", (e: PiElement) => console.log("Subclass4 chosen..." + e))
        ];
        const items: MenuItem[] = [
            new MenuItem( 'Add before', 'Ctrl+A"', (e: PiElement) => {}, submenuItems),
            new MenuItem( 'Add after', 'Ctrl+I"', (e: PiElement) => {}, submenuItems),
            new MenuItem( 'Delete', '', (e: PiElement) => console.log('Deleting ' + e)),
            new MenuItem( '---', '', (e: PiElement) => {}),
            new MenuItem( 'Cut', '', (e: PiElement) => console.log('Cut...' + e)),
            new MenuItem( 'Copy', '', (e: PiElement) => console.log('Copy...' + e)),
            new MenuItem( 'Paste before', '', (e: PiElement) => console.log('Paste before...' + e)),
            new MenuItem( 'Paste after', '', (e: PiElement) => console.log('Paste after...' + e)),
        ];
        return items;
    }
}
