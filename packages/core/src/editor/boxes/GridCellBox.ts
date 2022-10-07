import { makeObservable, observable } from "mobx";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util/index";
import { Box } from "./Box";
import { getContextMenuOptions, MenuItem, MenuOptionsType } from "../util";
import { Language } from "../../language";

// TODO state in every box which element we assume to be getting as param, e.g. is the element in a GridCellBox the same as in the corresponding GridBox?
export class GridCellBox extends Box {
    row: number = 1;
    column: number = 1;
    private $content: Box = null;
    isHeader: boolean = false;
    rowSpan?: number;
    columnSpan?: number;
    kind: string = "GridCellBox";
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    constructor(element: PiElement, propertyName: string, role: string, row: number, column: number, box: Box, initializer?: Partial<GridCellBox>) {
        super(element, role);
        this.row = row;
        this.column = column;
        this.propertyName = propertyName;
        this.$content = box;
        if (!!box) {
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

        this.conceptName = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName)?.type;
        if (!this.conceptName) { // try the parent
            this.conceptName = Language.getInstance().classifierProperty(element.piOwner().piLanguageConcept(), propertyName)?.type;
        }
        console.log('table cell for property ' + propertyName+ ' of '+ element.piLanguageConcept() + ": " + this.conceptName );
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

    options(type: MenuOptionsType): MenuItem[] {
        return getContextMenuOptions(this.conceptName, this.element, this.propertyName, type);
    }
}
