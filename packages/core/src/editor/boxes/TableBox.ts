import { Box } from "./Box";
import { PiElement } from "../../ast";
import { PiUtils } from "../../util";
import { TableCellBox } from "./TableCellBox";
import { ElementBox } from "./ElementBox";
import { TableRowBox } from "./TableRowBox";
// todo factor out the methods common with ListBox

export enum TableDirection {
    HORIZONTAL = "Row",
    VERTICAL = "Column"
}

/**
 * A TableBox shows a list in the PiElement model as table. Therefore, we know
 * that every row or column, depending on the orientation, represents a single element in the
 * list.
 */
export abstract class TableBox extends Box {
    protected direction: TableDirection = TableDirection.HORIZONTAL;
    protected _children: Box[] = [];
    protected hasHeaders: boolean = false;

    protected constructor(element: PiElement, role: string, hasHeaders: boolean, children?: Box[], initializer?: Partial<TableBoxRowOriented>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        if (children) {
            children.forEach(b => this.addChild(b));
        }
        this.hasHeaders = hasHeaders;
    }

    get cells(): TableCellBox[] {
        const _cells: TableCellBox[] = []
        this._children.forEach(ch => {
            if (ch instanceof ElementBox) {
                const rowBox = ch.content;
                if (rowBox instanceof TableRowBox) {
                    _cells.push(...rowBox.cells)
                }
            }
        })
        return _cells;
    }

    numberOfRows(): number {
        return 0;
    }

    numberOfColumns(): number {
        return 0;
    }

    get children(): ReadonlyArray<Box> {
        return this._children as ReadonlyArray<Box>;
    }

    replaceChildren(children: Box[]): TableBox {
        this._children.splice(0, this._children.length);
        if (!!children) {
            children.forEach((child) => {
                if (!!child) {
                    this._children.push(child);
                    child.parent = this;
                }
            });
        }
        // console.log("List replaceChildren dirty " + this.role)
        this.isDirty();
        return this;
    }

    clearChildren(): void {
        const dirty = (this._children.length !== 0);
        this._children.splice(0, this._children.length);
        if (dirty) {
            // console.log("List clearChildren dirty " + this.role)
            this.isDirty();
        }
    }

    addChild(child: Box | null): TableBox {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
            // console.log("List addChild dirty " + this.role)
            this.isDirty();
        }
        return this;
    }

    insertChild(child: Box | null): TableBox {
        if (!!child) {
            this._children.splice(0, 0, child);
            child.parent = this;
            // console.log("List insertChild dirty " + this.role)
            this.isDirty();
        }
        return this;
    }

    addChildren(children?: Box[]): TableBox {
        if (!!children) {
            children.forEach(child => this.addChild(child));
            // console.log("List addChildren dirty")
            this.isDirty();
        }
        return this;
    }

    nextSibling(box: Box): Box | null {
        const index = this.children.indexOf(box);
        if (index !== -1) {
            if (index + 1 < this.children.length) {
                return this.children[index + 1];
            }
        }
        return null;
    }

    previousSibling(box: Box): Box | null {
        const index = this.children.indexOf(box);
        if (index > 0) {
            return this.children[index - 1];
        }
        return null;
    }

    toString() {
        let result: string = "List: " + this.role + " " + this.direction.toString() + "<";
        for (const child of this.children) {
            result += "\n    " + child.toString();
        }
        result += ">";
        return result;
    }
}

export class TableBoxRowOriented extends TableBox {
    kind = "TableBoxRowOriented";

    constructor(element: PiElement, role: string, hasHeaders: boolean, children?: (Box | null)[], initializer?: Partial<TableBoxRowOriented>) {
        super(element, role, hasHeaders, children, initializer);
        this.direction = TableDirection.HORIZONTAL;
    }
}

export class TableBoxColumnOriented extends TableBox {
    kind = "TableBoxColumnOriented";

    constructor(element: PiElement, role: string, hasHeaders: boolean, children?: Box[], initializer?: Partial<TableBoxRowOriented>) {
        super(element, role, hasHeaders, children, initializer);
        this.direction = TableDirection.VERTICAL;
    }
}

export function isRowBox(b: Box): b is TableBoxRowOriented {
    return b.kind === "TableBoxRowOriented";
}

export function isColumnBox(b: Box): b is TableBoxColumnOriented {
    return b.kind === "TableBoxColumnOriented";
}

export function isTableBox(box: Box): box is TableBox {
    return isRowBox(box) || isColumnBox(box);
}
